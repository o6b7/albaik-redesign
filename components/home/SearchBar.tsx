import { Search, SlidersHorizontal } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <View className="flex-row items-center px-4 py-3 bg-[#E2E8F0] dark:bg-[#2A2A2A] rounded-2xl mb-6 mt-2">
      <Search size={24} color="#718096" />
      <TextInput
        className="flex-1 ml-3 text-base text-gray-800 dark:text-gray-200"
        placeholderTextColor="#A0AEC0"
        placeholder="Search..."
        onChangeText={onSearch}
      />
      <SlidersHorizontal size={24} color="#718096" />
    </View>
  );
}
