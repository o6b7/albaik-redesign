import {
  DESTINATION,
  RESTAURANT,
  RESTAURANT_ADDRESS,
  RESTAURANT_NAME,
  computeEarnings,
  haversineKm,
} from '@/constants/delivery';
import { db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

/**
 * Unified order status — the single source of truth shared by the customer,
 * restaurant and driver apps.
 *
 *   verifying            customer placed; waiting for the restaurant to confirm
 *   cooking              restaurant confirmed; kitchen working; visible to drivers
 *   accepted…meal_collected   driver-controlled pickup leg
 *   driving_to_customer  delivery leg
 *   delivered / cancelled    terminal states
 *
 * Food preparation runs in PARALLEL with the driver's movement, so it lives in
 * a separate `foodReady` flag (set by the restaurant) rather than in `status`.
 * A driver can only collect the meal once `foodReady` is true.
 */
export type OrderStatus =
  | 'verifying'
  | 'cooking'
  | 'accepted'
  | 'driving_to_restaurant'
  | 'arrived_at_restaurant'
  | 'meal_collected'
  | 'driving_to_customer'
  | 'delivered'
  | 'cancelled';

/** Customer-facing 5-stage tracker keys. */
export type OrderStage = 'verifying' | 'cooking' | 'driver' | 'delivering' | 'delivered';

export interface OrderItem {
  name: string;
  price: string;
  currency: string;
  image: string;
  quantity: number;
  toppings: { id: number; name: string; price: string }[];
}

export interface OrderParty {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  customerId: string;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  /** Live driver position, written by the driver app while en route. */
  driverLocation: { latitude: number; longitude: number } | null;

  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;

  paymentMethodId: string;
  paymentLast4: string;
  paymentCardType: string;

  addressId: string;
  addressLabel: string;
  addressStreet: string;
  addressCity: string;

  restaurant: OrderParty;
  customer: OrderParty;
  distanceKm: number;
  earnings: number;

  status: OrderStatus;
  /** Kitchen track — runs in parallel with the driver's movement. */
  foodReady: boolean;
  foodReadyAt: string | null;

  createdAt: string;
  estimatedDelivery: string;
  acceptedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

/** Customer-facing tracker stages (the vertical stepper). */
export const ORDER_STAGES: { key: OrderStage; label: string; duration: number }[] = [
  { key: 'verifying', label: 'Confirming Order', duration: 2 },
  { key: 'cooking', label: 'Preparing Food', duration: 8 },
  { key: 'driver', label: 'Driver Picking Up', duration: 5 },
  { key: 'delivering', label: 'On the Way', duration: 5 },
];

/** Stages that count as an in-progress (active) order. */
const ACTIVE_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  'verifying',
  'cooking',
  'accepted',
  'driving_to_restaurant',
  'arrived_at_restaurant',
  'meal_collected',
  'driving_to_customer',
]);

/** Fields the checkout flow provides; the rest are derived in `placeOrder`. */
export type PlaceOrderInput = Pick<
  Order,
  | 'items'
  | 'subtotal'
  | 'vat'
  | 'total'
  | 'paymentMethodId'
  | 'paymentLast4'
  | 'paymentCardType'
  | 'addressId'
  | 'addressLabel'
  | 'addressStreet'
  | 'addressCity'
  | 'createdAt'
  | 'estimatedDelivery'
>;

export function useOrders() {
  const user = useAuthStore((state) => state.user);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'orders'), where('customerId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        const active = all
          .filter((o) => ACTIVE_STATUSES.has(o.status))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const finished = all
          .filter((o) => o.status === 'delivered' || o.status === 'cancelled')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setActiveOrder(active[0] ?? null);
        setPastOrders(finished);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to orders:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const placeOrder = useCallback(
    async (input: PlaceOrderInput) => {
      if (!user) return;

      const distanceKm = haversineKm(RESTAURANT, DESTINATION);
      const order: Omit<Order, 'id'> = {
        ...input,
        customerId: user.uid,
        driverId: null,
        driverName: null,
        driverPhone: null,
        driverLocation: null,
        restaurant: {
          name: RESTAURANT_NAME,
          address: RESTAURANT_ADDRESS,
          latitude: RESTAURANT.latitude,
          longitude: RESTAURANT.longitude,
        },
        customer: {
          name: user.fullName || 'Customer',
          address: `${input.addressStreet}, ${input.addressCity}`,
          latitude: DESTINATION.latitude,
          longitude: DESTINATION.longitude,
        },
        distanceKm: Math.round(distanceKm * 10) / 10,
        earnings: computeEarnings(distanceKm),
        status: 'verifying',
        foodReady: false,
        foodReadyAt: null,
        acceptedAt: null,
        deliveredAt: null,
        cancelledAt: null,
      };

      const docRef = await addDoc(collection(db, 'orders'), order);
      const newOrder = { id: docRef.id, ...order };
      setActiveOrder(newOrder);
      return newOrder;
    },
    [user]
  );

  const refresh = useCallback(() => {}, []);

  return { activeOrder, pastOrders, loading, placeOrder, refresh };
}
