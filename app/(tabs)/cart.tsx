import BottomSheet from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Clock,
  ClockArrowUp,
  Minus,
  Package,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useRef } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckoutSheet } from '@/components/CheckoutSheet';
import { CartItem, useCartStore } from '@/store/cart-store';
import { useOrders } from '@/store/order-store';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const { activeOrder, pastOrders, refresh } = useOrders();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const bottomSheetRef = useRef<BottomSheet>(null);

  const total = items.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) * item.quantity;
    const toppingsPrice =
      item.toppings.reduce(
        (t, top) => t + (top.price === 'free' ? 0 : parseFloat(top.price)),
        0
      ) * item.quantity;
    return sum + itemPrice + toppingsPrice;
  }, 0);

  const handleCheckout = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleOrderPlaced = useCallback(() => {
    refresh();
  }, [refresh]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row items-center bg-gray-50 dark:bg-[#2A2A2A] rounded-2xl p-3 mb-3">
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20"
        resizeMode="contain"
      />
      <View className="flex-1 ml-3">
        <Text className="text-gray-900 dark:text-white font-bold text-base">
          {item.name}
        </Text>
        {item.toppings.length > 0 && (
          <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            {item.toppings.map((t) => t.name).join(', ')}
          </Text>
        )}
        <Text className="text-gray-900 dark:text-white font-bold text-sm mt-1">
          ${parseFloat(item.price)} {item.currency}
        </Text>
      </View>
      <View className="items-center gap-2">
        <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 gap-3">
          <Pressable
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus size={14} color="#888" />
          </Pressable>
          <Text className="text-gray-900 dark:text-white font-bold text-sm w-4 text-center">
            {item.quantity}
          </Text>
          <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Plus size={14} color="#888" />
          </Pressable>
        </View>
        <Pressable onPress={() => removeItem(item.id)}>
          <Trash2 size={16} color="#E53E3E" />
        </Pressable>
      </View>
    </View>
  );

  if (items.length === 0 && !activeOrder && pastOrders.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-[#121212]">
          <Text className="text-gray-400 dark:text-gray-500 text-lg">
            Your cart is empty
          </Text>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        className="flex-1 bg-white dark:bg-[#121212]"
        edges={['top', 'bottom']}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
          <Text className="text-gray-900 dark:text-white font-bold text-2xl">
            Cart
          </Text>
          {items.length > 0 && (
            <Pressable onPress={clearCart}>
              <Text className="text-[#C0392B] font-medium">Clear all</Text>
            </Pressable>
          )}
        </View>

        {/* Active Order Banner */}
        {activeOrder && (
          <TouchableOpacity
            onPress={() =>
              router.push(`/order/${activeOrder.id}` as any)
            }
            activeOpacity={0.85}
            style={{
              marginHorizontal: 20,
              marginBottom: 12,
              backgroundColor: '#FEF3C7',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#F59E0B',
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
                backgroundColor: '#FDE68A',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Package size={22} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: '#92400E',
                }}
              >
                Order in progress
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                <Clock size={12} color="#B45309" />
                <Text style={{ fontSize: 12, color: '#B45309', fontWeight: '500' }}>
                  {activeOrder.stage === 'verifying'
                    ? 'Verifying your order'
                    : activeOrder.stage === 'cooking'
                    ? 'Preparing your food'
                    : activeOrder.stage === 'driver'
                    ? 'Assigning driver'
                    : 'On the way to you'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#B45309" />
          </TouchableOpacity>
        )}

        {/* Previous Orders Banner */}
        {pastOrders.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/order/history' as any)}
            activeOpacity={0.85}
            style={{
              marginHorizontal: 20,
              marginBottom: 12,
              backgroundColor: isDark ? '#2A2A2A' : '#fff',
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: isDark ? '#333' : '#F5F5F5',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ClockArrowUp size={20} color={isDark ? '#999' : '#777'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isDark ? '#E0E0E0' : '#333',
                }}
              >
                Previous Orders
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? '#777' : '#999',
                  marginTop: 2,
                }}
              >
                {pastOrders.length} completed order{pastOrders.length > 1 ? 's' : ''}
              </Text>
            </View>
            <ChevronRight size={18} color={isDark ? '#666' : '#bbb'} />
          </TouchableOpacity>
        )}

        {/* Cart Items */}
        {items.length > 0 ? (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 20 }}
            />

            {/* Bottom Bar */}
            <View className="px-5 pb-4 pt-3 border-t border-gray-100 dark:border-[#2A2A2A]">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Subtotal
                </Text>
                <Text className="text-gray-900 dark:text-white font-semibold text-sm">
                  ${total.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  VAT (15%)
                </Text>
                <Text className="text-gray-900 dark:text-white font-semibold text-sm">
                  ${(total * 0.15).toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-900 dark:text-white font-bold text-lg">
                  Total
                </Text>
                <Text className="text-[#C0392B] font-bold text-lg">
                  ${(total * 1.15).toFixed(2)}
                </Text>
              </View>

              <Pressable
                className="bg-[#C0392B] rounded-2xl py-4 items-center"
                onPress={handleCheckout}
                style={{
                  shadowColor: '#C0392B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-white font-bold text-base">
                  Check out
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400 dark:text-gray-500 text-lg">
              Your cart is empty
            </Text>
          </View>
        )}

        {/* Checkout Bottom Sheet */}
        <CheckoutSheet
          ref={bottomSheetRef}
          items={items}
          onOrderPlaced={handleOrderPlaced}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
