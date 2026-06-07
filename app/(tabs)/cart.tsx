import { CartItem, useCartStore } from '@/store/cart-store';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const total = items.reduce((sum, item) => {
    const itemPrice = parseFloat(item.price) * item.quantity;
    const toppingsPrice = item.toppings.reduce(
      (t, top) => t + (top.price === 'free' ? 0 : parseFloat(top.price)),
      0
    ) * item.quantity;
    return sum + itemPrice + toppingsPrice;
  }, 0)

  const renderItem = ({ item }: { item: CartItem }) => (
    <View className='flex-row items-center bg-gray-50 dark:bg-[#2A2A2A] rounded-2xl p-3 mb-3'>
      <Image
        source={{ uri: item.image }}
        className='w-20 h-20'
        resizeMode='contain'
      />
      <View className='flex-1 ml-3'>
        <Text className='text-gray-900 dark:text-white font-bold text-base'>{item.name}</Text>
        {item.toppings.length > 0 && (
          <Text className='text-gray-500 dark:text-gray-400 text-xs mt-1'>
            {item.toppings.map((t) => t.name).join(', ')}
          </Text>
        )}
        <Text className='text-gray-900 dark:text-white font-bold text-sm mt-1'>
          ${parseFloat(item.price)} {item.currency}
        </Text>
      </View>
      <View className='items-center gap-2'>
        <View className='flex-row items-center border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 gap-3'>
          <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)}
            className="disabled:opacity-50"
          >
            <Minus size={14} color="#888" />
          </Pressable>
          <Text className='text-gray-900 dark:text-white font-bold text-sm w-4 text-center'>{item.quantity}</Text>
          <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <Plus size={14} color="#888" />
          </Pressable>
        </View>
        <Pressable onPress={() => removeItem(item.id)}>
          <Trash2 size={16} color="#E53E3E" />
        </Pressable>
      </View>
    </View>
  )

  if (items.length === 0) {
    return (
      <SafeAreaView className='flex-1 items-center justify-center bg-white dark:bg-[#121212]'>
        <Text className='text-gray-400 dark:text-gray-500 text-lg'>You cart is empty</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]" edges={['top', 'bottom']}>
      <View className='px-5 pt-4 pb-2 flex-row justify-between items-center'>
        <Text className='text-gray-900 dark:text-white font-bold text-2xl'>Cart</Text>
        <Pressable onPress={clearCart}>
          <Text className='text-[#C0392B] font-medium'>Clear all</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />

      <View className='px-5 pb-4 pt-3 border-t border-gray-100 dark:border-[#2A2A2A]'>
        <View className='flex-row justify-between mb-4'>
          <Text className='text-gray-500 dark:text-gray-400 text-base'>Total</Text>
          <Text className='text-gray-900 dark:text-white font-bold text-xl'>${total.toFixed(2)}</Text>
        </View>

        <Pressable className='bg-[#C0392B] rounded-2xl py-4 items-center'>
          <Text className='text-white font-bold text-base'>Check out</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}
