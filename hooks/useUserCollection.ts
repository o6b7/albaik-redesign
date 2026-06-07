import { db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export function useUserCollection<T extends { id: string }>(
  subcollection: string
) {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const getColRef = useCallback(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, subcollection);
  }, [user, subcollection]);

  useEffect(() => {
    const colRef = getColRef();
    if (!colRef) {
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (error) => {
        console.error(`Error listening to ${subcollection}:`, error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [getColRef, subcollection]);

  const add = useCallback(
    async (item: Omit<T, 'id'>) => {
      const colRef = getColRef();
      if (!colRef) return;
      await addDoc(colRef, item);
    },
    [getColRef]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Omit<T, 'id'>>) => {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid, subcollection, id), updates);
    },
    [user, subcollection]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, subcollection, id));
    },
    [user, subcollection]
  );

  const clearDefault = useCallback(
    async (exceptId?: string) => {
      const defaults = data.filter((d) => (d as any).isDefault && d.id !== exceptId);
      for (const item of defaults) {
        await updateDoc(doc(db, 'users', user!.uid, subcollection, item.id), {
          isDefault: false,
        });
      }
    },
    [data, user, subcollection]
  );

  const refresh = useCallback(() => {}, []);

  return { data, loading, add, update, remove, refresh, clearDefault };
}
