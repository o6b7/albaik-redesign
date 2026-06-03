export interface Meal {
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
  id: number;
  name: string;
  price: string;
  currency: string;
  image: string;
  rating: number;
  reviews: number;
  bgColor?: string;
}
