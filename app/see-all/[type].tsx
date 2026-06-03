import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealCard } from '@/components/home/MealCard';
import { MoreCard } from '@/components/home/MoreCard';
import featuredMeals from '@/components/home/data/featuredMeals.json';
import moreMeals from '@/components/home/data/moreMeals.json';

function MealsGrid() {
  return (
    <FlatList
      data={featuredMeals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MealCard meal={item} grid />}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

function MoreGrid() {
  return (
    <FlatList
      data={moreMeals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MoreCard meal={item} grid />}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default function SeeAllScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const isMeals = type === 'meals';
  const title = isMeals ? 'Hot & New' : 'More';

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      <View className="flex-row items-center px-4 py-3 gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="font-bold text-xl">{title}</Text>
      </View>

      {isMeals ? <MealsGrid /> : <MoreGrid />}
    </SafeAreaView>
  );
}
