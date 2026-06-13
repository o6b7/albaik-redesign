import { DRIVER_ORIGIN, LatLng, isAvailableForDriver } from '@/constants/delivery';
import { db } from '@/firebase';
import { AppUser, useAuthStore } from '@/store/auth-store';
import { Order, OrderStatus } from '@/store/order-store';
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

/**
 * Atomically claim an order. Throws if another driver got there first or the
 * order is no longer available.
 */
export async function acceptOrderAsDriver(driver: AppUser, orderId: string) {
  const ref = doc(db, 'orders', orderId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Order no longer exists');
    const data = snap.data() as Order;
    if (data.driverId) throw new Error('Order was already accepted');
    if (!isAvailableForDriver(data.status)) throw new Error('Order is no longer available');
    tx.update(ref, {
      driverId: driver.uid,
      driverName: driver.fullName || 'Driver',
      driverPhone: driver.phone ?? null,
      driverLocation: DRIVER_ORIGIN,
      status: 'accepted' as OrderStatus,
      acceptedAt: new Date().toISOString(),
    });
  });
}

/** Advance an order this driver owns to the next status. */
export async function advanceOrderStatus(
  orderId: string,
  status: OrderStatus,
  location?: LatLng
) {
  const updates: Record<string, unknown> = { status };
  if (status === 'delivered') updates.deliveredAt = new Date().toISOString();
  if (location) updates.driverLocation = location;
  await updateDoc(doc(db, 'orders', orderId), updates);
}

/** Fire-and-forget live position update while the driver is moving. */
export function writeDriverLocation(orderId: string, location: LatLng) {
  updateDoc(doc(db, 'orders', orderId), { driverLocation: location }).catch(() => {});
}

/**
 * Driver-side view of the order pool. Uses two single-field equality listeners
 * (no composite index required):
 *  - `driverId == null`  → restaurant-confirmed orders available to accept
 *  - `driverId == uid`   → this driver's active + completed deliveries
 */
export function useDriverOrders() {
  const user = useAuthStore((state) => state.user);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'orders'), where('driverId', '==', null));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        const available = all
          .filter((o) => isAvailableForDriver(o.status))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        setAvailableOrders(available);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to available orders:', err);
        setError('Could not load available orders.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('driverId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        const active = all
          .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const delivered = all
          .filter((o) => o.status === 'delivered')
          .sort((a, b) =>
            (b.deliveredAt ?? b.createdAt).localeCompare(a.deliveredAt ?? a.createdAt)
          );
        setActiveOrder(active[0] ?? null);
        setPastOrders(delivered);
      },
      (err) => {
        console.error("Error listening to driver's orders:", err);
        setError('Could not load your deliveries.');
      }
    );
    return () => unsubscribe();
  }, [user]);

  const acceptOrder = useCallback(
    async (orderId: string) => {
      if (!user) throw new Error('Not signed in');
      await acceptOrderAsDriver(user, orderId);
    },
    [user]
  );

  return {
    availableOrders,
    activeOrder,
    pastOrders,
    loading,
    error,
    acceptOrder,
  };
}
