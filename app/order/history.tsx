import { Order, useOrders } from '@/store/order-store';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  Package,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderHistoryScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { pastOrders, loading } = useOrders();

  const renderOrder = ({ item }: { item: Order }) => (
    <View
      style={{
        backgroundColor: isDark ? '#2A2A2A' : '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#10B981',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={12} color="#fff" />
          </View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#10B981',
            }}
          >
            Delivered
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: isDark ? '#777' : '#999' }}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Items */}
      <View style={{ gap: 8, marginBottom: 12 }}>
        {item.items.map((orderItem, idx) => (
          <View
            key={idx}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Image
              source={{ uri: orderItem.image }}
              style={{ width: 40, height: 40, borderRadius: 8 }}
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
                {orderItem.quantity}x {orderItem.name}
              </Text>
              {orderItem.toppings.length > 0 && (
                <Text
                  style={{
                    fontSize: 11,
                    color: isDark ? '#888' : '#999',
                    marginTop: 1,
                  }}
                >
                  {orderItem.toppings.map((t) => t.name).join(', ')}
                </Text>
              )}
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isDark ? '#ccc' : '#555',
              }}
            >
              ${(parseFloat(orderItem.price) * orderItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: isDark ? '#3A3A3A' : '#F0F0F0',
          marginBottom: 12,
        }}
      />

      {/* Footer */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MapPin size={12} color={isDark ? '#888' : '#999'} />
            <Text style={{ fontSize: 12, color: isDark ? '#999' : '#777' }}>
              {item.addressLabel} — {item.addressStreet}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <CreditCard size={12} color={isDark ? '#888' : '#999'} />
            <Text style={{ fontSize: 12, color: isDark ? '#999' : '#777' }}>
              {item.paymentCardType.charAt(0).toUpperCase() + item.paymentCardType.slice(1)} ···· {item.paymentLast4}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: isDark ? '#666' : '#bbb' }}>
            Total
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#C0392B' }}>
            ${item.total.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-[#FAFAFA] dark:bg-[#121212]">
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
            Previous Orders
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#C0392B" />
          </View>
        ) : pastOrders.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Package size={32} color={isDark ? '#555' : '#ccc'} />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isDark ? '#888' : '#999',
              }}
            >
              No previous orders
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#555' : '#bbb',
                marginTop: 4,
              }}
            >
              Your completed orders will show up here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pastOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}
