import { useAuthStore } from '@/store/auth-store';
import { router } from 'expo-router';
import { ChevronRight, CreditCard, MapPin, User } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView>
      <Text className="text-xl font-bold text-center my-8">My Account</Text>
      <View className='w-full px-4'>
        <View className='flex-row items-center p-4 rounded-lg'>
          <View className='w-24 h-24 rounded-full bg-[#C0392B] items-center justify-center'>
            <Text className='text-white text-3xl font-bold'>
              {user?.fullName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className='text-2xl font-bold ml-4'>{user?.fullName}</Text>
        </View>
        <View className='px-3 gap-8 mt-5'>
          <TouchableOpacity
            className='flex-row items-center border-b-[1px] border-[#cecece] pb-4 w-full'
            onPress={() => router.push('/profile/account-information' as any)}
          >
            <View className='p-2 border-2 border-[#9e9e9e] rounded-full'>
              <User size={35} color={'#9e9e9e'} />
            </View>
            <View className='justify-between flex-row w-[85%] items-center'>
              <Text className='ml-5 text-xl font-bold text-[#494949]'>Account Informations</Text>
              <ChevronRight size={20} color={'#9e9e9e'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/profile/payment-methods' as any)}
            className='flex-row items-center border-b-[1px] border-[#cecece] pb-4'
          >
            <View className='p-2 border-2 border-[#9e9e9e] rounded-full'>
              <CreditCard size={35} color={'#9e9e9e'} />
            </View>
            <View className='justify-between flex-row w-[85%] items-center'>
              <Text className='ml-5 text-xl font-bold text-[#494949]'>Payment Methods</Text>
              <ChevronRight size={20} color={'#9e9e9e'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/profile/delivery-addresses' as any)}
            className='flex-row items-center border-b-[1px] border-[#cecece] pb-4'
          >
            <View className='p-2 border-2 border-[#9e9e9e] rounded-full'>
              <MapPin size={35} color={'#9e9e9e'} />
            </View>
            <View className='justify-between flex-row w-[85%] items-center'>
              <Text className='ml-5 text-xl font-bold text-[#494949]'>Delivery Location</Text>
              <ChevronRight size={20} color={'#9e9e9e'} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
