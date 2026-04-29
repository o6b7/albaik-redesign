import { FlatList, View } from 'react-native';

import { Meal } from './types';
import { MealCard } from './MealCard';

export function MenuList({ meals }: { meals: Meal[] }) {
  return (
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MealCard meal={item} />}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View className="w-4" />}
    />
  );
}
