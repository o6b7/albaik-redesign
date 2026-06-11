import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { DENSE_TEXT, SCALED_TEXT } from '@/lib/a11y';
import { formatDateTime, isToday, shortId } from '@/lib/format';
import { useDriverOrders } from '@/store/driver-store';
import { Order } from '@/store/order-store';
import { useRouter } from 'expo-router';
import {
  Bike,
  Check,
  ChefHat,
  ChevronRight,
  Flame,
  MapPin,
  Navigation,
  Package,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
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

export default function DriverOrdersScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { availableOrders, activeOrder, pastOrders, loading, error, acceptOrder } =
    useDriverOrders();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [tab, setTab] = useState('available');

  const todayEarnings = pastOrders
    .filter((o) => o.deliveredAt && isToday(o.deliveredAt))
    .reduce((sum, o) => sum + (o.earnings ?? 0), 0);

  const handleAccept = async (order: Order) => {
    setAcceptingId(order.id);
    try {
      await acceptOrder(order.id);
      router.push(`/driver-order/${order.id}` as any);
    } catch (e: any) {
      Alert.alert('Could not accept', e?.message ?? 'Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            color: isDark ? '#F5F5F5' : '#111',
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
        >
          Deliveries
        </Text>

        {/* Today at a glance */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 18,
          }}
        >
          <SummaryPill
            icon={<TrendingUp size={15} color="#10B981" />}
            value={`${todayEarnings} SAR`}
            label="Earned today"
            isDark={isDark}
          />
          <SummaryPill
            icon={<Package size={15} color="#6366F1" />}
            value={`${pastOrders.length}`}
            label="Deliveries"
            isDark={isDark}
          />
        </View>

        {/* In-progress banner */}
        {activeOrder && (
          <TouchableOpacity
            onPress={() => router.push(`/driver-order/${activeOrder.id}` as any)}
            activeOpacity={0.85}
            style={{
              marginHorizontal: 20,
              marginBottom: 18,
              backgroundColor: '#EEF2FF',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#C7D2FE',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Bike size={22} color="#4338CA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#3730A3' }}>
                Delivery in progress
              </Text>
              <Text style={{ fontSize: 12, color: '#4F46E5', fontWeight: '500', marginTop: 2 }}>
                {shortId(activeOrder.id)} · {activeOrder.restaurant.name}
              </Text>
            </View>
            <ChevronRight size={20} color="#4F46E5" />
          </TouchableOpacity>
        )}

        {error && (
          <Text style={{ color: '#E53E3E', paddingHorizontal: 20, marginBottom: 12, fontSize: 13 }}>
            {error}
          </Text>
        )}

        {/* View switcher */}
        <SegmentedTabs
          tabs={[
            { key: 'available', label: 'Available', count: availableOrders.length },
            { key: 'history', label: 'History', count: pastOrders.length, color: '#10B981' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'available' ? (
          loading ? (
            <ActivityIndicator color="#C0392B" style={{ marginVertical: 30 }} />
          ) : availableOrders.length === 0 ? (
            <EmptyState
              icon={<Package size={28} color={isDark ? '#555' : '#ccc'} />}
              title="No orders available"
              subtitle="Orders appear here once the restaurant confirms them."
            />
          ) : (
            <View style={{ paddingHorizontal: 20, gap: 14 }}>
              {availableOrders.map((order) => (
                <AvailableOrderCard
                  key={order.id}
                  order={order}
                  isDark={isDark}
                  accepting={acceptingId === order.id}
                  disabled={!!activeOrder || (!!acceptingId && acceptingId !== order.id)}
                  onAccept={() => handleAccept(order)}
                />
              ))}
            </View>
          )
        ) : pastOrders.length === 0 ? (
          <EmptyState
            icon={<Check size={28} color={isDark ? '#555' : '#ccc'} />}
            title="No completed deliveries"
            subtitle="Your delivery history will show up here."
          />
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {pastOrders.map((order) => (
              <PreviousOrderCard
                key={order.id}
                order={order}
                isDark={isDark}
                onPress={() => router.push(`/driver-order/${order.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryPill({
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
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      {icon}
      <View style={{ flexShrink: 1 }}>
        <Text {...SCALED_TEXT} style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#F0F0F0' : '#111' }}>
          {value}
        </Text>
        <Text {...SCALED_TEXT} style={{ fontSize: 11, color: isDark ? '#888' : '#999' }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function AvailableOrderCard({
  order,
  isDark,
  accepting,
  disabled,
  onAccept,
}: {
  order: Order;
  isDark: boolean;
  accepting: boolean;
  disabled: boolean;
  onAccept: () => void;
}) {
  return (
    <View
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
      {/* Header: order # + earnings */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
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
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
          }}
        >
          <Text {...DENSE_TEXT} style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>
            {order.earnings}
          </Text>
          <Text {...DENSE_TEXT} style={{ fontSize: 11, fontWeight: '600', color: '#10B981' }}>
            SAR
          </Text>
        </View>
      </View>

      {/* Route: restaurant -> customer */}
      <RouteRow
        icon={<ChefHat size={15} color="#C0392B" />}
        tint={isDark ? '#2A1A1A' : '#FDECEA'}
        title={order.restaurant.name}
        subtitle={order.restaurant.address}
        isDark={isDark}
      />
      <View
        style={{
          width: 1,
          height: 14,
          backgroundColor: isDark ? '#333' : '#E5E5E5',
          marginLeft: 15,
          marginVertical: 2,
        }}
      />
      <RouteRow
        icon={<User size={15} color="#2D8B4E" />}
        tint={isDark ? '#0E2A1A' : '#F0FFF4'}
        title={order.customer.name}
        subtitle={order.customer.address}
        isDark={isDark}
      />

      {/* Distance + kitchen status */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Navigation size={13} color={isDark ? '#888' : '#999'} />
          <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777', fontWeight: '500' }}>
            {order.distanceKm.toFixed(1)} km away
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: order.foodReady
              ? isDark ? '#0E2A1A' : '#ECFDF3'
              : isDark ? '#2A2114' : '#FEF3C7',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Flame size={11} color={order.foodReady ? '#10B981' : '#D97706'} />
          <Text
            {...DENSE_TEXT}
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: order.foodReady ? '#10B981' : '#D97706',
            }}
          >
            {order.foodReady ? 'Food ready' : 'Being prepared'}
          </Text>
        </View>
      </View>

      {/* Accept */}
      <TouchableOpacity
        onPress={onAccept}
        disabled={disabled || accepting}
        activeOpacity={0.85}
        style={{
          backgroundColor: disabled ? (isDark ? '#333' : '#E0E0E0') : '#C0392B',
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {accepting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            {...SCALED_TEXT}
            style={{ color: disabled ? (isDark ? '#777' : '#aaa') : '#fff', fontSize: 15, fontWeight: '700' }}
          >
            Accept Order
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function RouteRow({
  icon,
  tint,
  title,
  subtitle,
  isDark,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  subtitle: string;
  isDark: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#E8E8E8' : '#222' }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 11, color: isDark ? '#777' : '#999' }} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function PreviousOrderCard({
  order,
  isDark,
  onPress,
}: {
  order: Order;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
        borderRadius: 16,
        padding: 16,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#10B981',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={12} color="#fff" />
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#E8E8E8' : '#222' }}>
            Order {shortId(order.id)}
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#10B981' }}>
          +{order.earnings} SAR
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <ChefHat size={12} color={isDark ? '#888' : '#999'} />
        <Text style={{ fontSize: 12, color: isDark ? '#999' : '#777' }} numberOfLines={1}>
          {order.restaurant.name}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <MapPin size={12} color={isDark ? '#888' : '#999'} />
        <Text style={{ fontSize: 12, color: isDark ? '#999' : '#777' }} numberOfLines={1}>
          {order.customer.name} · {order.customer.address}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: isDark ? '#666' : '#aaa', marginTop: 2 }}>
        {formatDateTime(order.deliveredAt ?? order.createdAt)}
      </Text>
    </TouchableOpacity>
  );
}
