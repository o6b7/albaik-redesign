import { Text, View, useColorScheme } from 'react-native';

/** Compact dashboard metric: icon, big value, small label. */
export function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
        borderRadius: 16,
        padding: 16,
      }}
    >
      {icon}
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color: isDark ? '#F5F5F5' : '#111',
          marginTop: 10,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: isDark ? '#888' : '#999', marginTop: 2 }}>{label}</Text>
    </View>
  );
}
