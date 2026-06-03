import { FlatList, Text, View } from 'react-native';

import featuredMeals from '@/components/home/data/featuredMeals.json';
import { SubHeader } from '../SubHeader';
import { MealCard } from './MealCard';


export function MenuList({ activeCategory, onSeeAll, searchedQuery }: { activeCategory: string, onSeeAll?: () => void, searchedQuery: string }) {
  const filteredMeals = activeCategory === 'all' ? featuredMeals : featuredMeals.filter((meal) => meal.category === activeCategory);

  return (
    <>
      <SubHeader title='Hot & New' onSeeAll={onSeeAll} />
      <FlatList
        data={filteredMeals.filter((meal) => meal.name.toLowerCase().includes(searchedQuery.toLowerCase()))}
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
