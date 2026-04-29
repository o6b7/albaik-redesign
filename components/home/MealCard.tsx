import { Heart, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export interface Meal {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  image: string;
  rating: number;
  reviews: number;
}

const imageMap: Record<string, any> = {
  "../../assets/menu/bigBaik.png": require("../../assets/menu/bigBaik.png"),
  "../../assets/menu/superBaik.png": require("../../assets/menu/superBaik.png"),
  "../../assets/menu/chickenFillet.png": require("../../assets/menu/chickenFillet.png"),
  "../../assets/menu/crispyBaik.png": require("../../assets/menu/crispyBaik.png"),
};

export function MealCard({ meal }: { meal: Meal }) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <View className="py-4 bg-gray-100 rounded-md mb-2 items-center justify-center">
      <View className='bg-red-500 rounded-3xl w-52 h-[260px] p-5 justify-between'>
        <View className='flex-row justify-between shrink'>
          <View className='flex-1 pr-2'>
            <Text className='font-bold text-lg text-white' numberOfLines={1}>{meal.name}</Text>
            <Text className='text-white text-sm' numberOfLines={2}>{meal.description}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} activeOpacity={0.7}>
            <Heart size={20} color={isLiked ? "#CBD5E1" : "#fff"} fill={isLiked ? "#CBD5E1" : "transparent"} />
          </TouchableOpacity>
        </View>
        <View className='items-center' style={{ overflow: 'visible' }}>
          <View style={{
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 25,
            overflow: 'visible'
          }}>
            <Image
              source={imageMap[meal.image] || require("../../assets/menu/bigBaik.png")}
              style={{
                width: 140,
                height: 140,
                overflow: 'visible'
              }}
              resizeMode="contain"
            />
          </View>
        </View>
        <View className='flex-row justify-between'>
          <View>
            <View>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  // Round down the rating (e.g., 4.5 -> 4 filled stars)
                  const isFilled = Math.floor(meal.rating || 0) >= starIndex;
                  const starColor = isFilled ? "#fff" : "#572b2b";
                  return (
                    <Star 
                      key={starIndex} 
                      size={14} 
                      color={starColor} 
                      fill={starColor} 
                    />
                  );
                })}
              </View>
              <Text className="text-white text-xs ml-1">{meal.reviews || 0} Reviews</Text>
            </View>
          </View>
          <View className='bg-white rounded-l-lg px-2 py-1 left-5'>
            <Text className='text-red-500 font-bold'> {meal.price} {meal.currency} </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
