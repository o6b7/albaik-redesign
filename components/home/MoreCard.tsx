import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useRef } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { menuImages } from '@/constants/images';
import { SideMeal } from './types';

export function MoreCard({ meal, grid }: { meal: SideMeal; grid?: boolean }) {
  const router = useRouter();
  const cardRef = useRef<View>(null);

  const handlePress = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      const cx = Math.round(x + width / 2);
      const cy = Math.round(y + height / 2);
      router.push(`/meal/${meal.id}?type=more&cardX=${cx}&cardY=${cy}`);
    });
  };

  return (
    <TouchableOpacity
      ref={cardRef}
      className={`rounded-3xl p-4 bg-[#FDFFFF] justify-between ${grid ? 'flex-1 h-52' : 'w-44 h-52'}`}
      activeOpacity={0.85}
      onPress={handlePress}
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
