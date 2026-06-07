import { db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export type OrderStage = 'verifying' | 'cooking' | 'driver' | 'delivering' | 'delivered';

export interface OrderItem {
  name: string;
  price: string;
  currency: string;
  image: string;
  quantity: number;
  toppings: { id: number; name: string; price: string }[];
}

export interface Order {
  id: string;
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
  stage: OrderStage;
  createdAt: string;
  estimatedDelivery: string;
}

export const ORDER_STAGES: { key: OrderStage; label: string; duration: number }[] = [
  { key: 'verifying', label: 'Verifying Order', duration: 5 },
  { key: 'cooking', label: 'Preparing Food', duration: 5 },
  { key: 'driver', label: 'Assigning Driver', duration: 5 },
  { key: 'delivering', label: 'On the Way', duration: 5 },
];

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
    const colRef = collection(db, 'users', user.uid, 'orders');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const activeStages = new Set(['verifying', 'cooking', 'driver', 'delivering']);
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        const active = all
          .filter((o) => activeStages.has(o.stage))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const delivered = all
          .filter((o) => o.stage === 'delivered')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setActiveOrder(active[0] ?? null);
        setPastOrders(delivered);
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
    async (order: Omit<Order, 'id'>) => {
      if (!user) return;
      const colRef = collection(db, 'users', user.uid, 'orders');
      const docRef = await addDoc(colRef, order);
      const newOrder = { id: docRef.id, ...order };
      setActiveOrder(newOrder);
      return newOrder;
    },
    [user]
  );

  const updateStage = useCallback(
    async (orderId: string, stage: OrderStage) => {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid, 'orders', orderId), { stage });
    },
    [user]
  );

  const refresh = useCallback(() => {}, []);

  return { activeOrder, pastOrders, loading, placeOrder, updateStage, refresh };
}
