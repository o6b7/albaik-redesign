import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

const cache: Record<string, { data: any[]; promise?: Promise<any[]> }> = {};

export function useCollection<T>(collectionName: string) {
    const [data, setData] = useState<T[]>((cache[collectionName]?.data as T[]) ?? []);
    const [loading, setLoading] = useState(!cache[collectionName]?.data);

    useEffect(() => {
        if (cache[collectionName]?.data) {
            setData(cache[collectionName].data as T[]);
            setLoading(false);
            return;
        }

        if (!cache[collectionName]?.promise) {
            cache[collectionName] = {
                ...cache[collectionName],
                promise: getDocs(collection(db, collectionName)).then((snapshot) => {
                    const items = snapshot.docs.map((doc) => ({
                        firestoreId: doc.id,
                        ...doc.data(),
                    }));
                    cache[collectionName] = { data: items };
                    return items;
                }),
            };
        }

        cache[collectionName].promise!
            .then((items) => {
                setData(items as T[]);
                setLoading(false);
            })
            .catch((error) => {
                console.log("Error fetching data", error);
                setLoading(false);
                setData([]);
            });
    }, [collectionName]);

    return { data, loading };
}
