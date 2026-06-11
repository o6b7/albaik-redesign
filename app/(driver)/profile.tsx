import { StatCard } from '@/components/ui/StatCard';
import { useAuthStore } from '@/store/auth-store';
import { useDriverOrders } from '@/store/driver-store';
import { Bike, Star, TrendingUp } from 'lucide-react-native';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DriverProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isDark = useColorScheme() === 'dark';
  const { pastOrders } = useDriverOrders();

  const totalEarnings = pastOrders.reduce((sum, o) => sum + (o.earnings ?? 0), 0);

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 24 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: '#C0392B',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700' }}>{initials}</Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: isDark ? '#F5F5F5' : '#111',
              marginTop: 14,
            }}
          >
            {user?.fullName}
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#888' : '#777', marginTop: 2 }}>
            {user?.email}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginTop: 10,
              backgroundColor: isDark ? '#1E1B33' : '#EEF2FF',
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
            }}
          >
            <Bike size={13} color="#6366F1" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366F1' }}>Driver</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20 }}>
          <StatCard
            icon={<TrendingUp size={20} color="#10B981" />}
            value={`${totalEarnings} SAR`}
            label="Total earnings"
          />
          <StatCard
            icon={<Star size={20} color="#F59E0B" />}
            value={`${pastOrders.length}`}
            label="Deliveries"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
