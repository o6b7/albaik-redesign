import { DeliveryMap } from '@/components/DeliveryMap';
import {
  DESTINATION,
  DRIVER_ORIGIN,
  PICKUP_WAYPOINTS,
  RESTAURANT,
  ROAD_WAYPOINTS,
  customerStageFromStatus,
  etaMinutesForKm,
  haversineKm,
  regionForCoords,
} from '@/constants/delivery';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { db } from '@/firebase';
import { useRoute } from '@/hooks/use-route';
import { useSmoothedPosition } from '@/hooks/use-smoothed-position';
import { SCALED_TEXT } from '@/lib/a11y';
import { formatTime } from '@/lib/format';
import { ORDER_STAGES, Order, OrderStatus } from '@/store/order-store';
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Bike,
  Check,
  ChefHat,
  MapPin,
  Phone,
  Search,
  Truck,
  XCircle,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STAGE_ICONS: Record<string, typeof Search> = {
  verifying: Search,
  cooking: ChefHat,
  driver: Truck,
  delivering: Bike,
  delivered: Check,
};

const STAGE_COLORS: Record<string, string> = {
  verifying: '#3B82F6',
  cooking: '#F59E0B',
  driver: '#8B5CF6',
  delivering: '#10B981',
  delivered: '#10B981',
};

const PICKUP_PHASE: OrderStatus[] = [
  'accepted',
  'driving_to_restaurant',
  'arrived_at_restaurant',
  'meal_collected',
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Real-time order listener — reflects restaurant and driver actions instantly.
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

  // Pulse animation for the active stage.
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const status = order?.status;
  const isCancelled = status === 'cancelled';
  const isDelivered = status === 'delivered';
  const currentStage = order && !isCancelled ? customerStageFromStatus(order.status) : 'verifying';
  const currentStageIndex = ORDER_STAGES.findIndex((s) => s.key === currentStage);

  const isPickupPhase = !!status && PICKUP_PHASE.includes(status);
  const isDeliveryPhase = status === 'driving_to_customer' || status === 'delivered';
  const showMap = !!order?.driverId && (isPickupPhase || isDeliveryPhase);

  // The driver's live position glides between throttled Firestore updates.
  const smoothedDriverPos = useSmoothedPosition(order?.driverLocation ?? null, RESTAURANT);
  const driverMarker = order?.driverLocation ? smoothedDriverPos : null;

  // Road-following routes (same cache as the driver app — both sides draw the
  // exact line the driver actually rides along).
  const pickupRoute = useRoute(DRIVER_ORIGIN, RESTAURANT, PICKUP_WAYPOINTS);
  const deliveryRoute = useRoute(RESTAURANT, DESTINATION, ROAD_WAYPOINTS);
  const routeCoords = isPickupPhase ? pickupRoute.coords : deliveryRoute.coords;

  const mapRegion = useMemo(() => regionForCoords(routeCoords), [routeCoords]);

  // Live ETA from the driver's actual position once they're heading here.
  // Straight-line distance is scaled by the route's road/straight ratio so the
  // estimate accounts for actual street layout.
  const liveEtaMin = useMemo(() => {
    if (status !== 'driving_to_customer') return null;
    const straightTotal = haversineKm(RESTAURANT, DESTINATION);
    const roadFactor = straightTotal > 0 ? deliveryRoute.distanceKm / straightTotal : 1;
    const remainingKm = order?.driverLocation
      ? haversineKm(order.driverLocation, DESTINATION) * roadFactor
      : deliveryRoute.distanceKm;
    return etaMinutesForKm(remainingKm);
  }, [status, order?.driverLocation, deliveryRoute.distanceKm]);

  const hero = useMemo(() => {
    if (!status) return null;
    switch (status) {
      case 'verifying':
        return { title: 'Waiting for confirmation', sub: 'Al Baik is reviewing your order' };
      case 'cooking':
        return order?.foodReady
          ? { title: 'Your food is ready', sub: 'Waiting for a driver to pick it up' }
          : { title: 'Preparing your food', sub: 'The kitchen is working on your order' };
      case 'accepted':
      case 'driving_to_restaurant':
        return {
          title: 'Driver heading to Al Baik',
          sub: `${order?.driverName ?? 'Your driver'} is on the way to the restaurant`,
        };
      case 'arrived_at_restaurant':
        return {
          title: 'Driver at the restaurant',
          sub: order?.foodReady
            ? 'Picking up your order now'
            : 'Waiting for the kitchen to finish',
        };
      case 'meal_collected':
        return { title: 'Order picked up', sub: 'Your food is with the driver' };
      default:
        return null;
    }
  }, [status, order?.foodReady, order?.driverName]);

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
          <Text className="text-gray-500 dark:text-gray-400 text-lg">
            Order not found
          </Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]"
        edges={['top']}
      >
        <ScreenHeader title="Order Tracking" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Hero — stage-aware headline */}
          <View style={{ alignItems: 'center', paddingVertical: 18, paddingHorizontal: 24 }}>
            {isCancelled ? (
              <View style={{ alignItems: 'center' }}>
                <XCircle size={52} color="#E53E3E" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#E53E3E' }}>
                  Order cancelled
                </Text>
                <Text style={{ fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 }}>
                  The restaurant couldn&apos;t take this order
                </Text>
              </View>
            ) : isDelivered ? (
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: '#10B981',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Check size={28} color="#fff" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#10B981' }}>
                  Delivered!
                </Text>
                {order.deliveredAt && (
                  <Text style={{ fontSize: 12, color: isDark ? '#888' : '#999', marginTop: 4 }}>
                    at {formatTime(order.deliveredAt)}
                  </Text>
                )}
              </View>
            ) : liveEtaMin !== null ? (
              <>
                <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777', marginBottom: 4 }}>
                  Arriving in about
                </Text>
                <Text
                  {...SCALED_TEXT}
                  style={{
                    fontSize: 36,
                    fontWeight: '800',
                    color: isDark ? '#fff' : '#1a1a1a',
                    letterSpacing: -1,
                  }}
                >
                  {liveEtaMin} min
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? '#666' : '#bbb', marginTop: 2 }}>
                  {order.driverName ?? 'Your driver'} is on the way to you
                </Text>
              </>
            ) : (
              hero && (
                <>
                  <Text
                    {...SCALED_TEXT}
                    style={{
                      fontSize: 22,
                      fontWeight: '800',
                      color: isDark ? '#fff' : '#1a1a1a',
                      textAlign: 'center',
                      letterSpacing: -0.5,
                    }}
                  >
                    {hero.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isDark ? '#888' : '#999',
                      marginTop: 6,
                      textAlign: 'center',
                    }}
                  >
                    {hero.sub}
                  </Text>
                </>
              )
            )}
          </View>

          {/* Driver card with call action */}
          {order.driverName && !isCancelled && !isDelivered && (
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#2A2A2A' : '#fff',
                borderRadius: 16,
                padding: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#8B5CF6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Bike size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: isDark ? '#888' : '#999' }}>
                  Your driver
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: isDark ? '#E8E8E8' : '#222',
                    marginTop: 1,
                  }}
                >
                  {order.driverName}
                </Text>
              </View>
              {order.driverPhone && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${order.driverPhone}`).catch(() => {})}
                  activeOpacity={0.8}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isDark ? '#0E2A1A' : '#ECFDF3',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Phone size={17} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Live map — visible as soon as a driver is assigned */}
          {showMap && (
            <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
              <DeliveryMap
                isDark={isDark}
                region={mapRegion}
                routeCoords={routeCoords}
                driver={isDelivered ? null : driverMarker}
                target={isPickupPhase ? RESTAURANT : DESTINATION}
                targetKind={isPickupPhase ? 'restaurant' : 'customer'}
                origin={isPickupPhase ? undefined : RESTAURANT}
                height={220}
              />
            </View>
          )}

          {/* Stage Progress */}
          {!isCancelled && (
            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: isDark ? '#2A2A2A' : '#fff',
                borderRadius: 20,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {ORDER_STAGES.map((stage, index) => {
                const isCompleted =
                  currentStage === 'delivered' || index < currentStageIndex;
                const isActive = index === currentStageIndex && currentStage !== 'delivered';
                const StageIcon = STAGE_ICONS[stage.key];
                const stageColor = STAGE_COLORS[stage.key];
                const isLast = index === ORDER_STAGES.length - 1;

                return (
                  <View key={stage.key} style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 4 }}>
                    {/* Left: Icon + Line */}
                    <View style={{ alignItems: 'center', width: 44 }}>
                      <Animated.View
                        style={[
                          {
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isCompleted
                              ? '#10B981'
                              : isActive
                              ? stageColor
                              : isDark
                              ? '#333'
                              : '#F0F0F0',
                          },
                          isActive ? { transform: [{ scale: pulseAnim }] } : {},
                        ]}
                      >
                        {isCompleted ? (
                          <Check size={18} color="#fff" />
                        ) : (
                          <StageIcon size={18} color={isActive ? '#fff' : isDark ? '#666' : '#bbb'} />
                        )}
                      </Animated.View>
                      {!isLast && (
                        <View
                          style={{
                            width: 2,
                            height: 28,
                            backgroundColor: isCompleted
                              ? '#10B981'
                              : isDark
                              ? '#333'
                              : '#E8E8E8',
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </View>

                    {/* Right: Text */}
                    <View style={{ flex: 1, paddingLeft: 14, paddingTop: 4 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: isActive || isCompleted ? '700' : '500',
                          color: isActive
                            ? stageColor
                            : isCompleted
                            ? isDark
                              ? '#E0E0E0'
                              : '#333'
                            : isDark
                            ? '#666'
                            : '#bbb',
                        }}
                      >
                        {stage.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: isDark ? '#666' : '#bbb',
                          marginTop: 2,
                        }}
                      >
                        {isCompleted ? 'Completed' : isActive ? 'In progress...' : `~${stage.duration} min`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Order Details */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              backgroundColor: isDark ? '#2A2A2A' : '#fff',
              borderRadius: 16,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: isDark ? '#777' : '#999' }}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''}
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#777' : '#999' }}>
                {order.paymentCardType.toUpperCase()} ···· {order.paymentLast4}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} color={isDark ? '#888' : '#999'} />
                <Text
                  style={{
                    fontSize: 13,
                    color: isDark ? '#ccc' : '#555',
                    fontWeight: '500',
                  }}
                >
                  {order.addressLabel} — {order.addressStreet}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#C0392B' }}>
                ${order.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
