import { DeliveryMap } from '@/components/DeliveryMap';
import {
  DESTINATION,
  DRIVER_ORIGIN,
  DRIVER_STAGES,
  LatLng,
  PICKUP_WAYPOINTS,
  RESTAURANT,
  ROAD_WAYPOINTS,
  RoutePath,
  buildRoutePath,
  etaMinutesForKm,
  pointOnPath,
  regionForCoords,
} from '@/constants/delivery';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { db } from '@/firebase';
import { useRoute } from '@/hooks/use-route';
import { DENSE_TEXT, SCALED_TEXT } from '@/lib/a11y';
import { formatDateTime, shortId } from '@/lib/format';
import { advanceOrderStatus, writeDriverLocation } from '@/store/driver-store';
import { Order, OrderStatus } from '@/store/order-store';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Check,
  ChefHat,
  Clock,
  Flame,
  Navigation,
  Package,
  User,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PICKUP_STATUSES: OrderStatus[] = [
  'accepted',
  'driving_to_restaurant',
  'arrived_at_restaurant',
];

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  accepted: { label: 'Start Driving to Restaurant', next: 'driving_to_restaurant' },
  driving_to_restaurant: { label: "I've Arrived at Restaurant", next: 'arrived_at_restaurant' },
  arrived_at_restaurant: { label: 'Collect Meal', next: 'meal_collected' },
  meal_collected: { label: 'Start Delivery', next: 'driving_to_customer' },
  driving_to_customer: { label: 'Mark as Delivered', next: 'delivered' },
};

const LOCATION_WRITE_INTERVAL_MS = 2500;

function openNavigation(target: LatLng) {
  const latlng = `${target.latitude},${target.longitude}`;
  const url = Platform.select({
    ios: `http://maps.apple.com/?daddr=${latlng}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latlng}`,
  })!;
  Linking.openURL(url).catch(() => {});
}

export default function DriverOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [driverPos, setDriverPos] = useState<LatLng>(DRIVER_ORIGIN);
  const progress = useRef(new Animated.Value(0)).current;
  const lastLocationWrite = useRef(0);

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

  const status = order?.status;
  const foodReady = !!order?.foodReady;
  const isPickup = !!status && PICKUP_STATUSES.includes(status);

  const pickupRoute = useRoute(DRIVER_ORIGIN, RESTAURANT, PICKUP_WAYPOINTS);
  const deliveryRoute = useRoute(RESTAURANT, DESTINATION, ROAD_WAYPOINTS);
  const pickupPath = useMemo(() => buildRoutePath(pickupRoute.coords), [pickupRoute.coords]);
  const deliveryPath = useMemo(() => buildRoutePath(deliveryRoute.coords), [deliveryRoute.coords]);
  const activeCoords = isPickup ? pickupRoute.coords : deliveryRoute.coords;

  useEffect(() => {
    if (!status || !id) return;

    const animateAlong = (path: RoutePath, durationMs: number) => {
      progress.setValue(0);
      const listenerId = progress.addListener(({ value }) => {
        const next = pointOnPath(path, value);
        setDriverPos(next);
        const now = Date.now();
        if (now - lastLocationWrite.current > LOCATION_WRITE_INTERVAL_MS) {
          lastLocationWrite.current = now;
          writeDriverLocation(id, next);
        }
      });
      Animated.timing(progress, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      return () => progress.removeListener(listenerId);
    };

    if (status === 'driving_to_restaurant') {
      return animateAlong(pickupPath, 60 * 1000);
    }
    if (status === 'driving_to_customer') {
      return animateAlong(deliveryPath, 90 * 1000);
    }

    progress.stopAnimation();
    if (status === 'accepted') setDriverPos(DRIVER_ORIGIN);
    else if (status === 'arrived_at_restaurant' || status === 'meal_collected')
      setDriverPos(RESTAURANT);
    else if (status === 'delivered') setDriverPos(DESTINATION);
  }, [status, id, pickupPath, deliveryPath]);

  const region = useMemo(() => regionForCoords(activeCoords), [activeCoords]);

  const waitingForKitchen = status === 'arrived_at_restaurant' && !foodReady;

  const handleAdvance = async () => {
    if (!order || !status) return;
    const action = NEXT_ACTION[status];
    if (!action || waitingForKitchen) return;
    setSubmitting(true);
    try {
      await advanceOrderStatus(order.id, action.next, driverPos);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!order || !status) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212] items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400 text-lg">Order not found</Text>
        </SafeAreaView>
      </>
    );
  }

  const currentIndex = DRIVER_STAGES.findIndex((s) => s.key === status);
  const action = NEXT_ACTION[status];
  const target = isPickup ? RESTAURANT : DESTINATION;
  const legKm = isPickup ? pickupRoute.distanceKm : deliveryRoute.distanceKm;
  const etaMin = etaMinutesForKm(legKm);
  const isDelivered = status === 'delivered';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]" edges={['top']}>
        <ScreenHeader title={`Order ${shortId(order.id)}`} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Stepper */}
          <Stepper currentIndex={isDelivered ? DRIVER_STAGES.length : currentIndex} isDark={isDark} />

          {/* Map */}
          {!isDelivered && (
            <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <DeliveryMap
                isDark={isDark}
                region={region}
                routeCoords={activeCoords}
                driver={driverPos}
                target={target}
                targetKind={isPickup ? 'restaurant' : 'customer'}
                origin={isPickup ? undefined : RESTAURANT}
                interactive
              />
            </View>
          )}

          {/* Destination card */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: isDark ? '#777' : '#999',
                }}
              >
                {isDelivered ? 'Delivered to' : isPickup ? 'Pick up from' : 'Deliver to'}
              </Text>

              {/* Kitchen status — only relevant before the meal is collected */}
              {isPickup && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: foodReady
                      ? isDark ? '#0E2A1A' : '#ECFDF3'
                      : isDark ? '#2A2114' : '#FEF3C7',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Flame size={11} color={foodReady ? '#10B981' : '#D97706'} />
                  <Text
                    {...DENSE_TEXT}
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: foodReady ? '#10B981' : '#D97706',
                    }}
                  >
                    {foodReady ? 'Food ready' : 'Kitchen preparing'}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: isPickup ? (isDark ? '#2A1A1A' : '#FDECEA') : (isDark ? '#0E2A1A' : '#F0FFF4'),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                {isPickup ? <ChefHat size={20} color="#C0392B" /> : <User size={20} color="#2D8B4E" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#F0F0F0' : '#1a1a1a' }}>
                  {isPickup ? order.restaurant.name : order.customer.name}
                </Text>
                <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777', marginTop: 2 }}>
                  {isPickup ? order.restaurant.address : order.customer.address}
                </Text>
              </View>
            </View>

            {/* Completed delivery summary */}
            {isDelivered && order.deliveredAt && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? '#3A3A3A' : '#F0F0F0',
                }}
              >
                <Check size={14} color="#10B981" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#10B981' }}>
                  Delivered {formatDateTime(order.deliveredAt)}
                </Text>
              </View>
            )}

            {/* Distance / ETA for delivery leg */}
            {!isPickup && !isDelivered && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 14,
                  paddingTop: 14,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? '#3A3A3A' : '#F0F0F0',
                }}
              >
                <Metric icon={<Navigation size={14} color="#6366F1" />} value={`${legKm.toFixed(1)} km`} label="Distance" isDark={isDark} />
                <Metric icon={<Clock size={14} color="#F59E0B" />} value={`${etaMin} min`} label="ETA" isDark={isDark} />
              </View>
            )}

            {!isDelivered && (
              <TouchableOpacity
                onPress={() => openNavigation(target)}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#C0392B',
                }}
              >
                <Navigation size={16} color="#C0392B" />
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#C0392B' }}>Navigate</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Order items */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: isDark ? '#2A2A2A' : '#fff',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Package size={15} color={isDark ? '#888' : '#999'} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#bbb' : '#666' }}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''} · Customer {order.customer.name}
              </Text>
            </View>
            {order.items.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 5,
                }}
              >
                <Text style={{ fontSize: 14, color: isDark ? '#E0E0E0' : '#333', fontWeight: '500' }}>
                  {item.quantity}× {item.name}
                </Text>
              </View>
            ))}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: isDark ? '#3A3A3A' : '#F0F0F0',
              }}
            >
              <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>Your earnings</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>
                ⃁{order.earnings}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Primary action / delivered footer */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 8,
            backgroundColor: isDark ? '#121212' : '#FAFAFA',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#222' : '#EEE',
          }}
        >
          {isDelivered ? (
            <View style={{ alignItems: 'center', paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#10B981',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={16} color="#fff" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#10B981' }}>
                  Delivery complete
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.replace('/(driver)/orders' as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#C0392B',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Text {...SCALED_TEXT} style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  Back to Orders
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            action && (
              <TouchableOpacity
                onPress={handleAdvance}
                disabled={submitting || waitingForKitchen}
                activeOpacity={0.85}
                style={{
                  backgroundColor: waitingForKitchen
                    ? isDark ? '#333' : '#E0E0E0'
                    : action.next === 'delivered' ? '#10B981' : '#C0392B',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: action.next === 'delivered' ? '#10B981' : '#C0392B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: waitingForKitchen ? 0 : 0.3,
                  shadowRadius: 12,
                  elevation: waitingForKitchen ? 0 : 6,
                }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    {...SCALED_TEXT}
                    style={{
                      color: waitingForKitchen ? (isDark ? '#777' : '#aaa') : '#fff',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    {waitingForKitchen ? 'Waiting for Kitchen…' : action.label}
                  </Text>
                )}
              </TouchableOpacity>
            )
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

function Metric({
  icon,
  value,
  label,
  isDark,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon}
      <View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#E8E8E8' : '#222' }}>
          {value}
        </Text>
        <Text style={{ fontSize: 11, color: isDark ? '#777' : '#999' }}>{label}</Text>
      </View>
    </View>
  );
}

function Stepper({ currentIndex, isDark }: { currentIndex: number; isDark: boolean }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 18 }}>
      {DRIVER_STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isLast = index === DRIVER_STAGES.length - 1;
        const color = isCompleted ? '#10B981' : isActive ? '#C0392B' : isDark ? '#333' : '#E5E5E5';

        return (
          <View key={stage.key} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              {/* left connector */}
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: index === 0 ? 'transparent' : isCompleted || isActive ? '#10B981' : isDark ? '#333' : '#E5E5E5',
                }}
              />
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCompleted ? (
                  <Check size={12} color="#fff" />
                ) : (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: isActive ? '#fff' : isDark ? '#555' : '#bbb',
                    }}
                  />
                )}
              </View>
              {/* right connector */}
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isLast ? 'transparent' : isCompleted ? '#10B981' : isDark ? '#333' : '#E5E5E5',
                }}
              />
            </View>
            <Text
              {...DENSE_TEXT}
              style={{
                fontSize: 9,
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#C0392B' : isCompleted ? '#10B981' : isDark ? '#666' : '#aaa',
                marginTop: 6,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {stage.short}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
