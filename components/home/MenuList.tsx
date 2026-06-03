import { FlatList, Text, View } from 'react-native';

import { SubHeader } from '../SubHeader';
import { MealCard } from './MealCard';
import { Meal } from './types';


export function MenuList({ meals, activeCategory, onSeeAll }: { meals: Meal[], activeCategory: string, onSeeAll?: () => void }) {
  const filteredMeals = activeCategory === 'all' ? meals : meals.filter((meal) => meal.category === activeCategory);

  return (
    <>
      <SubHeader title='Hot & New' onSeeAll={onSeeAll} />
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MealCard meal={item} />}
        ListEmptyComponent={<View className='flex-1 justify-center items-center my-40'><Text className='text-xl font-bold text-gray-500'>No meals found</Text></View>}
        contentContainerStyle={{ flexGrow: 1 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="w-4" />}
      />

    </>
  );
}
