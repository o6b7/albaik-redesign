import { db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import { Order, OrderStatus } from '@/store/order-store';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

/** Confirm an incoming order — the kitchen starts working on it. */
export async function confirmOrder(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'cooking' as OrderStatus,
  });
}

/** Decline an incoming order before any driver is involved. */
export async function rejectOrder(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'cancelled' as OrderStatus,
    cancelledAt: new Date().toISOString(),
  });
}

/** Kitchen finished — the driver can now collect the meal. */
export async function markFoodReady(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    foodReady: true,
    foodReadyAt: new Date().toISOString(),
  });
}

/** Statuses where the kitchen still owns the food (before driver handoff). */
const PRE_HANDOFF: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  'cooking',
  'accepted',
  'driving_to_restaurant',
  'arrived_at_restaurant',
]);

/**
 * Restaurant-side view of the order pipeline (single restaurant, so it
 * listens to the whole collection):
 *  - incoming:  waiting for the kitchen to confirm or reject
 *  - preparing: confirmed, food still being cooked
 *  - ready:     food ready, waiting for the driver to collect it
 *  - history:   handed off, delivered, or cancelled
 */
export function useRestaurantOrders() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to restaurant orders:', err);
        setError('Could not load orders.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const incoming = orders
    .filter((o) => o.status === 'verifying')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const preparing = orders
    .filter((o) => PRE_HANDOFF.has(o.status) && !o.foodReady)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const ready = orders
    .filter((o) => PRE_HANDOFF.has(o.status) && o.foodReady)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const history = orders
    .filter(
      (o) =>
        o.status === 'meal_collected' ||
        o.status === 'driving_to_customer' ||
        o.status === 'delivered' ||
        o.status === 'cancelled'
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { orders, incoming, preparing, ready, history, loading, error };
}
