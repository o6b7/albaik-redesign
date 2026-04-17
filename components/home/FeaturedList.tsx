import { Image, Text, View } from 'react-native';
import { IconSymbol } from '../ui/icon-symbol';

export function FeaturedList() {
  return (
    <View className="py-4 bg-gray-100 rounded-md mb-2 items-center justify-center">
      <View className='bg-red-500 rounded-3xl w-52 p-5'>
        <View className='flex-row justify-between'>
          <View>
            <Text className='font-bold text-lg text-white'>Big Baik</Text>
            <Text className='text-white'>Checken with more</Text>
          </View>
          <View>
            <IconSymbol name='heart' size={12} color="#fff" />
          </View>
        </View>
        <View className='items-center' style={{ overflow: 'visible' }}>
          <View style={{
            shadowColor: '#fff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 25,
            overflow: 'visible'
          }}>
            <Image
              source={require('../../assets/menu/bigBaik.png')}
              style={{
                width: 120,
                height: 120,
                overflow: 'visible'
              }}
              resizeMode="contain"
            />
          </View>
        </View>
        <View className='flex-row justify-between'>
          <View>
            <View>
              <View className="flex-row">
                <IconSymbol name="star.fill" size={14} color="#fff" />
                <IconSymbol name="star.fill" size={14} color="#fff" />
                <IconSymbol name="star.fill" size={14} color="#fff" />
                <IconSymbol name="star.fill" size={14} color="#fff" />
                <IconSymbol name="star.fill" size={14} color="#572b2b" />
              </View>
              <Text className="text-white text-xs ml-1">54 Reviews</Text>
            </View>
          </View>
          <View className='bg-white rounded-l-lg px-2 py-1 left-5'>
            <Text className='text-red-500 font-bold'> 12 SAR </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
