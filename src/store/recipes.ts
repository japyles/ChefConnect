import { create } from 'zustand';

export type Recipe = {
  id: string;
  title: string;
  image: string;
  author: string;
  mealType: string;
  diet: string[];
  time: string;
  type: string[];
};

type FilterCategory = 'diet' | 'time' | 'type';

type RecipeState = {
  recipes: Recipe[];
  searchQuery: string;
  activeFilters: {
    mealType: string | null;
    diet: string[];
    time: string[];
    type: string[];
  };
  setSearchQuery: (query: string) => void;
  setMealTypeFilter: (mealType: string | null) => void;
  toggleFilter: (category: FilterCategory, filter: string) => void;
  resetFilters: () => void;
};

const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Soba Noodles",
    image: "/images/recipes/soba.jpg",
    author: "Sarah Chen",
    mealType: "Lunch",
    diet: ["Vegan"],
    time: "Quick",
    type: ["Healthy", "Pasta"],
  },
  {
    id: "2",
    title: "Salad Gourmande",
    image: "/images/recipes/salad.jpg",
    author: "Michel Dubois",
    mealType: "Lunch",
    diet: ["Healthy", "Salad"],
    time: "Quick",
    type: ["Healthy", "Salad"],
  },
  {
    id: "3",
    title: "Dijonaise à La Salade",
    image: "/images/recipes/dijonaise.jpg",
    author: "Pierre Martin",
    mealType: "Dinner",
    diet: ["Healthy", "Salad"],
    time: "Quick",
    type: ["Healthy", "Salad"],
  },
  {
    id: "4",
    title: "Capelli Arrabiata",
    image: "/images/recipes/pasta.jpg",
    author: "Marco Rossi",
    mealType: "Dinner",
    diet: ["Vegetable"],
    time: "Quick",
    type: ["Pasta"],
  },
  {
    id: "5",
    title: "Seafood USA",
    image: "/images/recipes/seafood.jpg",
    author: "John Smith",
    mealType: "Dinner",
    diet: ["Meat"],
    time: "Quick",
    type: ["Fish"],
  },
];

const initialFilters = {
  mealType: null,
  diet: [],
  time: [],
  type: [],
};

export const useRecipeStore = create<RecipeState>()((set) => ({
  recipes: mockRecipes,
  searchQuery: '',
  activeFilters: initialFilters,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMealTypeFilter: (mealType) => 
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        mealType: state.activeFilters.mealType === mealType ? null : mealType,
      },
    })),
  toggleFilter: (category: FilterCategory, filter: string) =>
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [category]: state.activeFilters[category].includes(filter)
          ? state.activeFilters[category].filter((f) => f !== filter)
          : [...state.activeFilters[category], filter],
      },
    })),
  resetFilters: () =>
    set({
      searchQuery: '',
      activeFilters: initialFilters,
    }),
}));
