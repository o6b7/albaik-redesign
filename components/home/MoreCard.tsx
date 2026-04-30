import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { menuImages } from '@/constants/images';
import { SideMeal } from './types';

export function MoreCard({ meal }: { meal: SideMeal }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className='rounded-3xl p-4 bg-[#FDFFFF] w-44 h-52 justify-between'
      activeOpacity={0.85}
      onPress={() => router.push(`/meal/${meal.id}?type=more`)}
    >
      <View className='items-center'>
        <Image source={menuImages[meal.image] ?? menuImages.bigBaik} className='w-32 h-32' resizeMode="contain" />
      </View>
      <View className="flex-row justify-between items-end">
        <View className="gap-0.5">
          <Text className="font-semibold text-sm text-gray-900">{meal.name}</Text>
          <View className="flex-row gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => {
              const color = meal.rating >= i ? '#FBBF24' : '#D1D5DB';
              return <Star key={i} size={13} color={color} fill={color} />;
            })}
          </View>
          <Text className="text-xs text-gray-400">{meal.reviews} Reviews</Text>
        </View>
        <Text className="font-bold text-red-500 text-lg">{meal.price} {meal.currency}</Text>
      </View>
    </TouchableOpacity>
  );
}
