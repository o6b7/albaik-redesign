import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { useUserCollection } from '@/hooks/useUserCollection';
import { Address, PaymentMethod } from '@/lib/types';
import { CartItem, useCartStore } from '@/store/cart-store';
import { OrderItem, useOrders } from '@/store/order-store';

interface CheckoutSheetProps {
  items: CartItem[];
  onOrderPlaced: () => void;
}

const CARD_TYPE_COLORS: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  other: '#333',
};

export const CheckoutSheet = forwardRef<BottomSheet, CheckoutSheetProps>(
  function CheckoutSheet({ items, onOrderPlaced }, ref) {
    const isDark = useColorScheme() === 'dark';
    const snapPoints = useMemo(() => ['85%'], []);
    const clearCart = useCartStore((state) => state.clearCart);
    const { placeOrder } = useOrders();

    const { data: payments, loading: paymentsLoading } =
      useUserCollection<PaymentMethod>('paymentMethods');
    const { data: addresses, loading: addressesLoading } =
      useUserCollection<Address>('addresses');

    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
      if (payments.length > 0 && !selectedPayment) {
        const def = payments.find((p) => p.isDefault) ?? payments[0];
        setSelectedPayment(def.id);
      }
    }, [payments, selectedPayment]);

    useEffect(() => {
      if (addresses.length > 0 && !selectedAddress) {
        const def = addresses.find((a) => a.isDefault) ?? addresses[0];
        setSelectedAddress(def.id);
      }
    }, [addresses, selectedAddress]);

    const subtotal = items.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) * item.quantity;
      const toppingsPrice =
        item.toppings.reduce(
          (t, top) => t + (top.price === 'free' ? 0 : parseFloat(top.price)),
          0
        ) * item.quantity;
      return sum + itemPrice + toppingsPrice;
    }, 0);

    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    const handlePlaceOrder = useCallback(async () => {
      if (!selectedPayment || !selectedAddress) {
        Alert.alert('Missing Info', 'Please select a payment method and delivery address.');
        return;
      }

      const payment = payments.find((p) => p.id === selectedPayment)!;
      const address = addresses.find((a) => a.id === selectedAddress)!;

      setPlacing(true);
      try {
        const now = new Date();
        const estimated = new Date(now.getTime() + 20 * 60 * 1000);

        const orderItems: OrderItem[] = items.map((item) => ({
          name: item.name,
          price: item.price,
          currency: item.currency,
          image: item.image,
          quantity: item.quantity,
          toppings: item.toppings,
        }));

        await placeOrder({
          items: orderItems,
          subtotal,
          vat,
          total,
          paymentMethodId: payment.id,
          paymentLast4: payment.cardNumber.slice(-4),
          paymentCardType: payment.cardType,
          addressId: address.id,
          addressLabel: address.label,
          addressStreet: address.street,
          addressCity: address.city,
          createdAt: now.toISOString(),
          estimatedDelivery: estimated.toISOString(),
        });

        clearCart();
        (ref as any)?.current?.close();
        onOrderPlaced();
      } catch (error) {
        console.error('Error placing order:', error);
        Alert.alert('Error', 'Failed to place order. Please try again.');
      } finally {
        setPlacing(false);
      }
    }, [selectedPayment, selectedAddress, payments, addresses, items, subtotal, vat, total, placeOrder, clearCart, ref, onOrderPlaced]);

    const loading = paymentsLoading || addressesLoading;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: isDark ? '#1a1a1a' : '#FAFAFA',
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#555' : '#D0D0D0',
          width: 40,
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: isDark ? '#fff' : '#1a1a1a',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Checkout
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#C0392B" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Order Summary */}
              <SectionLabel text="Order Summary" isDark={isDark} />
              <View
                style={{
                  backgroundColor: isDark ? '#2A2A2A' : '#fff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {items.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: isDark ? '#E0E0E0' : '#333',
                        }}
                      >
                        {item.quantity}x {item.name}
                      </Text>
                      {item.toppings.length > 0 && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: isDark ? '#888' : '#999',
                            marginTop: 2,
                          }}
                        >
                          {item.toppings.map((t) => t.name).join(', ')}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: isDark ? '#E0E0E0' : '#333',
                      }}
                    >
                      ⃁{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View
                  style={{
                    height: 1,
                    backgroundColor: isDark ? '#3A3A3A' : '#F0F0F0',
                    marginVertical: 12,
                  }}
                />

                <Row label="Subtotal" value={`⃁${subtotal.toFixed(2)}`} isDark={isDark} />
                <Row label="VAT (15%)" value={`⃁${vat.toFixed(2)}`} isDark={isDark} />
                <View
                  style={{
                    height: 1,
                    backgroundColor: isDark ? '#3A3A3A' : '#F0F0F0',
                    marginVertical: 8,
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: isDark ? '#fff' : '#1a1a1a',
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: '#C0392B',
                    }}
                  >
                    ⃁{total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Payment Method */}
              <SectionLabel text="Payment Method" isDark={isDark} />
              {payments.length === 0 ? (
                <EmptyCard
                  icon={<CreditCard size={20} color="#C0392B" />}
                  text="No payment methods saved"
                  buttonText="Add Payment Method"
                  isDark={isDark}
                />
              ) : (
                <View style={{ gap: 10, marginBottom: 20 }}>
                  {payments.map((pm) => {
                    const selected = selectedPayment === pm.id;
                    return (
                      <TouchableOpacity
                        key={pm.id}
                        onPress={() => setSelectedPayment(pm.id)}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: isDark ? '#2A2A2A' : '#fff',
                          borderRadius: 14,
                          padding: 14,
                          borderWidth: selected ? 2 : 1,
                          borderColor: selected
                            ? '#C0392B'
                            : isDark
                            ? '#3A3A3A'
                            : '#F0F0F0',
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: CARD_TYPE_COLORS[pm.cardType],
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <CreditCard size={18} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '600',
                              color: isDark ? '#E0E0E0' : '#333',
                            }}
                          >
                            {pm.cardType.charAt(0).toUpperCase() + pm.cardType.slice(1)} ····{' '}
                            {pm.cardNumber.slice(-4)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: isDark ? '#888' : '#999',
                              marginTop: 2,
                            }}
                          >
                            {pm.cardholderName}
                          </Text>
                        </View>
                        {selected && (
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: '#C0392B',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={14} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Delivery Address */}
              <SectionLabel text="Delivery Address" isDark={isDark} />
              {addresses.length === 0 ? (
                <EmptyCard
                  icon={<MapPin size={20} color="#C0392B" />}
                  text="No addresses saved"
                  buttonText="Add Address"
                  isDark={isDark}
                />
              ) : (
                <View style={{ gap: 10, marginBottom: 24 }}>
                  {addresses.map((addr) => {
                    const selected = selectedAddress === addr.id;
                    return (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => setSelectedAddress(addr.id)}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: isDark ? '#2A2A2A' : '#fff',
                          borderRadius: 14,
                          padding: 14,
                          borderWidth: selected ? 2 : 1,
                          borderColor: selected
                            ? '#C0392B'
                            : isDark
                            ? '#3A3A3A'
                            : '#F0F0F0',
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: isDark ? '#2A3A2A' : '#F0FFF4',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <MapPin size={18} color="#2D8B4E" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: '600',
                              color: isDark ? '#E0E0E0' : '#333',
                            }}
                          >
                            {addr.label}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: isDark ? '#888' : '#999',
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            {addr.street}, {addr.city}
                          </Text>
                        </View>
                        {selected && (
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: '#C0392B',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={14} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Secure Checkout Notice */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  gap: 6,
                }}
              >
                <ShieldCheck size={14} color={isDark ? '#666' : '#bbb'} />
                <Text style={{ fontSize: 12, color: isDark ? '#666' : '#bbb' }}>
                  Secure checkout powered by Al Baik
                </Text>
              </View>

              {/* Place Order */}
              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={placing || !selectedPayment || !selectedAddress}
                activeOpacity={0.85}
                style={{
                  backgroundColor:
                    placing || !selectedPayment || !selectedAddress
                      ? isDark
                        ? '#333'
                        : '#E0E0E0'
                      : '#C0392B',
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#C0392B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: placing ? 0 : 0.3,
                  shadowRadius: 12,
                  elevation: placing ? 0 : 6,
                }}
              >
                {placing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text maxFontSizeMultiplier={1.2} style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                      Place Order
                    </Text>
                    <Text maxFontSizeMultiplier={1.2} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' }}>
                      · ${total.toFixed(2)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

function SectionLabel({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: isDark ? '#777' : '#999',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
      }}
    >
      {text}
    </Text>
  );
}

function Row({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontSize: 13, color: isDark ? '#999' : '#777' }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#ccc' : '#555' }}>
        {value}
      </Text>
    </View>
  );
}

function EmptyCard({
  icon,
  text,
  buttonText,
  isDark,
}: {
  icon: React.ReactNode;
  text: string;
  buttonText: string;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: isDark ? '#2A2A2A' : '#fff',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      {icon}
      <Text style={{ fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 8 }}>{text}</Text>
      <Text style={{ fontSize: 12, color: '#C0392B', fontWeight: '600', marginTop: 6 }}>
        Go to Profile to {buttonText}
      </Text>
    </View>
  );
}
