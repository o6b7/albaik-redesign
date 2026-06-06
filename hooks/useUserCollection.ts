import { db } from '@/firebase';
import { useAuthStore } from '@/store/auth-store';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
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

  const fetch = useCallback(async () => {
    const colRef = getColRef();
    if (!colRef) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(colRef);
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as T[];
      setData(items);
    } catch (error) {
      console.error(`Error fetching ${subcollection}:`, error);
    } finally {
      setLoading(false);
    }
  }, [getColRef, subcollection]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = useCallback(
    async (item: Omit<T, 'id'>) => {
      const colRef = getColRef();
      if (!colRef) return;
      await addDoc(colRef, item);
      await fetch();
    },
    [getColRef, fetch]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Omit<T, 'id'>>) => {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid, subcollection, id), updates);
      await fetch();
    },
    [user, subcollection, fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, subcollection, id));
      await fetch();
    },
    [user, subcollection, fetch]
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

  return { data, loading, add, update, remove, refresh: fetch, clearDefault };
}
