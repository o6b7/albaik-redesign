import { FlatList, View } from 'react-native';
import { Meal, MealCard } from './MealCard';

export function FeaturedList({ meals }: { meals: Meal[] }) {
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
