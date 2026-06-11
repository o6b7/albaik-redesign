import { auth } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { signOut } from 'firebase/auth';
import { LogOut, Moon, Sun } from 'lucide-react-native';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Shared settings screen body used by all three role portals. Extra sections
 * (e.g. the customer's legal links) render between Appearance and Log Out via
 * `children`.
 */
export function SettingsScreen({
  versionLabel,
  children,
}: {
  versionLabel: string;
  children?: React.ReactNode;
}) {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const clearUser = useAuthStore((state) => state.clearUser);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
        <SettingsSectionHeader label="Appearance" isDark={isDark} />
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
            {isDark ? <Moon size={20} color="#A78BFA" /> : <Sun size={20} color="#F59E0B" />}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: isDark ? '#E0E0E0' : '#222' }}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#D4D4D4', true: '#C0392B' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {children}

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
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#C0392B', marginLeft: 8 }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 12, color: isDark ? '#444' : '#C8C8C8' }}>
          {versionLabel}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SettingsSectionHeader({ label, isDark }: { label: string; isDark: boolean }) {
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
