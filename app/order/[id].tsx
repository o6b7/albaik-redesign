import { db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { ORDER_STAGES, Order, OrderStage, useOrders } from '@/store/order-store';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  Bike,
  Check,
  ChefHat,
  Clock,
  MapPin,
  Search,
  Truck,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
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

// Dummy delivery route — waypoints following roads in Jeddah
const RESTAURANT = { latitude: 21.4858, longitude: 39.1925 };
const DESTINATION = { latitude: 21.4735, longitude: 39.1778 };

const ROAD_WAYPOINTS = [
  RESTAURANT,
  { latitude: 21.4856, longitude: 39.1912 }, // head west on street
  { latitude: 21.4852, longitude: 39.1898 },
  { latitude: 21.4845, longitude: 39.1893 }, // slight turn south
  { latitude: 21.4838, longitude: 39.1893 }, // continue south
  { latitude: 21.4830, longitude: 39.1888 },
  { latitude: 21.4822, longitude: 39.1878 }, // turn southwest
  { latitude: 21.4815, longitude: 39.1868 },
  { latitude: 21.4808, longitude: 39.1858 },
  { latitude: 21.4800, longitude: 39.1852 }, // continue on road
  { latitude: 21.4792, longitude: 39.1845 },
  { latitude: 21.4785, longitude: 39.1838 },
  { latitude: 21.4778, longitude: 39.1828 }, // bend west
  { latitude: 21.4770, longitude: 39.1818 },
  { latitude: 21.4762, longitude: 39.1810 },
  { latitude: 21.4755, longitude: 39.1802 },
  { latitude: 21.4748, longitude: 39.1795 },
  { latitude: 21.4742, longitude: 39.1788 },
  { latitude: 21.4738, longitude: 39.1783 },
  DESTINATION,
];

function lerp(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
  t: number
) {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

function positionOnRoute(
  waypoints: { latitude: number; longitude: number }[],
  progress: number
) {
  const t = Math.max(0, Math.min(1, progress));
  const segCount = waypoints.length - 1;
  const raw = t * segCount;
  const seg = Math.min(Math.floor(raw), segCount - 1);
  return lerp(waypoints[seg], waypoints[seg + 1], raw - seg);
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isDark = useColorScheme() === 'dark';

  const { updateStage } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<OrderStage>('verifying');
  const [elapsed, setElapsed] = useState(0);
  const lastSyncedStage = useRef<OrderStage | null>(null);

  const riderProgress = useRef(new Animated.Value(0)).current;
  const [riderPos, setRiderPos] = useState(RESTAURANT);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch order
  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid, 'orders', id));
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        }
      } catch (e) {
        console.error('Error fetching order:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  // Timer: simulate 20 min in real-time (5 min per stage), sync to Firestore
  useEffect(() => {
    if (!order) return;

    const createdAt = new Date(order.createdAt).getTime();

    const stageForMinutes = (min: number): OrderStage => {
      if (min < 5) return 'verifying';
      if (min < 10) return 'cooking';
      if (min < 15) return 'driver';
      if (min < 20) return 'delivering';
      return 'delivered';
    };

    const tick = () => {
      const elapsedSec = Math.floor((Date.now() - createdAt) / 1000);
      setElapsed(elapsedSec);

      const newStage = stageForMinutes(elapsedSec / 60);
      setCurrentStage(newStage);

      if (newStage !== lastSyncedStage.current) {
        lastSyncedStage.current = newStage;
        updateStage(order.id, newStage);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order, updateStage]);

  // Rider animation when delivering
  useEffect(() => {
    if (currentStage !== 'delivering') return;

    riderProgress.setValue(0);
    Animated.timing(riderProgress, {
      toValue: 1,
      duration: 5 * 60 * 1000, // 5 minutes
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const listenerId = riderProgress.addListener(({ value }) => {
      setRiderPos(positionOnRoute(ROAD_WAYPOINTS, value));
    });

    return () => riderProgress.removeListener(listenerId);
  }, [currentStage]);

  // Pulse animation for active stage
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

  const currentStageIndex = ORDER_STAGES.findIndex((s) => s.key === currentStage);
  const totalRemaining = Math.max(0, 20 * 60 - elapsed);
  const remainingMin = Math.floor(totalRemaining / 60);
  const remainingSec = totalRemaining % 60;

  const mapRegion = useMemo(() => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const wp of ROAD_WAYPOINTS) {
      if (wp.latitude < minLat) minLat = wp.latitude;
      if (wp.latitude > maxLat) maxLat = wp.latitude;
      if (wp.longitude < minLng) minLng = wp.longitude;
      if (wp.longitude > maxLng) maxLng = wp.longitude;
    }
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.6,
      longitudeDelta: (maxLng - minLng) * 1.6,
    };
  }, []);

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
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#2A2A2A' : '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <ArrowLeft size={20} color={isDark ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDark ? '#fff' : '#1a1a1a',
            }}
          >
            Order Tracking
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
        {/* Timer */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 16,
          }}
        >
          {currentStage === 'delivered' ? (
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
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: '#10B981',
                }}
              >
                Delivered!
              </Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Clock size={16} color={isDark ? '#999' : '#777'} />
                <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>
                  Estimated delivery
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '800',
                  color: isDark ? '#fff' : '#1a1a1a',
                  letterSpacing: -1,
                }}
              >
                {remainingMin}:{remainingSec.toString().padStart(2, '0')}
              </Text>
              <Text style={{ fontSize: 12, color: isDark ? '#666' : '#bbb', marginTop: 2 }}>
                minutes remaining
              </Text>
            </>
          )}
        </View>

        {/* Stage Progress */}
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

        {/* Map (visible during delivering stage) */}
        {(currentStage === 'delivering' || currentStage === 'delivered') && (
          <View
            style={{
              margin: 20,
              borderRadius: 20,
              overflow: 'hidden',
              height: 220,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <MapView
              style={{ flex: 1 }}
              initialRegion={mapRegion}
              userInterfaceStyle={isDark ? 'dark' : 'light'}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              {/* Route line */}
              <Polyline
                coordinates={ROAD_WAYPOINTS}
                strokeColor="#C0392B"
                strokeWidth={4}
              />

              {/* Restaurant marker */}
              <Marker coordinate={RESTAURANT} title="Al Baik" anchor={{ x: 0.5, y: 0.5 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#C0392B',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                >
                  <ChefHat size={14} color="#fff" />
                </View>
              </Marker>

              {/* Destination marker */}
              <Marker coordinate={DESTINATION} title={order.addressLabel} anchor={{ x: 0.5, y: 0.5 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#10B981',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                >
                  <MapPin size={14} color="#fff" />
                </View>
              </Marker>

              {/* Rider marker */}
              {currentStage === 'delivering' && (
                <Marker coordinate={riderPos} title="Your rider" anchor={{ x: 0.5, y: 0.5 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#F59E0B',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#fff',
                      shadowColor: '#F59E0B',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                      elevation: 4,
                    }}
                  >
                    <Bike size={16} color="#fff" />
                  </View>
                </Marker>
              )}
            </MapView>
          </View>
        )}

        {/* Order Details */}
        <View
          style={{
            marginHorizontal: 20,
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
