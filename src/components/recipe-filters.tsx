import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/store/recipes";
import { X } from "lucide-react";

type FilterCategory = {
  name: string;
  type: 'diet' | 'time' | 'type';
  filters: string[];
};

type MealTypeCategory = {
  name: string;
  type: 'mealType';
  filters: string[];
};

const mealTypeCategory: MealTypeCategory = {
  name: "Meal Type",
  type: "mealType",
  filters: ["Breakfast", "Lunch", "Dinner", "Other"],
};

const filterCategories: FilterCategory[] = [
  {
    name: "Diet",
    type: "diet",
    filters: ["Healthy", "Vegan", "Meat", "Salad"],
  },
  {
    name: "Time",
    type: "time",
    filters: ["Quick", "Vegetable", "Pasta", "Indian"],
  },
  {
    name: "Type",
    type: "type",
    filters: ["Healthy", "Desert", "Fish", "Salad"],
  },
];

// Create stable selectors
const selectActiveFilters = (state) => state.activeFilters;
const selectSetMealTypeFilter = (state) => state.setMealTypeFilter;
const selectToggleFilter = (state) => state.toggleFilter;
const selectResetFilters = (state) => state.resetFilters;

export function RecipeFilters() {
  // Use individual selectors
  const activeFilters = useRecipeStore(selectActiveFilters);
  const setMealTypeFilter = useRecipeStore(selectSetMealTypeFilter);
  const toggleFilter = useRecipeStore(selectToggleFilter);
  const resetFilters = useRecipeStore(selectResetFilters);

  const hasActiveFilters =
    activeFilters.mealType !== null ||
    activeFilters.diet.length > 0 ||
    activeFilters.time.length > 0 ||
    activeFilters.type.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {mealTypeCategory.filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setMealTypeFilter(filter)}
              className={cn(
                "px-4 py-1 rounded-full text-sm font-medium transition-colors",
                activeFilters.mealType === filter
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            Reset filters
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {filterCategories.map((category) =>
          category.filters.map((filter) => {
            const isActive = activeFilters[category.type]?.includes(filter) ?? false;
            return (
              <button
                key={`${category.type}-${filter}`}
                onClick={() => toggleFilter(category.type, filter)}
                className={cn(
                  "px-4 py-1 rounded-full text-sm font-medium border transition-colors",
                  isActive
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                {filter}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
