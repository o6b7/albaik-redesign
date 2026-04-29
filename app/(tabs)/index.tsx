import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryTabs } from '@/components/home/CategoryTabs';
import { Header } from '@/components/home/Header';
import { MenuList } from '@/components/home/MenuList';
import { MoreList } from '@/components/home/MoreList';
import { SearchBar } from '@/components/home/SearchBar';
import { SubHeader } from '@/components/SubHeader';

import featuredMeals from '@/components/home/data/featuredMeals.json';

export default function HomeScreen() {
  // We use ScrollView so the content is scrollable when it overflows the screen height
  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <SearchBar />
        <CategoryTabs />
        <MenuList meals={featuredMeals} />
        <SubHeader title="More" />
        <MoreList />
      </ScrollView>
    </SafeAreaView>
  );
}
