import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { RESTAURANT_NAME } from '@/constants/delivery';
import { DENSE_TEXT, SCALED_TEXT } from '@/lib/a11y';
import { formatDateTime, minutesAgo, shortId } from '@/lib/format';
import { Order } from '@/store/order-store';
import {
  confirmOrder,
  markFoodReady,
  rejectOrder,
  useRestaurantOrders,
} from '@/store/restaurant-store';
import { useRouter } from 'expo-router';
import {
  Bike,
  Check,
  ChefHat,
  ClipboardList,
  Flame,
  Timer,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Where is the driver, from the kitchen's point of view. */
function driverChip(order: Order): { text: string; color: string } {
  if (!order.driverId) return { text: 'No driver yet', color: '#999' };
  const name = order.driverName ?? 'Driver';
  switch (order.status) {
    case 'accepted':
    case 'driving_to_restaurant':
      return { text: `${name} on the way`, color: '#6366F1' };
    case 'arrived_at_restaurant':
      return { text: `${name} at the counter`, color: '#D97706' };
    default:
      return { text: name, color: '#999' };
  }
}

const HISTORY_BADGES: Record<string, { label: string; color: string }> = {
  meal_collected: { label: 'Picked up', color: '#6366F1' },
  driving_to_customer: { label: 'On the way', color: '#8B5CF6' },
  delivered: { label: 'Delivered', color: '#10B981' },
  cancelled: { label: 'Rejected', color: '#E53E3E' },
};

export default function RestaurantOrdersScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { incoming, preparing, ready, history, loading, error } = useRestaurantOrders();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState('incoming');

  // Re-render every 30s so "x min ago" stays honest.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const openDetails = (order: Order) =>
    router.push(`/restaurant-order/${order.id}` as any);

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
    } catch {
      Alert.alert('Error', 'Could not update the order. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (order: Order) => {
    Alert.alert('Reject order?', `Order ${shortId(order.id)} will be cancelled for the customer.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => run(order.id, () => rejectOrder(order.id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: isDark ? '#F5F5F5' : '#111' }}>
            Kitchen
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 2 }}>
            {RESTAURANT_NAME}
          </Text>
        </View>

        {error && (
          <Text style={{ color: '#E53E3E', paddingHorizontal: 20, marginBottom: 12, fontSize: 13 }}>
            {error}
          </Text>
        )}

        {/* Stage switcher */}
        <SegmentedTabs
          tabs={[
            { key: 'incoming', label: 'New', count: incoming.length, color: '#3B82F6' },
            { key: 'preparing', label: 'Cooking', count: preparing.length, color: '#F59E0B' },
            { key: 'ready', label: 'Ready', count: ready.length, color: '#10B981' },
            { key: 'history', label: 'History' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {loading ? (
          <ActivityIndicator color="#C0392B" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {tab === 'incoming' &&
              (incoming.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList size={28} color={isDark ? '#555' : '#ccc'} />}
                  title="No new orders"
                  subtitle="New orders appear here the moment customers place them."
                />
              ) : (
                <View style={{ paddingHorizontal: 20, gap: 14 }}>
                  {incoming.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isDark={isDark}
                      showItems
                      showTotal
                      onPress={() => openDetails(order)}
                    >
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                        <TouchableOpacity
                          onPress={() => handleReject(order)}
                          disabled={busyId === order.id}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            paddingVertical: 13,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: isDark ? '#3A3A3A' : '#E5E5E5',
                            alignItems: 'center',
                          }}
                        >
                          <Text {...SCALED_TEXT} style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#999' : '#777' }}>
                            Reject
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => run(order.id, () => confirmOrder(order.id))}
                          disabled={busyId === order.id}
                          activeOpacity={0.85}
                          style={{
                            flex: 2,
                            paddingVertical: 13,
                            borderRadius: 12,
                            backgroundColor: '#C0392B',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {busyId === order.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text {...SCALED_TEXT} style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                              Accept Order
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </OrderCard>
                  ))}
                </View>
              ))}

            {tab === 'preparing' &&
              (preparing.length === 0 ? (
                <EmptyState
                  icon={<ChefHat size={28} color={isDark ? '#555' : '#ccc'} />}
                  title="Nothing on the stove"
                  subtitle="Accepted orders show here while the kitchen works."
                />
              ) : (
                <View style={{ paddingHorizontal: 20, gap: 14 }}>
                  {preparing.map((order) => {
                    const chip = driverChip(order);
                    return (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isDark={isDark}
                        showItems
                        onPress={() => openDetails(order)}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            marginTop: 10,
                          }}
                        >
                          <Bike size={13} color={chip.color} />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: chip.color }}>
                            {chip.text}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => run(order.id, () => markFoodReady(order.id))}
                          disabled={busyId === order.id}
                          activeOpacity={0.85}
                          style={{
                            marginTop: 12,
                            paddingVertical: 13,
                            borderRadius: 12,
                            backgroundColor: '#10B981',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {busyId === order.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text {...SCALED_TEXT} style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                              Mark Food Ready
                            </Text>
                          )}
                        </TouchableOpacity>
                      </OrderCard>
                    );
                  })}
                </View>
              ))}

            {tab === 'ready' &&
              (ready.length === 0 ? (
                <EmptyState
                  icon={<Flame size={28} color={isDark ? '#555' : '#ccc'} />}
                  title="Nothing waiting"
                  subtitle="Food that's ready for the driver shows here."
                />
              ) : (
                <View style={{ paddingHorizontal: 20, gap: 14 }}>
                  {ready.map((order) => {
                    const chip = driverChip(order);
                    return (
                      <TouchableOpacity
                        key={order.id}
                        onPress={() => openDetails(order)}
                        activeOpacity={0.85}
                        style={{
                          backgroundColor: isDark ? '#1A1A1A' : '#fff',
                          borderRadius: 18,
                          padding: 16,
                          borderWidth: 1.5,
                          borderColor: '#10B981',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#F5F5F5' : '#111' }}>
                            Order {shortId(order.id)}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: isDark ? '#0E2A1A' : '#ECFDF3',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 8,
                            }}
                          >
                            <Check size={11} color="#10B981" />
                            <Text {...DENSE_TEXT} style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>
                              Ready
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>
                          {order.items.reduce((n, i) => n + i.quantity, 0)} items · {order.customer.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                          <Bike size={13} color={chip.color} />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: chip.color }}>
                            {chip.text}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

            {tab === 'history' &&
              (history.length === 0 ? (
                <EmptyState
                  icon={<Check size={28} color={isDark ? '#555' : '#ccc'} />}
                  title="No past orders"
                  subtitle="Handed-off and completed orders end up here."
                />
              ) : (
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {history.map((order) => {
                    const badge = HISTORY_BADGES[order.status] ?? HISTORY_BADGES.delivered;
                    return (
                      <TouchableOpacity
                        key={order.id}
                        onPress={() => openDetails(order)}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
                          borderRadius: 14,
                          padding: 14,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#E8E8E8' : '#222' }}>
                            Order {shortId(order.id)}
                          </Text>
                          <Text style={{ fontSize: 11, color: isDark ? '#777' : '#999', marginTop: 2 }}>
                            {order.customer.name} · {formatDateTime(order.createdAt)}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 3 }}>
                          <Text {...DENSE_TEXT} style={{ fontSize: 12, fontWeight: '700', color: badge.color }}>
                            {badge.label}
                          </Text>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#ccc' : '#555' }}>
                            ${order.total.toFixed(2)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({
  order,
  isDark,
  showItems,
  showTotal,
  onPress,
  children,
}: {
  order: Order;
  isDark: boolean;
  showItems?: boolean;
  showTotal?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: isDark ? '#1A1A1A' : '#fff',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: isDark ? '#252525' : '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#F5F5F5' : '#111' }}>
          Order {shortId(order.id)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Timer size={12} color={isDark ? '#777' : '#999'} />
          <Text style={{ fontSize: 12, color: isDark ? '#777' : '#999' }}>
            {minutesAgo(order.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777', marginBottom: showItems ? 10 : 0 }}>
        {order.customer.name}
      </Text>

      {showItems && (
        <View style={{ gap: 4 }}>
          {order.items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  minWidth: 24,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: isDark ? '#252525' : '#F2F2F2',
                  alignItems: 'center',
                }}
              >
                <Text {...DENSE_TEXT} style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#ccc' : '#555' }}>
                  {item.quantity}×
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: isDark ? '#E0E0E0' : '#333', flex: 1 }}>
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {showTotal && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#2C2C2C' : '#F0F0F0',
          }}
        >
          <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>Total</Text>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#C0392B' }}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      )}

      {children}
    </TouchableOpacity>
  );
}
