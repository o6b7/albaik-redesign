import { useRouter } from 'expo-router';
import { Heart, Star } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Meal } from './types';

export function MealCard({ meal, grid }: { meal: Meal; grid?: boolean }) {
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();
  const cardRef = useRef<View>(null);

  const handlePress = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      const cx = Math.round(x + width / 2);
      const cy = Math.round(y + height / 2);
      router.push(`/meal/${meal.firestoreId}?type=featured&cardX=${cx}&cardY=${cy}`);
    });
  };

  return (
    <TouchableOpacity
      className={`py-4 bg-gray-100 dark:bg-[#121212] rounded-md items-center justify-center ${grid ? 'flex-1' : ''}`}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View ref={cardRef} style={{ backgroundColor: meal.bgColor ?? '#8A151B' }} className={`rounded-3xl justify-between ${grid ? 'w-full h-[220px] p-4' : 'w-[210px] h-[260px] p-5'}`}>
        <View className='flex-row justify-between shrink'>
          <View className='flex-1 pr-2'>
            <Text className='font-bold text-lg text-white' numberOfLines={1}>{meal.name}</Text>
            <Text className='text-white text-sm' numberOfLines={1}>{meal.description}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} activeOpacity={0.7}>
            <Heart size={20} color={isLiked ? '#CBD5E1' : '#fff'} fill={isLiked ? '#CBD5E1' : 'transparent'} />
          </TouchableOpacity>
        </View>

        <View className='items-center' style={{ overflow: 'visible' }}>
          <View style={{ shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 25, overflow: 'visible' }}>
            <Image
              source={{ uri: meal.image }}
              style={grid ? { width: 100, height: 100 } : { width: 140, height: 140, overflow: 'visible' }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View className='flex-row justify-between'>
          <View>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((i) => {
                const color = Math.floor(meal.rating) >= i ? '#fff' : '#572b2b';
                return <Star key={i} size={14} color={color} fill={color} />;
              })}
            </View>
            <Text className="text-white text-xs ml-1">{meal.reviews} Reviews</Text>
          </View>
          <View className='bg-white rounded-l-lg px-2 py-1 left-5'>
            <Text className='text-red-500 font-bold'>{meal.price} {meal.currency}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
