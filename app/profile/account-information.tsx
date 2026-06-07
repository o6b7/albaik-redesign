import { auth, db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { router } from 'expo-router';
import {
  signInWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Pencil,
  Phone,
  User,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountData {
  fullName: string;
  email: string;
  phone: string;
}

export default function AccountInformationScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isDark = useColorScheme() === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AccountData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [original, setOriginal] = useState<AccountData>({
    fullName: '',
    email: '',
    phone: '',
  });

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const accountData: AccountData = {
          fullName: data.fullName || user.fullName,
          email: data.email || user.email,
          phone: data.phone || '',
        };
        setForm(accountData);
        setOriginal(accountData);
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      // Fallback to store data
      const fallback = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
      };
      setForm(fallback);
      setOriginal(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      setUser({
        ...user,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      setOriginal(form);
      setEditing(false);
    } catch (error) {
      console.error('Error saving account data:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(original);
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      if (!user) throw new Error('No user');

      // Sign in fresh to ensure we have a valid currentUser
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        user.email,
        currentPassword
      );
      await updatePassword(firebaseUser, newPassword);

      Alert.alert('Success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Current password is incorrect.');
      } else {
        Alert.alert('Error', 'Failed to change password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const hasChanges =
    form.fullName !== original.fullName || form.phone !== original.phone;

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
            <ArrowLeft size={20} color={isDark ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#1a1a1a] dark:text-white">
            Account Information
          </Text>
          {!editing ? (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#2A2A2A] items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Pencil size={18} color="#C0392B" />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Profile Avatar */}
          <View className="items-center mt-4 mb-8">
            <View
              className="w-24 h-24 rounded-full bg-[#C0392B] items-center justify-center"
              style={{
                shadowColor: '#C0392B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-white text-3xl font-bold">
                {form.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="gap-5">
            <InputField
              label="Full Name"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              editable={editing}
              icon={<User size={18} color={editing ? '#C0392B' : (isDark ? '#777' : '#999')} />}
              iconBg={editing ? (isDark ? '#3A1A1A' : '#FFF0EE') : (isDark ? '#333' : '#F0F0F0')}
              placeholder="Enter your full name"
              isDark={isDark}
            />

            <View>
              <InputField
                label="Email Address"
                value={form.email}
                onChangeText={() => {}}
                editable={false}
                icon={<Mail size={18} color={isDark ? '#777' : '#999'} />}
                iconBg={isDark ? '#333' : '#F0F0F0'}
                placeholder="Email address"
                dimmed
                isDark={isDark}
              />
              <Text className="text-xs text-[#bbb] dark:text-[#666] mt-1 ml-1">
                Email cannot be changed
              </Text>
            </View>

            <InputField
              label="Phone Number"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              editable={editing}
              icon={<Phone size={18} color={editing ? '#C0392B' : (isDark ? '#777' : '#999')} />}
              iconBg={editing ? (isDark ? '#3A1A1A' : '#FFF0EE') : (isDark ? '#333' : '#F0F0F0')}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              isDark={isDark}
            />
          </View>

          {/* Save/Cancel Buttons */}
          {editing && (
            <View className="mt-8 gap-3">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving || !hasChanges}
                className="flex-row items-center justify-center py-4 rounded-2xl"
                style={{
                  backgroundColor: saving || !hasChanges ? (isDark ? '#333' : '#E0E0E0') : '#C0392B',
                  shadowColor: '#C0392B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: saving || !hasChanges ? 0 : 0.3,
                  shadowRadius: 12,
                  elevation: saving || !hasChanges ? 0 : 6,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" />
                    <Text className="text-white text-base font-bold ml-2">
                      Save Changes
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                className="items-center py-4 rounded-2xl bg-white dark:bg-[#2A2A2A]"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-[#999] dark:text-[#777] text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Password Section */}
          <View className="mt-8 mb-10">
            <TouchableOpacity
              onPress={() => setShowPasswordSection(!showPasswordSection)}
              className="flex-row items-center bg-white dark:bg-[#2A2A2A] rounded-2xl px-4 py-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View className="w-10 h-10 rounded-xl bg-[#FFF0EE] dark:bg-[#3A1A1A] items-center justify-center mr-3">
                <Lock size={18} color="#C0392B" />
              </View>
              <Text className="flex-1 text-base font-semibold text-[#333] dark:text-[#E0E0E0]">
                Change Password
              </Text>
              <ArrowLeft
                size={16}
                color="#999"
                style={{
                  transform: [{ rotate: showPasswordSection ? '90deg' : '-90deg' }],
                }}
              />
            </TouchableOpacity>

            {showPasswordSection && (
              <View className="mt-4 gap-4">
                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  showPassword={showCurrentPw}
                  toggleShow={() => setShowCurrentPw(!showCurrentPw)}
                  isDark={isDark}
                />
                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  showPassword={showNewPw}
                  toggleShow={() => setShowNewPw(!showNewPw)}
                  isDark={isDark}
                />
                <View>
                  <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-2 ml-1">
                    Confirm New Password
                  </Text>
                  <View
                    className="flex-row items-center bg-white dark:bg-[#2A2A2A] rounded-2xl px-4 py-4"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <TextInput
                      className="flex-1 text-base text-[#333] dark:text-[#E0E0E0] font-medium"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={isDark ? '#555' : '#ccc'}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword}
                  className="flex-row items-center justify-center py-4 rounded-2xl mt-2"
                  style={{
                    backgroundColor:
                      changingPassword || !currentPassword || !newPassword
                        ? (isDark ? '#333' : '#E0E0E0')
                        : '#C0392B',
                  }}
                >
                  {changingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Lock size={18} color="#fff" />
                      <Text className="text-white text-base font-bold ml-2">
                        Update Password
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  editable,
  icon,
  iconBg,
  placeholder,
  keyboardType,
  dimmed,
  isDark,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  icon: React.ReactNode;
  iconBg: string;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
  dimmed?: boolean;
  isDark?: boolean;
}) {
  return (
    <View>
      <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-2 ml-1">
        {label}
      </Text>
      <View
        className="flex-row items-center bg-white dark:bg-[#2A2A2A] rounded-2xl px-4 py-4"
        style={{
          opacity: dimmed ? 0.6 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </View>
        <TextInput
          className="flex-1 text-base font-medium"
          style={{ color: dimmed ? (isDark ? '#666' : '#999') : (isDark ? '#E0E0E0' : '#333') }}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#555' : '#ccc'}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  showPassword,
  toggleShow,
  isDark,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  showPassword: boolean;
  toggleShow: () => void;
  isDark?: boolean;
}) {
  return (
    <View>
      <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-2 ml-1">
        {label}
      </Text>
      <View
        className="flex-row items-center bg-white dark:bg-[#2A2A2A] rounded-2xl px-4 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <TextInput
          className="flex-1 text-base text-[#333] dark:text-[#E0E0E0] font-medium"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#555' : '#ccc'}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={toggleShow}>
          {showPassword ? (
            <EyeOff size={18} color="#999" />
          ) : (
            <Eye size={18} color="#999" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
