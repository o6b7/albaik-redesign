import { useAuthStore } from '@/store/auth-store';
import { useOrders } from '@/store/order-store';
import { router } from 'expo-router';
import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  User,
} from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isDark = useColorScheme() === 'dark';
  const { pastOrders } = useOrders();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0F0F0F' : '#fff' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Header */}
        <TouchableOpacity
          onPress={() => router.push('/profile/account-information' as any)}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#C0392B',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: isDark ? '#F5F5F5' : '#111',
              }}
              numberOfLines={1}
            >
              {user?.fullName}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#888' : '#777',
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {user?.email}
            </Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#555' : '#ccc'} />
        </TouchableOpacity>

        {/* Orders Quick Access */}
        <TouchableOpacity
          onPress={() => router.push('/order/history' as any)}
          activeOpacity={0.6}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 20,
            marginBottom: 24,
            backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
            borderRadius: 12,
            padding: 14,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#252525' : '#EFEFEF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={18} color={isDark ? '#999' : '#666'} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: isDark ? '#E8E8E8' : '#222',
              }}
            >
              My Orders
            </Text>
            {pastOrders.length > 0 && (
              <Text style={{ fontSize: 12, color: isDark ? '#666' : '#999', marginTop: 1 }}>
                {pastOrders.length} past order{pastOrders.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <ChevronRight size={18} color={isDark ? '#444' : '#ccc'} />
        </TouchableOpacity>

        {/* Account Section */}
        <SectionHeader label="Account" isDark={isDark} />
        <MenuGroup isDark={isDark}>
          <MenuItem
            icon={User}
            label="Personal Info"
            onPress={() => router.push('/profile/account-information' as any)}
            isDark={isDark}
          />
          <MenuItem
            icon={CreditCard}
            label="Payment Methods"
            onPress={() => router.push('/profile/payment-methods' as any)}
            isDark={isDark}
            border
          />
          <MenuItem
            icon={MapPin}
            label="Saved Addresses"
            onPress={() => router.push('/profile/delivery-addresses' as any)}
            isDark={isDark}
            border
          />
        </MenuGroup>

        {/* Support */}
        <SectionHeader label="Support" isDark={isDark} />
        <MenuGroup isDark={isDark}>
          <MenuItem
            icon={HelpCircle}
            label="Help Center"
            onPress={() => {}}
            isDark={isDark}
          />
        </MenuGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '600',
        color: isDark ? '#555' : '#999',
        paddingHorizontal: 20,
        marginBottom: 6,
        marginTop: 8,
      }}
    >
      {label}
    </Text>
  );
}

function MenuGroup({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: isDark ? '#1A1A1A' : '#F7F7F7',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
  isDark,
  border,
}: {
  icon: typeof User;
  label: string;
  onPress: () => void;
  isDark: boolean;
  border?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: border ? 1 : 0,
        borderTopColor: isDark ? '#252525' : '#EBEBEB',
      }}
    >
      <Icon size={20} color={isDark ? '#888' : '#666'} />
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: '500',
          color: isDark ? '#E0E0E0' : '#222',
          marginLeft: 14,
        }}
      >
        {label}
      </Text>
      <ChevronRight size={18} color={isDark ? '#444' : '#ccc'} />
    </TouchableOpacity>
  );
}
