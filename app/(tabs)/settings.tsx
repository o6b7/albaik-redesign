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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: isDark ? '#F5F5F5' : '#111',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          Settings
        </Text>

        {/* Appearance */}
        <SectionHeader label="Appearance" isDark={isDark} />
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            {isDark ? (
              <Moon size={20} color="#A78BFA" />
            ) : (
              <Sun size={20} color="#F59E0B" />
            )}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: isDark ? '#E0E0E0' : '#222',
                }}
              >
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D4D4D4', true: '#C0392B' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Legal */}
        <SectionHeader label="Legal" isDark={isDark} />
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <LinkRow
            icon={FileText}
            label="Terms & Conditions"
            onPress={() =>
              Linking.openURL('https://www.albaik.com/en/terms-conditions')
            }
            isDark={isDark}
          />
          <LinkRow
            icon={Shield}
            label="Privacy Policy"
            onPress={() =>
              Linking.openURL('https://www.albaik.com/en/privacy-policy')
            }
            isDark={isDark}
            border
          />
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.5}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
            }}
          >
            <LogOut size={18} color="#C0392B" />
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#C0392B',
                marginLeft: 8,
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: isDark ? '#444' : '#C8C8C8',
          }}
        >
          Al Baik v{APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: isDark ? '#555' : '#999',
        paddingHorizontal: 20,
        marginBottom: 6,
      }}
    >
      {label}
    </Text>
  );
}

function LinkRow({
  icon: Icon,
  label,
  onPress,
  isDark,
  border,
}: {
  icon: typeof FileText;
  label: string;
  onPress: () => void;
  isDark: boolean;
  border?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: border ? 1 : 0,
        borderTopColor: isDark ? '#252525' : '#EBEBEB',
      }}
    >
      <Icon size={20} color={isDark ? '#888' : '#666'} />
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '500',
          color: isDark ? '#E0E0E0' : '#222',
          marginLeft: 14,
        }}
      >
        {label}
      </Text>
      <ChevronRight size={18} color={isDark ? '#444' : '#ccc'} />
    </TouchableOpacity>
  );
}
