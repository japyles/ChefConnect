import { useCallback, useMemo } from 'react';
import { Recipe, useRecipeStore } from '@/store/recipes';

// Create a stable selector outside of the hook
const selectRecipes = (state: { recipes: Recipe[] }) => state.recipes;
const selectSearchQuery = (state: { searchQuery: string }) => state.searchQuery;
const selectActiveFilters = (state: { activeFilters: { mealType: string | null; diet: string[]; time: string[]; type: string[]; } }) => state.activeFilters;

export function useFilteredRecipes(): Recipe[] {
  // Use individual selectors to minimize re-renders
  const recipes = useRecipeStore(selectRecipes);
  const searchQuery = useRecipeStore(selectSearchQuery);
  const activeFilters = useRecipeStore(selectActiveFilters);

  // Memoize the filter function
  const filterRecipes = useCallback(() => {
    const query = searchQuery.toLowerCase();
    return recipes.filter((recipe: Recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(query);
      const matchesMealType = !activeFilters.mealType || recipe.mealType === activeFilters.mealType;
      const matchesDiet = activeFilters.diet.length === 0 || activeFilters.diet.some((filter: string) => recipe.diet.includes(filter));
      const matchesTime = activeFilters.time.length === 0 || activeFilters.time.some((filter: string) => recipe.time === filter);
      const matchesType = activeFilters.type.length === 0 || activeFilters.type.some((filter: string) => recipe.type.includes(filter));
      return matchesSearch && matchesMealType && matchesDiet && matchesTime && matchesType;
    });
  }, [recipes, searchQuery, activeFilters]);

  // Memoize the filtered results
  return useMemo(() => filterRecipes(), [filterRecipes]);
}
