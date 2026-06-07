import { Meal } from '@/components/home/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Heart, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCollection } from '@/hooks/useFirestore';
import { useSavedMeals } from '@/hooks/useSavedMeals';
import { useCartStore } from '@/store/cart-store';
import { useFlyingItemStore } from '@/store/flying-item-store';

const TOPPINGS = [
  { id: 1, name: 'Add pickle', price: 'free' },
  { id: 2, name: 'Add garlic', price: 'free' },
  { id: 3, name: 'Add Double cheese', price: '2.00' },
  { id: 4, name: 'Spicy', price: '2.00' },
];

export default function MealDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, type, cardX, cardY } = useLocalSearchParams<{ id: string; type: string; cardX: string; cardY: string }>();
  const [checkedToppings, setCheckedToppings] = useState<Set<number>>(new Set([1]));
  const [quantity, setQuantity] = useState(1);
  const { isSaved, toggle } = useSavedMeals();
  const addItem = useCartStore((state) => state.addItem);
  const triggerFly = useFlyingItemStore((state) => state.trigger);

  const { data: featuredMeals } = useCollection<Meal>("meals");
  const { data: moreMeals } = useCollection<Meal>("more");

  const meal = type === 'featured'
    ? featuredMeals.find((m) => m.firestoreId === id)
    : moreMeals.find((m) => m.firestoreId === id);

  const handleAddToCart = () => {
    if (!meal) return;
    const selectedToppings = TOPPINGS.filter((t) => checkedToppings.has(t.id));
    addItem({
      id: meal.firestoreId,
      name: meal.name,
      price: meal.price,
      currency: meal.currency,
      image: meal.image,
      quantity,
      toppings: selectedToppings,
    });

    triggerFly({
      image: meal.image,
      startX: Number(cardX) || 0,
      startY: Number(cardY) || 0,
    });
    router.back();
  };

  const toggleTopping = (toppingId: number) => {
    setCheckedToppings(prev => {
      const next = new Set(prev);
      next.has(toppingId) ? next.delete(toppingId) : next.add(toppingId);
      return next;
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]" edges={['bottom']}>
        {/* Hero */}
        <View className="w-full" style={{ height: 300, backgroundColor: meal?.bgColor ?? '#8A151B' }}>
          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 w-10 h-10 rounded-full bg-white items-center justify-center z-10"
            style={{ top: insets.top + 12 }}
          >
            <ArrowLeft size={20} color="#111" />
          </Pressable>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 30 }}>
              <Image
                source={{ uri: meal?.image }}
                style={{ width: 260, height: 260 }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            <Text className="text-gray-400 dark:text-gray-500 text-sm mb-1">{meal?.category}</Text>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 dark:text-white font-bold text-3xl">{meal?.name}</Text>
              <Text className="text-gray-900 dark:text-white font-bold text-xl">{meal?.price} {meal?.currency}</Text>
            </View>

            {meal?.description && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5 mb-6">{meal.description}</Text>
            )}

            <Text className="text-gray-900 dark:text-white font-bold text-xl mb-2">Topping</Text>
            <View className='px-3'>
              {TOPPINGS.map((topping) => {
                const checked = checkedToppings.has(topping.id);
                return (
                  <Pressable
                    key={topping.id}
                    onPress={() => toggleTopping(topping.id)}
                    className="flex-row items-center justify-between py-3"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-6 h-6 rounded items-center justify-center ${checked ? 'bg-green-500' : 'border-2 border-gray-300'}`}
                      >
                        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
                      </View>
                      <Text className="text-gray-800 dark:text-gray-200 text-sm">{topping.name}</Text>
                    </View>
                    <Text className="text-green-600 text-sm font-medium">
                      {topping.price === 'free' ? '$free' : `$${topping.price}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Bottom bar */}
        <View className="px-5 pb-4 pt-3 border-t border-gray-100 dark:border-[#2A2A2A]">
          <View className="items-center mb-4">
            <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-full px-6 py-2 gap-6">
              <Pressable onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus size={18} color="#888" />
              </Pressable>
              <Text className="text-gray-900 dark:text-white font-bold text-base w-4 text-center">{quantity}</Text>
              <Pressable onPress={() => setQuantity(q => q + 1)}>
                <Plus size={18} color="#888" />
              </Pressable>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-[#C0392B] rounded-2xl py-4 items-center"
              onPress={handleAddToCart}
            >
              <Text className="text-white font-bold text-base">Add to Cart</Text>
            </Pressable>
            <Pressable onPress={() => meal && toggle(meal.firestoreId, type === 'featured' ? 'featured' : 'more')} className="w-14 h-14 bg-[#C0392B] rounded-2xl items-center justify-center">
              <Heart size={22} color="#fff" fill={meal && isSaved(meal.firestoreId) ? '#fff' : 'transparent'} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
