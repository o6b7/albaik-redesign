import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: string;
    currency: string;
    image: string;
    quantity: number;
    toppings: { id: number; name: string; price: string }[];
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + item.quantity, toppings: item.toppings }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, item] };
                }),

            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: quantity <= 0
                        ? state.items.filter((i) => i.id !== id)
                        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
                })),

            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);