import { Text, View, useColorScheme } from 'react-native';

/** Centered icon-circle + title + subtitle for empty lists. */
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#888' : '#999' }}>
        {title}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#555' : '#bbb',
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
