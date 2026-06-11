import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { db } from '@/firebase';
import { formatDateTime, shortId } from '@/lib/format';
import { Order, OrderStatus } from '@/store/order-store';
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Bike,
  CreditCard,
  MapPin,
  Phone,
  User,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  verifying: { label: 'New order', color: '#3B82F6' },
  cooking: { label: 'Preparing', color: '#F59E0B' },
  accepted: { label: 'Driver assigned', color: '#6366F1' },
  driving_to_restaurant: { label: 'Driver en route', color: '#6366F1' },
  arrived_at_restaurant: { label: 'Driver waiting', color: '#D97706' },
  meal_collected: { label: 'Picked up', color: '#8B5CF6' },
  driving_to_customer: { label: 'Out for delivery', color: '#8B5CF6' },
  delivered: { label: 'Delivered', color: '#10B981' },
  cancelled: { label: 'Cancelled', color: '#E53E3E' },
};

export default function RestaurantOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Live — the screen keeps updating if it's open while the order progresses.
  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(
      doc(db, 'orders', id),
      (snap) => {
        setOrder(snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null);
        setLoading(false);
      },
      (e) => {
        console.error('Error listening to order:', e);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#C0392B" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212] items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">Order not found</Text>
        </SafeAreaView>
      </>
    );
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.verifying;

  const timeline = [
    { label: 'Order placed', time: order.createdAt },
    order.acceptedAt ? { label: `Driver accepted${order.driverName ? ` — ${order.driverName}` : ''}`, time: order.acceptedAt } : null,
    order.foodReadyAt ? { label: 'Food marked ready', time: order.foodReadyAt } : null,
    order.deliveredAt ? { label: 'Delivered to customer', time: order.deliveredAt } : null,
    order.cancelledAt ? { label: 'Order rejected', time: order.cancelledAt } : null,
  ]
    .filter((e): e is { label: string; time: string } => !!e)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]" edges={['top']}>
        <ScreenHeader title={`Order ${shortId(order.id)}`} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Status */}
          <View style={{ alignItems: 'center', paddingVertical: 14 }}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: `${meta.color}1A`,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: meta.color }}>
                {meta.label}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: isDark ? '#777' : '#999', marginTop: 8 }}>
              Placed {formatDateTime(order.createdAt)}
            </Text>
          </View>

          {/* Customer */}
          <Card isDark={isDark} title="Customer">
            <Row
              icon={<User size={16} color="#2D8B4E" />}
              text={order.customer.name}
              isDark={isDark}
              bold
            />
            <Row
              icon={<MapPin size={16} color={isDark ? '#888' : '#999'} />}
              text={order.customer.address}
              isDark={isDark}
            />
          </Card>

          {/* Driver */}
          {order.driverName && (
            <Card isDark={isDark} title="Driver">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#8B5CF6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Bike size={17} color="#fff" />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: '700',
                    color: isDark ? '#E8E8E8' : '#222',
                  }}
                >
                  {order.driverName}
                </Text>
                {order.driverPhone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${order.driverPhone}`).catch(() => {})}
                    activeOpacity={0.8}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: isDark ? '#0E2A1A' : '#ECFDF3',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Phone size={16} color="#10B981" />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )}

          {/* Items */}
          <Card isDark={isDark} title={`Items (${order.items.length})`}>
            <View style={{ gap: 10 }}>
              {order.items.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 42, height: 42, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: isDark ? '#E0E0E0' : '#333',
                      }}
                    >
                      {item.quantity}× {item.name}
                    </Text>
                    {item.toppings.length > 0 && (
                      <Text style={{ fontSize: 11, color: isDark ? '#888' : '#999', marginTop: 1 }}>
                        {item.toppings.map((t) => t.name).join(', ')}
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#ccc' : '#555' }}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Payment */}
          <Card isDark={isDark} title="Payment">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <CreditCard size={14} color={isDark ? '#888' : '#999'} />
              <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>
                {order.paymentCardType.toUpperCase()} ···· {order.paymentLast4}
              </Text>
            </View>
            <TotalRow label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} isDark={isDark} />
            <TotalRow label="VAT (15%)" value={`$${order.vat.toFixed(2)}`} isDark={isDark} />
            <View
              style={{
                height: 1,
                backgroundColor: isDark ? '#3A3A3A' : '#F0F0F0',
                marginVertical: 8,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: isDark ? '#fff' : '#1a1a1a' }}>
                Total
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#C0392B' }}>
                ${order.total.toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* Timeline */}
          <Card isDark={isDark} title="Timeline">
            {timeline.map((event, idx) => {
              const isLast = idx === timeline.length - 1;
              return (
                <View key={idx} style={{ flexDirection: 'row' }}>
                  <View style={{ alignItems: 'center', width: 20 }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: isLast ? meta.color : isDark ? '#555' : '#D0D0D0',
                        marginTop: 4,
                      }}
                    />
                    {!isLast && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          backgroundColor: isDark ? '#333' : '#EBEBEB',
                          marginVertical: 2,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingLeft: 10, paddingBottom: isLast ? 0 : 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isLast ? '700' : '500',
                        color: isLast ? (isDark ? '#F0F0F0' : '#1a1a1a') : isDark ? '#aaa' : '#666',
                      }}
                    >
                      {event.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: isDark ? '#666' : '#aaa', marginTop: 2 }}>
                      {formatDateTime(event.time)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Card({
  isDark,
  title,
  children,
}: {
  isDark: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 14,
        backgroundColor: isDark ? '#2A2A2A' : '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: isDark ? '#777' : '#999',
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  icon,
  text,
  isDark,
  bold,
}: {
  icon: React.ReactNode;
  text: string;
  isDark: boolean;
  bold?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      {icon}
      <Text
        style={{
          flex: 1,
          fontSize: bold ? 15 : 13,
          fontWeight: bold ? '700' : '500',
          color: bold ? (isDark ? '#E8E8E8' : '#222') : isDark ? '#999' : '#777',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function TotalRow({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#ccc' : '#555' }}>
        {value}
      </Text>
    </View>
  );
}
