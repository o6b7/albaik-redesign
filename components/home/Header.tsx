import { auth } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { signOut } from 'firebase/auth';
import { Bell, ChevronDown, LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

export function Header() {
  const [showDropDown, setShowDropDown] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const isDark = useColorScheme() === 'dark';

  const handleLogout = async () => {
    setShowDropDown(false);
    await signOut(auth);
    clearUser();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View className="flex-row justify-between bg-gray-100 dark:bg-[#121212] rounded-md mb-2 items-center" style={{ zIndex: 50 }}>
      <View>
        <Text className='mb-1 dark:text-gray-400'>{greeting}</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => setShowDropDown(!showDropDown)} className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-gray-600 dark:text-gray-200">{user?.fullName ?? 'Guest'}</Text>
            <ChevronDown size={16} color={isDark ? '#aaa' : '#718096'} />
          </TouchableOpacity>
          {showDropDown && (
            <View className='absolute top-8 left-32 bg-white dark:bg-[#2A2A2A] rounded-md shadow-md p-2 z-50' style={{ elevation: 5 }}>
              <TouchableOpacity className='px-4 py-2 flex-row gap-1 items-center' onPress={handleLogout}>
                <LogOut size={20} color="#EF4444" />
                <Text className='font-bold text-red-500'>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View className='flex-row gap-4'>
        <Bell size={24} color="#EF4444" />
      </View>
    </View>
  );
}
