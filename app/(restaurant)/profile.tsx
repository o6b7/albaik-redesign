import { StatCard } from '@/components/ui/StatCard';
import { RESTAURANT_ADDRESS, RESTAURANT_NAME } from '@/constants/delivery';
import { isToday } from '@/lib/format';
import { useAuthStore } from '@/store/auth-store';
import { useRestaurantOrders } from '@/store/restaurant-store';
import { ClipboardList, Store, TrendingUp } from 'lucide-react-native';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestaurantProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isDark = useColorScheme() === 'dark';
  const { orders, incoming, preparing, ready } = useRestaurantOrders();

  const ordersToday = orders.filter((o) => isToday(o.createdAt)).length;
  const revenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  const inProgress = incoming.length + preparing.length + ready.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
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
            <Store size={36} color="#fff" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: isDark ? '#F5F5F5' : '#111',
              marginTop: 14,
            }}
          >
            {RESTAURANT_NAME}
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#888' : '#777', marginTop: 2 }}>
            {RESTAURANT_ADDRESS}
          </Text>
          {user?.email && (
            <Text style={{ fontSize: 12, color: isDark ? '#666' : '#aaa', marginTop: 4 }}>
              {user.email}
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12 }}>
          <StatCard
            icon={<TrendingUp size={20} color="#10B981" />}
            value={`$${revenue.toFixed(0)}`}
            label="Delivered revenue"
          />
          <StatCard
            icon={<ClipboardList size={20} color="#3B82F6" />}
            value={`${ordersToday}`}
            label="Orders today"
          />
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <StatCard
            icon={<Store size={20} color="#F59E0B" />}
            value={`${inProgress}`}
            label="In the pipeline right now"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
