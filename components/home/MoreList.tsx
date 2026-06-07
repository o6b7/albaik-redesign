import { FlatList } from 'react-native';

import { SubHeader } from '../SubHeader';
import { MoreCard } from './MoreCard';

import { useCollection } from '@/hooks/useFirestore';
import { MoreCardSkeleton } from './Skeleton';
import { SideMeal } from './types';

export function MoreList({ onSeeAll }: { onSeeAll?: () => void }) {
  const { data: moreMeals, loading } = useCollection<SideMeal>("more");

  if (loading) return <><SubHeader title="More" /><MoreCardSkeleton /></>

  return (
    <>
      <SubHeader title="More" onSeeAll={onSeeAll} />
      <FlatList
        data={moreMeals}
        keyExtractor={(item) => item.firestoreId}
        renderItem={({ item }) => <MoreCard meal={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 16, paddingVertical: 16 }}
      />
    </>
  );
}
