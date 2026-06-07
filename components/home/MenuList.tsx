import { FlatList, Text, View } from 'react-native';

import { SubHeader } from '../SubHeader';
import { MealCard } from './MealCard';

import { useCollection } from '@/hooks/useFirestore';
import { MealCardSkeleton } from './Skeleton';
import { Meal } from './types';

export function MenuList({ activeCategory, onSeeAll, searchedQuery }: { activeCategory: string, onSeeAll?: () => void, searchedQuery: string }) {
  const { data: featuredMeals, loading } = useCollection<Meal>("meals");
  const filteredMeals = activeCategory === 'all' ? featuredMeals : featuredMeals.filter((meal) => meal.category === activeCategory);

  if (loading) return <><SubHeader title='Hot & New' /><MealCardSkeleton /></>

  return (
    <>
      <SubHeader title='Hot & New' onSeeAll={onSeeAll} />
      <FlatList
        data={filteredMeals.filter((meal) => meal.name.toLowerCase().includes(searchedQuery.toLowerCase()))}
        keyExtractor={(item) => item.firestoreId}
        renderItem={({ item }) => <MealCard meal={item} />}
        ListEmptyComponent={<View className='flex-1 justify-center items-center my-40'><Text className='text-xl font-bold text-gray-500 dark:text-gray-400'>No meals found</Text></View>}
        contentContainerStyle={{ flexGrow: 1 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="w-4" />}
      />

    </>
  );
}
