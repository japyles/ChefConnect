import { Plus, X } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

export function InstructionList() {
  const { register, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    name: 'instructions',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
        <button
          type="button"
          onClick={() => append('')}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              {index + 1}
            </div>
            <div className="flex-1">
              <textarea
                {...register(`instructions.${index}`)}
                placeholder={`Step ${index + 1}: Describe what to do...`}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
              />
            </div>
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

      {errors.instructions && (
        <p className="text-sm text-red-600">
          Please add at least one instruction step
        </p>
      )}
    </div>
  )
}
