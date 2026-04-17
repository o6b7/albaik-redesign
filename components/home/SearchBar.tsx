import { TextInput, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

export function SearchBar() {
  return (
    <View className="flex-row items-center px-4 py-3 bg-[#E2E8F0] rounded-2xl mb-6 mt-2">
      <IconSymbol name="magnifyingglass" size={24} color="#718096" />
      <TextInput
        className="flex-1 ml-3 text-base text-gray-800"
        placeholderTextColor="#A0AEC0"
        placeholder="Search..."
      />
      <IconSymbol name="slider.horizontal.3" size={24} color="#718096" />
    </View>
  );
}
