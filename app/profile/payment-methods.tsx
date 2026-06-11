import { useUserCollection } from '@/hooks/useUserCollection';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaymentMethod } from '@/lib/types';

const CARD_COLORS: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  other: '#333',
};

function detectCardType(number: string): PaymentMethod['cardType'] {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  return 'other';
}

function formatCardNumber(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function maskCardNumber(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.length < 4) return cleaned;
  return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${cleaned.slice(-4)}`;
}

const emptyForm = {
  cardholderName: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cardType: 'other' as PaymentMethod['cardType'],
  isDefault: false,
};

export default function PaymentMethodsScreen() {
  const { data: methods, loading, add, update, remove, clearDefault } =
    useUserCollection<PaymentMethod>('paymentMethods');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setForm({
      cardholderName: m.cardholderName,
      cardNumber: m.cardNumber,
      expiryMonth: m.expiryMonth,
      expiryYear: m.expiryYear,
      cardType: m.cardType,
      isDefault: m.isDefault,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const cleaned = form.cardNumber.replace(/\s/g, '');
    if (!form.cardholderName.trim() || cleaned.length < 13) {
      Alert.alert('Missing Fields', 'Please enter a valid name and card number.');
      return;
    }
    if (!form.expiryMonth || !form.expiryYear || +form.expiryMonth < 1 || +form.expiryMonth > 12) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date.');
      return;
    }

    setSaving(true);
    try {
      const shouldBeDefault = methods.length === 0 || form.isDefault;
      if (shouldBeDefault) await clearDefault(editingId ?? undefined);

      const cardType = detectCardType(cleaned);
      const data = {
        cardholderName: form.cardholderName.trim(),
        cardNumber: cleaned,
        expiryMonth: form.expiryMonth.padStart(2, '0'),
        expiryYear: form.expiryYear,
        cardType,
        isDefault: shouldBeDefault,
      };

      if (editingId) {
        await update(editingId, data);
      } else {
        await add(data as Omit<PaymentMethod, 'id'>);
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (m: PaymentMethod) => {
    Alert.alert('Delete Card', `Remove card ending in ${m.cardNumber.slice(-4)}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(m.id) },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C0392B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#2A2A2A] items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#1a1a1a] dark:text-white">Payment Methods</Text>
        <TouchableOpacity
          onPress={openAdd}
          className="w-10 h-10 rounded-full bg-[#C0392B] items-center justify-center"
          style={{
            shadowColor: '#C0392B',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {methods.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-20 h-20 rounded-full bg-[#FFF0EE] items-center justify-center mb-4">
              <CreditCard size={36} color="#C0392B" />
            </View>
            <Text className="text-lg font-bold text-[#333] dark:text-white mb-1">No payment methods</Text>
            <Text className="text-sm text-[#999] dark:text-[#777] text-center px-10">
              Add a payment method for faster checkout.
            </Text>
            <TouchableOpacity
              onPress={openAdd}
              className="mt-6 flex-row items-center bg-[#C0392B] px-6 py-3 rounded-full"
              style={{
                shadowColor: '#C0392B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Plus size={18} color="#fff" />
              <Text className="text-white font-bold ml-2">Add Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-5 mt-2">
            {methods.map((method) => {
              const bgColor = CARD_COLORS[method.cardType];
              return (
                <View key={method.id}>
                  {/* Card Visual */}
                  <View
                    className="rounded-2xl p-5 h-48 justify-between"
                    style={{
                      backgroundColor: bgColor,
                      shadowColor: bgColor,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 14,
                      elevation: 8,
                    }}
                  >
                    <View className="flex-row justify-between items-start">
                      <View>
                        {method.isDefault && (
                          <View className="bg-white/20 px-2.5 py-1 rounded-full mb-1">
                            <Text className="text-[10px] font-bold text-white">
                              DEFAULT
                            </Text>
                          </View>
                        )}
                        <Text className="text-white/60 text-xs font-medium mt-1">
                          {method.cardType.toUpperCase()}
                        </Text>
                      </View>
                      <CreditCard size={28} color="rgba(255,255,255,0.5)" />
                    </View>

                    <Text className="text-white text-xl" style={{ letterSpacing: 3 }}>
                      {maskCardNumber(method.cardNumber)}
                    </Text>

                    <View className="flex-row justify-between items-end">
                      <View>
                        <Text className="text-white/50 text-[10px] font-medium mb-0.5">
                          CARD HOLDER
                        </Text>
                        <Text className="text-white text-sm font-bold">
                          {method.cardholderName.toUpperCase()}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-white/50 text-[10px] font-medium mb-0.5">
                          EXPIRES
                        </Text>
                        <Text className="text-white text-sm font-bold">
                          {method.expiryMonth}/{method.expiryYear}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row justify-end gap-2 mt-2 px-1">
                    <TouchableOpacity
                      onPress={() => openEdit(method)}
                      className="flex-row items-center bg-white dark:bg-[#2A2A2A] px-4 py-2 rounded-full"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Pencil size={13} color="#666" />
                      <Text className="text-xs font-semibold text-[#666] ml-1.5">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(method)}
                      className="flex-row items-center bg-[#FFF0EE] px-4 py-2 rounded-full"
                    >
                      <Trash2 size={13} color="#C0392B" />
                      <Text className="text-xs font-semibold text-[#C0392B] ml-1.5">
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#F0F0F0] dark:border-[#3A3A3A]">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-[#1a1a1a] dark:text-white">
                {editingId ? 'Edit Card' : 'New Card'}
              </Text>
              <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
              {/* Live Card Preview */}
              <View
                className="rounded-2xl p-5 h-44 justify-between mt-6 mb-6"
                style={{
                  backgroundColor: CARD_COLORS[detectCardType(form.cardNumber)],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.2,
                  shadowRadius: 14,
                  elevation: 8,
                }}
              >
                <View className="flex-row justify-between items-start">
                  <Text className="text-white/60 text-xs font-medium">
                    {detectCardType(form.cardNumber).toUpperCase()}
                  </Text>
                  <CreditCard size={28} color="rgba(255,255,255,0.5)" />
                </View>
                <Text className="text-white text-xl" style={{ letterSpacing: 3 }}>
                  {form.cardNumber
                    ? formatCardNumber(form.cardNumber)
                    : '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022'}
                </Text>
                <View className="flex-row justify-between items-end">
                  <Text className="text-white/80 text-sm font-medium">
                    {form.cardholderName || 'YOUR NAME'}
                  </Text>
                  <Text className="text-white/80 text-sm font-medium">
                    {form.expiryMonth && form.expiryYear
                      ? `${form.expiryMonth}/${form.expiryYear}`
                      : 'MM/YY'}
                  </Text>
                </View>
              </View>

              {/* Form */}
              <View className="gap-4">
                <Field
                  label="Cardholder Name"
                  value={form.cardholderName}
                  onChangeText={(t) => setForm({ ...form, cardholderName: t })}
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
                <Field
                  label="Card Number"
                  value={formatCardNumber(form.cardNumber)}
                  onChangeText={(t) =>
                    setForm({ ...form, cardNumber: t.replace(/\D/g, '').slice(0, 16) })
                  }
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                />
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Field
                      label="Month"
                      value={form.expiryMonth}
                      onChangeText={(t) =>
                        setForm({ ...form, expiryMonth: t.replace(/\D/g, '').slice(0, 2) })
                      }
                      placeholder="MM"
                      keyboardType="number-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Year"
                      value={form.expiryYear}
                      onChangeText={(t) =>
                        setForm({ ...form, expiryYear: t.replace(/\D/g, '').slice(0, 2) })
                      }
                      placeholder="YY"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Default Toggle */}
              <TouchableOpacity
                onPress={() => setForm({ ...form, isDefault: !form.isDefault })}
                className="flex-row items-center mt-6 mb-4"
              >
                <View
                  className="w-6 h-6 rounded-lg mr-3 items-center justify-center"
                  style={{
                    backgroundColor: form.isDefault ? '#C0392B' : '#fff',
                    borderWidth: form.isDefault ? 0 : 1.5,
                    borderColor: '#D0D0D0',
                  }}
                >
                  {form.isDefault && <Check size={14} color="#fff" />}
                </View>
                <Text className="text-sm font-medium text-[#555] dark:text-[#999]">
                  Set as default payment method
                </Text>
              </TouchableOpacity>

              {/* Save */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-row items-center justify-center py-4 rounded-2xl mt-4 mb-10"
                style={{
                  backgroundColor: saving ? '#E0E0E0' : '#C0392B',
                  shadowColor: '#C0392B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: saving ? 0 : 0.3,
                  shadowRadius: 12,
                  elevation: saving ? 0 : 6,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" />
                    <Text className="text-white text-base font-bold ml-2">
                      {editingId ? 'Update Card' : 'Save Card'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <View>
      <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-2 ml-1">
        {label}
      </Text>
      <View
        className="bg-white dark:bg-[#2A2A2A] rounded-2xl px-4 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <TextInput
          className="text-base text-[#333] dark:text-[#E0E0E0] font-medium"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ccc"
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
        />
      </View>
    </View>
  );
}
