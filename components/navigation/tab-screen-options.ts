import { HapticTab } from '@/components/haptic-tab';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';

/** Shared tab-bar styling for all three role portals. */
export function useTabScreenOptions(): BottomTabNavigationOptions {
  const isDark = useColorScheme() === 'dark';

  return {
    tabBarActiveTintColor: '#EF4444',
    tabBarInactiveTintColor: isDark ? '#666' : '#A3A3A3',
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
      borderTopWidth: 0,
      elevation: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      paddingTop: 10,
    },
  };
}
