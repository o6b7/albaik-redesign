import { SCALED_TEXT } from '@/lib/a11y';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';

/** Standard stack-screen header: round back button + centered title. */
export function ScreenHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? '#2A2A2A' : '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <ArrowLeft size={20} color={isDark ? '#ccc' : '#333'} />
      </TouchableOpacity>
      <Text
        {...SCALED_TEXT}
        numberOfLines={1}
        style={{
          flex: 1,
          textAlign: 'center',
          paddingHorizontal: 8,
          fontSize: 18,
          fontWeight: '700',
          color: isDark ? '#fff' : '#1a1a1a',
        }}
      >
        {title}
      </Text>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
