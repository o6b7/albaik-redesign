import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'customer' | 'driver' | 'restaurant';

export interface AppUser {
    uid: string;
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
}

interface AuthStore {
    user: AppUser | null;
    setUser: (user: AppUser | null) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
