interface RecipeIngredientsProps {
  ingredients: string[]
  servings: number
  onServingsChange: (servings: number) => void
}

export function RecipeIngredients({
  ingredients,
  servings,
  onServingsChange,
}: RecipeIngredientsProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onServingsChange(Math.max(1, servings - 1))}
            className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
          <span className="min-w-[3rem] text-center font-medium">
            {servings} {servings === 1 ? 'serving' : 'servings'}
          </span>
          <button
            onClick={() => onServingsChange(servings + 1)}
            className="rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
      <ul className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <li
            key={index}
            className="flex items-center space-x-3 text-gray-700"
          >
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-blue-600"
            />
            <span>{ingredient}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
