import { customerStageFromStatus } from '@/constants/delivery';
import { Order } from '@/store/order-store';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, Package } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

const STAGE_LABELS: Record<string, string> = {
  verifying: 'Waiting for confirmation',
  cooking: 'Preparing your food',
  driver: 'Driver picking up your order',
  delivering: 'On the way to you',
  delivered: 'Delivered',
};

export function ActiveOrderBanner({ order }: { order: Order }) {
  const router = useRouter();
  const stage = customerStageFromStatus(order.status);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/order/${order.id}` as any)}
      activeOpacity={0.85}
      style={{
        marginBottom: 12,
        backgroundColor: '#FEF3C7',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: '#FDE68A',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Package size={22} color="#D97706" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>
          Order in progress
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 3,
            gap: 4,
          }}
        >
          <Clock size={12} color="#B45309" />
          <Text style={{ fontSize: 12, color: '#B45309', fontWeight: '500' }}>
            {STAGE_LABELS[stage] ?? stage}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color="#B45309" />
    </TouchableOpacity>
  );
}
