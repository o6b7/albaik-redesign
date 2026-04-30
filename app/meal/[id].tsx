import featuredMeals from '@/components/home/data/featuredMeals.json';
import moreMeals from '@/components/home/data/moreMeals.json';
import { Meal } from '@/components/home/types';
import { menuImages } from '@/constants/images';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Heart, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const TOPPINGS = [
  { id: 1, name: 'Add pickle', price: 'free' },
  { id: 2, name: 'Add garlic', price: 'free' },
  { id: 3, name: 'Add Double cheese', price: '2.00' },
  { id: 4, name: 'Spicy', price: '2.00' },
];

export default function MealDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [checkedToppings, setCheckedToppings] = useState<Set<number>>(new Set([1]));
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  let meal: Meal | undefined;
  if (type === 'featured') {
    meal = featuredMeals.find((m) => m.id === Number(id)) as Meal | undefined;
  } else {
    meal = moreMeals.find((m) => m.id === Number(id)) as Meal | undefined;
  }

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
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        {/* Hero */}
        <View className="w-full" style={{ height: 280, backgroundColor: meal?.bgColor ?? '#8A151B' }}>
          <Pressable
            onPress={() => router.back()}
            className="absolute left-4 w-10 h-10 rounded-full bg-white items-center justify-center z-10"
            style={{ top: insets.top + 12 }}
          >
            <ArrowLeft size={20} color="#111" />
          </Pressable>
          <View
            className="flex-1 justify-center top-5"
            style={{ shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 30, overflow: 'visible' }}
          >
            <Image
              source={meal?.image ? menuImages[meal.image] : menuImages.bigBaik}
              className="w-full h-52"
              resizeMode="contain"
            />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            <Text className="text-gray-400 text-sm mb-1">Chicken</Text>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 font-bold text-3xl">{meal?.name}</Text>
              <Text className="text-gray-900 font-bold text-xl">${meal?.price} {meal?.currency}</Text>
            </View>

            {meal?.description && (
              <Text className="text-gray-500 text-sm leading-5 mb-6">{meal.description}</Text>
            )}

            <Text className="text-gray-900 font-bold text-xl mb-2">Topping</Text>
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
                      <Text className="text-gray-800 text-sm">{topping.name}</Text>
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
        <View className="px-5 pb-4 pt-3 border-t border-gray-100">
          <View className="items-center mb-4">
            <View className="flex-row items-center border border-gray-300 rounded-full px-6 py-2 gap-6">
              <Pressable onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus size={18} color="#111" />
              </Pressable>
              <Text className="text-gray-900 font-bold text-base w-4 text-center">{quantity}</Text>
              <Pressable onPress={() => setQuantity(q => q + 1)}>
                <Plus size={18} color="#111" />
              </Pressable>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Pressable className="flex-1 bg-[#C0392B] rounded-2xl py-4 items-center">
              <Text className="text-white font-bold text-base">Add to Cart</Text>
            </Pressable>
            <Pressable onPress={() => setLiked(l => !l)} className="w-14 h-14 bg-[#C0392B] rounded-2xl items-center justify-center">
              <Heart size={22} color="#fff" fill={liked ? '#fff' : 'transparent'} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
