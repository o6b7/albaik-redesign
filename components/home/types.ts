export interface Meal {
  firestoreId: string;
  id: number;
  name: string;
  description?: string;
  price: string;
  currency: string;
  image: string;
  rating: number;
  reviews: number;
  bgColor?: string;
  category: string;
}

export interface SideMeal {
  firestoreId: string;
  id: number;
  name: string;
  price: string;
  currency: string;
  image: string;
  rating: number;
  reviews: number;
  bgColor?: string;
}
