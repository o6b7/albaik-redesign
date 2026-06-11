import { SettingsScreen, SettingsSectionHeader } from '@/components/ui/SettingsScreen';
import { useThemeStore } from '@/store/theme-store';
import { ChevronRight, FileText, Shield } from 'lucide-react-native';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

export default function CustomerSettingsScreen() {
  const isDark = useThemeStore((state) => state.theme) === 'dark';

  return (
    <SettingsScreen versionLabel="Al Baik v1.0.0">
      <SettingsSectionHeader label="Legal" isDark={isDark} />
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
          onPress={() => Linking.openURL('https://www.albaik.com/en/terms-conditions')}
          isDark={isDark}
        />
        <LinkRow
          icon={Shield}
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://www.albaik.com/en/privacy-policy')}
          isDark={isDark}
          border
        />
      </View>
    </SettingsScreen>
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
