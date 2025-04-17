import { Clock, Tag, UtensilsCrossed } from 'lucide-react'

interface RecipeFiltersProps {
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  cookingTimeRange: [number, number]
  onCookingTimeChange: (range: [number, number]) => void
}

const COMMON_TAGS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Quick',
  'Dessert',
  'Healthy',
]

const TIME_RANGES = [
  { label: 'Quick (< 30 mins)', range: [0, 30] },
  { label: 'Medium (30-60 mins)', range: [30, 60] },
  { label: 'Long (> 60 mins)', range: [60, 999] },
]

export function RecipeFilters({
  selectedTags,
  onTagSelect,
  cookingTimeRange,
  onCookingTimeChange,
}: RecipeFiltersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Tag className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-2">
          {COMMON_TAGS.map(tag => (
            <label key={tag} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => onTagSelect(tag)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Clock className="h-4 w-4" />
          Cooking Time
        </h3>
        <div className="space-y-2">
          {TIME_RANGES.map(({ label, range }) => (
            <label key={label} className="flex items-center">
              <input
                type="radio"
                checked={
                  cookingTimeRange[0] === range[0] && cookingTimeRange[1] === range[1]
                }
                onChange={() => onCookingTimeChange(range)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <UtensilsCrossed className="h-4 w-4" />
          Dietary Preferences
        </h3>
        <div className="space-y-2">
          {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'].map(pref => (
            <label key={pref} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(pref)}
                onChange={() => onTagSelect(pref)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">{pref}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
