import { useAuthStore } from '@/store/auth-store';
import { ChevronRight, CreditCard, MapPin, User } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView>
      <Text className="text-xl font-bold text-center my-8">My Account</Text>
      <View className='w-full px-4'>
        <View className='flex-row items-center p-4 rounded-lg'>
          <Image source={require('@/assets/images/profileImage.jpg')} className='w-24 h-24 rounded-full' />
          <Text className='text-2xl font-bold ml-4'>{user?.fullName}</Text>
        </View>
        <View className='px-3 gap-8 mt-5'>
          <View className='flex-row items-center border-b-[1px] border-[#cecece] pb-4 w-full'>
            <View className='p-2 border-2 border-[#9e9e9e] rounded-full'>
              <User size={35} color={'#9e9e9e'} />
            </View>
            <View className='justify-between flex-row w-[85%] items-center'>
              <Text className='ml-5 text-xl font-bold text-[#494949]'>Account Informations</Text>
              <ChevronRight size={20} color={'#9e9e9e'} />
            </View>
          </View>
          <View className='flex-row items-center border-b-[1px] border-[#cecece] pb-4'>
            <View className='p-2 border-2 border-[#9e9e9e] rounded-full'>
              <CreditCard size={35} color={'#9e9e9e'} />
            </View>
            <View className='justify-between flex-row w-[85%] items-center'>
              <Text className='ml-5 text-xl font-bold text-[#494949]'>Payment Methods</Text>
              <ChevronRight size={20} color={'#9e9e9e'} />
            </View>
          </View>
          <View className='flex-row  items-center border-b-[1px] border-[#cecece] pb-4'>
            <View className='p-2 border-2 border-[#9e9e9e] rounded-full'>
              <MapPin size={35} color={'#9e9e9e'} />
            </View>
            <View className='justify-between flex-row w-[85%] items-center'>
              <Text className='ml-5 text-xl font-bold text-[#494949]'>Delivery Location</Text>
              <ChevronRight size={20} color={'#9e9e9e'} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
