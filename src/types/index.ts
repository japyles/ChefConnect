export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  notes?: string;
  tags: string[];
  photos: string[];
  videoUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  favorites: string[];
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  recipeId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
