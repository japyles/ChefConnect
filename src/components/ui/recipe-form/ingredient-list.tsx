import { Plus, X } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

export function IngredientList() {
  const { register, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    name: 'ingredients',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
        <button
          type="button"
          onClick={() => append('')}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
        >
          <Plus className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`ingredients.${index}`)}
              placeholder="e.g., 2 cups flour"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {errors.ingredients && (
        <p className="text-sm text-red-600">
          Please add at least one ingredient
        </p>
      )}
    </div>
  )
}
