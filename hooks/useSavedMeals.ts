import { useUserCollection } from './useUserCollection';

interface SavedMeal {
  id: string;
  mealId: string;
  type: 'featured' | 'more';
}

export function useSavedMeals() {
  const { data, add, remove } = useUserCollection<SavedMeal>('savedMeals');

  const isSaved = (mealId: string) => data.some((s) => s.mealId === mealId);

  const toggle = async (mealId: string, type: 'featured' | 'more') => {
    const existing = data.find((s) => s.mealId === mealId);
    if (existing) {
      await remove(existing.id);
    } else {
      await add({ mealId, type } as Omit<SavedMeal, 'id'>);
    }
  };

  return { savedMeals: data, isSaved, toggle };
}
