import { Image, Text, View } from 'react-native';

export function MoreList() {
  return (
    <View className="py-12 bg-gray-100 rounded-md mb-2 items-center justify-center">
      <View className=''>
        <View className='items-center'>
          <Image source={require("../../assets/menu/bigBaik.png")} className='w-32 h-32' />
          <Text>More</Text>
        </View>
      </View>
    </View>
  );
}
