import { Text, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

export function Header() {
  return (
    <View className="flex-row justify-between bg-gray-100 rounded-md mb-2 items-center justify-center">
      {/* <Text className="text-gray-500">Header (Greeting, Name, Notification Bell)</Text> */}
      <View>
        <Text className='mb-1'>Good Morning</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-gray-600">Qusai Mansoor</Text>
          <IconSymbol name='arrow.down' size={12} color="#718096" />
        </View>

      </View>
      <View>
        <IconSymbol name="bell" size={24} color="#EF4444" />
      </View>
    </View>
  );
}
