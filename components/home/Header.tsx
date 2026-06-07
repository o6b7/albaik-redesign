import { useAuthStore } from '@/store/auth-store';
import { MapPin } from 'lucide-react-native';
import { Text, View, useColorScheme } from 'react-native';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const isDark = useColorScheme() === 'dark';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <View>
        <Text style={{ fontSize: 13, color: isDark ? '#888' : '#999' }}>
          {greeting}
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: isDark ? '#F5F5F5' : '#111',
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {user?.fullName ?? 'Guest'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#1A1A1A' : '#F3F3F3',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 6,
          gap: 4,
        }}
      >
        <MapPin size={14} color="#C0392B" />
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: isDark ? '#ccc' : '#555',
          }}
        >
          Delivery
        </Text>
      </View>
    </View>
  );
}
