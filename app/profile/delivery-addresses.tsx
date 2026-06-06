import { useUserCollection } from '@/hooks/useUserCollection';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Check,
  Home,
  MapPin,
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

interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const LABEL_CONFIG = {
  Home: { Icon: Home, bg: '#FFF0EE', color: '#C0392B' },
  Work: { Icon: Briefcase, bg: '#EEF0FF', color: '#3B5998' },
  Other: { Icon: MapPin, bg: '#F0FFF4', color: '#2D8B4E' },
} as const;

const emptyForm = {
  label: 'Home' as const,
  street: '',
  city: '',
  state: '',
  zipCode: '',
  isDefault: false,
};

export default function DeliveryAddressesScreen() {
  const { data: addresses, loading, add, update, remove, clearDefault } =
    useUserCollection<Address>('addresses');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      isDefault: addr.isDefault,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.street.trim() || !form.city.trim()) {
      Alert.alert('Missing Fields', 'Please fill in at least the street and city.');
      return;
    }
    setSaving(true);
    try {
      const shouldBeDefault = addresses.length === 0 || form.isDefault;
      if (shouldBeDefault) await clearDefault(editingId ?? undefined);

      const data = {
        label: form.label,
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        isDefault: shouldBeDefault,
      };

      if (editingId) {
        await update(editingId, data);
      } else {
        await add(data as Omit<Address, 'id'>);
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (addr: Address) => {
    Alert.alert('Delete Address', `Remove your ${addr.label} address?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove(addr.id),
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAFAFA]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C0392B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center"
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
        <Text className="text-lg font-bold text-[#1a1a1a]">
          Delivery Addresses
        </Text>
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
        {addresses.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-20 h-20 rounded-full bg-[#FFF0EE] items-center justify-center mb-4">
              <MapPin size={36} color="#C0392B" />
            </View>
            <Text className="text-lg font-bold text-[#333] mb-1">
              No addresses yet
            </Text>
            <Text className="text-sm text-[#999] text-center px-10">
              Add your delivery address to get your orders delivered quickly.
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
              <Text className="text-white font-bold ml-2">Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4 mt-2">
            {addresses.map((addr) => {
              const cfg = LABEL_CONFIG[addr.label];
              const LabelIcon = cfg.Icon;
              return (
                <View
                  key={addr.id}
                  className="bg-white rounded-2xl p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <LabelIcon size={22} color={cfg.color} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-bold text-[#333]">
                            {addr.label}
                          </Text>
                          {addr.isDefault && (
                            <View className="bg-[#FFF0EE] px-2 py-0.5 rounded-full">
                              <Text className="text-[10px] font-bold text-[#C0392B]">
                                DEFAULT
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-[#777] mt-1">
                          {addr.street}
                        </Text>
                        <Text className="text-sm text-[#777]">
                          {[addr.city, addr.state, addr.zipCode]
                            .filter(Boolean)
                            .join(', ')}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => openEdit(addr)}
                        className="w-9 h-9 rounded-full bg-[#F5F5F5] items-center justify-center"
                      >
                        <Pencil size={14} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(addr)}
                        className="w-9 h-9 rounded-full bg-[#FFF0EE] items-center justify-center"
                      >
                        <Trash2 size={14} color="#C0392B" />
                      </TouchableOpacity>
                    </View>
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
        <SafeAreaView className="flex-1 bg-[#FAFAFA]">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-[#1a1a1a]">
                {editingId ? 'Edit Address' : 'New Address'}
              </Text>
              <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
              {/* Label Selector */}
              <Text className="text-xs font-semibold text-[#999] uppercase tracking-wider mt-6 mb-3 ml-1">
                Address Label
              </Text>
              <View className="flex-row gap-3 mb-6">
                {(['Home', 'Work', 'Other'] as const).map((label) => {
                  const isSelected = form.label === label;
                  const cfg = LABEL_CONFIG[label];
                  const LabelIcon = cfg.Icon;
                  return (
                    <TouchableOpacity
                      key={label}
                      onPress={() => setForm({ ...form, label })}
                      className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                      style={{
                        backgroundColor: isSelected ? cfg.bg : '#fff',
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected ? cfg.color : '#E8E8E8',
                      }}
                    >
                      <LabelIcon size={16} color={isSelected ? cfg.color : '#999'} />
                      <Text
                        className="ml-1.5 font-semibold text-sm"
                        style={{ color: isSelected ? cfg.color : '#999' }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Fields */}
              <View className="gap-4">
                <Field
                  label="Street Address"
                  value={form.street}
                  onChangeText={(t) => setForm({ ...form, street: t })}
                  placeholder="123 Main Street"
                />
                <Field
                  label="City"
                  value={form.city}
                  onChangeText={(t) => setForm({ ...form, city: t })}
                  placeholder="Riyadh"
                />
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Field
                      label="State / Region"
                      value={form.state}
                      onChangeText={(t) => setForm({ ...form, state: t })}
                      placeholder="Region"
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Zip Code"
                      value={form.zipCode}
                      onChangeText={(t) => setForm({ ...form, zipCode: t })}
                      placeholder="12345"
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
                <Text className="text-sm font-medium text-[#555]">
                  Set as default delivery address
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
                      {editingId ? 'Update Address' : 'Save Address'}
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
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View>
      <Text className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-2 ml-1">
        {label}
      </Text>
      <View
        className="bg-white rounded-2xl px-4 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <TextInput
          className="text-base text-[#333] font-medium"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ccc"
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
}
