import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveOrderBanner } from '@/components/ActiveOrderBanner';
import { CategoryTabs } from '@/components/home/CategoryTabs';
import { Header } from '@/components/home/Header';
import { MenuList } from '@/components/home/MenuList';
import { MoreList } from '@/components/home/MoreList';
import { SearchBar } from '@/components/home/SearchBar';
import { useOrders } from '@/store/order-store';
import { useState } from 'react';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { activeOrder } = useOrders();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5] dark:bg-[#121212]" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        {activeOrder && <ActiveOrderBanner order={activeOrder} />}
        <SearchBar onSearch={setSearchQuery} />
        <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <MenuList activeCategory={activeCategory} onSeeAll={() => router.push('/see-all/meals')} searchedQuery={searchQuery} />
        <MoreList onSeeAll={() => router.push('/see-all/more')} />
      </ScrollView>
    </SafeAreaView>
  );
}
