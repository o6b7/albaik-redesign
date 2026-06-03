import { create } from 'zustand';

interface FlyingItem {
  image: string;
  startX: number;
  startY: number;
}

interface FlyingItemStore {
  item: FlyingItem | null;
  trigger: (item: FlyingItem) => void;
  clear: () => void;
}

export const useFlyingItemStore = create<FlyingItemStore>()((set) => ({
  item: null,
  trigger: (item) => set({ item }),
  clear: () => set({ item: null }),
}));
