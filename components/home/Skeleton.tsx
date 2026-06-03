import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function SkeletonBox({ width, height, rounded = 12 }: { width: number | string; height: number; rounded?: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: rounded,
          backgroundColor: '#D1D5DB',
        },
        style,
      ]}
    />
  );
}

export function CategoryTabsSkeleton() {
  return (
    <View className="bg-gray-100 rounded-md mb-2 flex-row px-4 py-2 gap-2">
      {[80, 90, 70, 80, 70, 90].map((w, i) => (
        <SkeletonBox key={i} width={w} height={32} rounded={16} />
      ))}
    </View>
  );
}

export function MealCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="flex-row gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="w-[210px] h-[260px] rounded-3xl p-5 gap-3" style={{ backgroundColor: '#E5E7EB' }}>
          <SkeletonBox width="70%" height={16} />
          <SkeletonBox width="50%" height={12} />
          <View className="items-center flex-1 justify-center">
            <SkeletonBox width={120} height={120} rounded={60} />
          </View>
          <View className="flex-row justify-between">
            <SkeletonBox width={80} height={14} />
            <SkeletonBox width={50} height={20} rounded={8} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function MoreCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="flex-row gap-5 px-4 py-4">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="w-44 h-52 rounded-3xl p-4 bg-white justify-between">
          <View className="items-center">
            <SkeletonBox width={100} height={100} rounded={50} />
          </View>
          <View className="gap-1">
            <SkeletonBox width="60%" height={14} />
            <SkeletonBox width="40%" height={12} />
            <SkeletonBox width="30%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}
