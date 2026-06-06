import { FlatList, TouchableOpacity, View, Text } from 'react-native';

import { useCollection } from '@/hooks/useFirestore';
import { CategoryTabsSkeleton } from './Skeleton';

interface Category {
  firestoreId: string;
  id: number;
  category: string;
}

export function CategoryTabs({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (category: string) => void }) {
  const { data: rawCategories, loading } = useCollection<Category>("categories");
  const categories = [...rawCategories].sort((a, b) =>
    a.category === 'all' ? -1 : b.category === 'all' ? 1 : 0
  );

  if (loading) return <CategoryTabsSkeleton />

  return (
    <View className="bg-gray-100 rounded-md mb-2">
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.firestoreId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}

        renderItem={({ item }) => {
          const isActive = activeCategory === item.category;

          return (
            <TouchableOpacity
              onPress={() => setActiveCategory(item.category)}
              className={`px-4 py-2 rounded-2xl mr-2 ${isActive ? 'bg-red-500' : ''
                }`}
            >
              <Text
                className={`font-bold ${isActive ? 'text-white' : 'text-black'
                  }`}
              >
                {item.category}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}