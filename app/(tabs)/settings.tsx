import { auth } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { signOut } from 'firebase/auth';
import {
  ChevronRight,
  FileText,
  LogOut,
  Moon,
  Shield,
  Sun,
} from 'lucide-react-native';
import {
  Alert,
  Linking,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const clearUser = useAuthStore((state) => state.clearUser);

  const toggleDarkMode = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          clearUser();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]">
      <Text className="text-xl font-bold text-center my-8 text-[#1a1a1a] dark:text-white">
        Settings
      </Text>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Appearance */}
        <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-3 ml-1">
          Appearance
        </Text>
        <View
          className="bg-white dark:bg-[#2A2A2A] rounded-2xl mb-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#2C2C3A' : '#FFF8E1' }}
              >
                {isDark ? (
                  <Moon size={20} color="#A78BFA" />
                ) : (
                  <Sun size={20} color="#F59E0B" />
                )}
              </View>
              <View>
                <Text className="text-base font-semibold text-[#333] dark:text-[#E0E0E0]">
                  Dark Mode
                </Text>
                <Text className="text-xs text-[#999] dark:text-[#777] mt-0.5">
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#C0392B' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Legal */}
        <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-3 ml-1">
          Legal
        </Text>
        <View
          className="bg-white dark:bg-[#2A2A2A] rounded-2xl mb-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b border-[#F0F0F0] dark:border-[#3A3A3A]"
            onPress={() =>
              Linking.openURL('https://www.albaik.com/en/terms-conditions')
            }
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#EEF0FF] dark:bg-[#2A2A4A] items-center justify-center mr-3">
                <FileText size={20} color="#3B5998" />
              </View>
              <Text className="text-base font-semibold text-[#333] dark:text-[#E0E0E0]">
                Terms & Conditions
              </Text>
            </View>
            <ChevronRight size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() =>
              Linking.openURL('https://www.albaik.com/en/privacy-policy')
            }
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#F0FFF4] dark:bg-[#1A2E1A] items-center justify-center mr-3">
                <Shield size={20} color="#2D8B4E" />
              </View>
              <Text className="text-base font-semibold text-[#333] dark:text-[#E0E0E0]">
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text className="text-xs font-semibold text-[#999] dark:text-[#777] uppercase tracking-wider mb-3 ml-1">
          Account
        </Text>
        <View
          className="bg-white dark:bg-[#2A2A2A] rounded-2xl mb-8"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-[#FFF0EE] dark:bg-[#3A1A1A] items-center justify-center mr-3">
                <LogOut size={20} color="#C0392B" />
              </View>
              <Text className="text-base font-semibold text-[#C0392B]">
                Log Out
              </Text>
            </View>
            <ChevronRight size={18} color="#C0392B" />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text className="text-center text-xs text-[#BCBCBC] dark:text-[#555]">
          Version {APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
