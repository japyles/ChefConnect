import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Loader2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ImageUpload } from './image-upload'
import { IngredientList } from './ingredient-list'
import { InstructionList } from './instruction-list'
import { TagInput } from './tag-input'

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  cookingTime: z.number().min(1, 'Cooking time is required'),
  servings: z.number().min(1, 'Number of servings is required'),
  tags: z.array(z.string()),
})

export type RecipeFormData = z.infer<typeof recipeSchema>

interface RecipeFormProps {
  initialData?: RecipeFormData & {
    id?: string
    photos?: Array<{
      photo_url: string
      is_primary: boolean
      step_number?: number | null
    }>
  }
  onSubmit: (data: RecipeFormData & { images: Array<{ url: string; stepNumber?: number }>, collection_ids: string[] }) => Promise<void>
  submitLabel?: string
}

export function RecipeForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Recipe',
}: RecipeFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<Array<{ url: string; stepNumber?: number }>>(
    initialData?.photos?.map(photo => ({
      url: photo.photo_url,
      stepNumber: photo.step_number || undefined,
    })) || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  useEffect(() => {
    // Fetch collections for the user
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setCollections(data || [])
      })
      .catch(err => {
        console.error('Failed to fetch collections:', err)
      })
  }, [])

  const methods = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      ingredients: initialData?.ingredients || [''],
      instructions: initialData?.instructions || [''],
      tags: initialData?.tags || [],
      cookingTime: initialData?.cookingTime || 30,
      servings: initialData?.servings || 4,
    },
  })

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ ...data, images, collection_ids: selectedCollections })
    } catch (error) {
      console.error('Error submitting recipe:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Recipe Title
              </label>
              <input
                {...methods.register('title')}
                id="title"
                placeholder="e.g., Classic Chocolate Chip Cookies"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {methods.formState.errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {methods.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                {...methods.register('description')}
                id="description"
                rows={3}
                placeholder="Describe your recipe..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Collections Multi-Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Assign to Collections
            </label>
            <select
              multiple
              value={selectedCollections}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(opt => opt.value)
                setSelectedCollections(options)
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl (Windows) or Command (Mac) to select multiple collections.
            </p>
          </div>

          {/* Time and Servings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Clock className="mr-1 inline-block h-4 w-4" />
                Cooking Time (minutes)
              </label>
              <input
                type="number"
                {...methods.register('cookingTime', { valueAsNumber: true })}
                min={1}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Users className="mr-1 inline-block h-4 w-4" />
                Servings
              </label>
              <input
                type="number"
                {...methods.register('servings', { valueAsNumber: true })}
                min={1}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Recipe Photos
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Ingredients */}
          <IngredientList />

          {/* Instructions */}
          <InstructionList />

          {/* Tags */}
          <TagInput />

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
