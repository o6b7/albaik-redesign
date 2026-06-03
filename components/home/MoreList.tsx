import { FlatList, Text } from 'react-native';

import { SubHeader } from '../SubHeader';
import { MoreCard } from './MoreCard';

import { useCollection } from '@/hooks/useFirestore';
import { MoreCardSkeleton } from './Skeleton';

export function MoreList({ onSeeAll }: { onSeeAll?: () => void }) {
  const { data: moreMeals, loading } = useCollection("more");

  if (loading) return <><SubHeader title="More" /><MoreCardSkeleton /></>

  return (
    <>
      <SubHeader title="More" onSeeAll={onSeeAll} />
      <FlatList
        data={moreMeals}
        keyExtractor={(item: any) => item.firestoreId.toString()}
        renderItem={({ item }: { item: any }) => <MoreCard meal={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 16, paddingVertical: 16 }}
      />
    </>
  );
}
