import { FlatList } from 'react-native';

import moreMeals from './data/moreMeals.json';
import { MoreCard } from './MoreCard';

export function MoreList() {
  return (
    <FlatList
      data={moreMeals}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <MoreCard meal={item} />}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 20, paddingHorizontal: 16, paddingVertical: 16 }}
    />
  );
}
