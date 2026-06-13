import { useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useRef } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { SideMeal } from './types';

export function MoreCard({ meal, grid }: { meal: SideMeal; grid?: boolean }) {
  const router = useRouter();
  const cardRef = useRef<View>(null);

  const handlePress = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      const cx = Math.round(x + width / 2);
      const cy = Math.round(y + height / 2);
      router.push(`/meal/${meal.firestoreId}?type=more&cardX=${cx}&cardY=${cy}`);
    });
  };

  return (
    <TouchableOpacity
      ref={cardRef}
      className={`rounded-3xl p-4 bg-[#FDFFFF] dark:bg-[#2A2A2A] justify-between ${grid ? 'flex-1 min-h-60' : 'w-52 min-h-60'}`}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View className='items-center' style={{ overflow: 'hidden' }}>
        <Image source={{ uri: meal.image }} style={{ width: 120, height: 120 }} resizeMode="contain" />
      </View>
      <View className="flex-row justify-between items-end">
        <View className="gap-0.5">
          <Text className="font-semibold text-sm text-gray-900 dark:text-white">{meal.name}</Text>
          <View className="flex-row gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => {
              const color = meal.rating >= i ? '#FBBF24' : '#D1D5DB';
              return <Star key={i} size={13} color={color} fill={color} />;
            })}
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-500">{meal.reviews} Reviews</Text>
        </View>
        <Text className="font-bold text-red-500 text-lg">⃁{meal.price}</Text>
      </View>
    </TouchableOpacity>
  );
}
