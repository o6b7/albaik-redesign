import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import categories from './categories.json';

export function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <View className="bg-gray-100 rounded-md mb-2">
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}

        renderItem={({ item }) => {
          const isActive = activeCategory === item.category;

          return (
            <TouchableOpacity
              onPress={() => setActiveCategory(item.category)}
              className={`px-4 py-2 rounded-2xl mr-2 ${isActive ? 'bg-red-500' : 'bg-gray-300'
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