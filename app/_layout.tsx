import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import '../global.css';

import { useAuthStore } from '@/store/auth-store';
import { useFlyingItemStore } from '@/store/flying-item-store';
import { useThemeStore } from '@/store/theme-store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_SIZE = 150;

export const unstable_settings = {
  anchor: '(tabs)',
};

function FlyingItemOverlay() {
  const item = useFlyingItemStore((state) => state.item);
  const clear = useFlyingItemStore((state) => state.clear);
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!item) return;

    translateX.value = item.startX - IMAGE_SIZE / 2;
    translateY.value = item.startY - IMAGE_SIZE / 2;
    scale.value = 1;
    opacity.value = 1;

    // Cart icon = 2nd of 4 tabs, centered in tab bar
    const tabBarHeight = 59;
    const endX = SCREEN_WIDTH * 0.375 - IMAGE_SIZE / 2;
    const endY = SCREEN_HEIGHT - insets.bottom - tabBarHeight / 2 - IMAGE_SIZE / 2;

    const duration = 700;
    const easing = Easing.bezier(0.4, 0, 0.2, 1);

    translateX.value = withTiming(endX, { duration, easing });
    translateY.value = withTiming(endY, { duration, easing });
    scale.value = withTiming(0.1, { duration, easing });
    opacity.value = withDelay(
      500,
      withTiming(0, { duration: 200 }, () => {
        runOnJS(clear)();
      })
    );
  }, [item]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!item) return null;

  return (
    <Animated.View style={[styles.flyingContainer, animatedStyle]} pointerEvents="none">
      <Animated.Image
        source={{ uri: item.image }}
        style={styles.flyingImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flyingContainer: {
    position: 'absolute',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    zIndex: 9999,
  },
  flyingImage: {
    width: '100%',
    height: '100%',
  },
});

export default function RootLayout() {
  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const [ready, setReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait for zustand to rehydrate from AsyncStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => setReady(true));
    if (useAuthStore.persist.hasHydrated()) setReady(true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = segments[0] as string;
    const inAuth = root === '(auth)';
    const inDriverArea = root === '(driver)' || root === 'driver-order';
    const inRestaurantArea = root === '(restaurant)' || root === 'restaurant-order';

    if (!user) {
      if (!inAuth) router.replace('/(auth)/login' as any);
      return;
    }

    const role = user.role ?? 'customer';
    const home =
      role === 'driver' ? '/(driver)/orders'
      : role === 'restaurant' ? '/(restaurant)/orders'
      : '/(tabs)';

    const inForeignArea =
      role === 'driver' ? !inDriverArea
      : role === 'restaurant' ? !inRestaurantArea
      : inDriverArea || inRestaurantArea;

    if (inAuth || inForeignArea) router.replace(home as any);
  }, [user, ready, segments]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#121212]">
        <ActivityIndicator size="large" color="#C0392B" />
      </View>
    );
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="see-all/[type]" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="order/history" options={{ headerShown: false }} />
        <Stack.Screen name="driver-order/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant-order/[id]" options={{ headerShown: false }} />
      </Stack>
      <FlyingItemOverlay />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
