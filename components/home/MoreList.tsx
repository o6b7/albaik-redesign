import { FlatList } from 'react-native';

import { SubHeader } from '../SubHeader';
import moreMeals from './data/moreMeals.json';
import { MoreCard } from './MoreCard';

export function MoreList({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <>
      <SubHeader title="More" onSeeAll={onSeeAll} />
      <FlatList
        data={moreMeals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MoreCard meal={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 16, paddingVertical: 16 }}
      />
    </>
  );
}
