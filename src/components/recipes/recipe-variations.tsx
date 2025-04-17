'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@clerk/nextjs'
import {
  Copy,
  GitBranch,
  GitMerge,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  photos: Array<{ photo_url: string; is_primary: boolean }>
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface Variation {
  id: string
  original_recipe_id: string
  variation_recipe_id: string
  created_at: string
  variation_recipe: Recipe
}

interface RecipeVariationsProps {
  recipeId: string
  variations: Variation[]
  isOwner: boolean
}

export function RecipeVariations({
  recipeId,
  variations,
  isOwner,
}: RecipeVariationsProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [variationName, setVariationName] = useState('')
  const [variationDescription, setVariationDescription] = useState('')

  const handleCreateVariation = async () => {
    if (!variationName.trim()) return

    setCreating(true)
    try {
      // First, create a new recipe as a variation
      const createResponse = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: variationName,
          description: variationDescription,
          is_variation: true,
          original_recipe_id: recipeId,
        }),
      })

      if (createResponse.ok) {
        const newRecipe = await createResponse.json()

        // Then, create the variation relationship
        const variationResponse = await fetch(
          `/api/recipes/${recipeId}/variations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              variation_recipe_id: newRecipe.id,
            }),
          }
        )

        if (variationResponse.ok) {
          router.push(`/recipes/${newRecipe.id}/edit`)
        }
      }
    } catch (error) {
      console.error('Error creating variation:', error)
    } finally {
      setCreating(false)
      setShowCreateModal(false)
    }
  }

  if (variations.length === 0 && !isOwner) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Recipe Variations
        </h2>
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Create Variation</span>
          </button>
        )}
      </div>

      {variations.length === 0 ? (
        <p className="text-gray-500">No variations yet</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {variations.map((variation) => (
            <Link
              key={variation.id}
              href={`/recipes/${variation.variation_recipe_id}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Variation Preview */}
              <div className="relative h-48">
                {variation.variation_recipe.photos?.find((p) => p.is_primary)
                  ?.photo_url ? (
                  <img
                    src={
                      variation.variation_recipe.photos.find((p) => p.is_primary)
                        ?.photo_url
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <GitBranch className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Variation Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {variation.variation_recipe.title}
                  </h3>
                </div>
                {variation.variation_recipe.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {variation.variation_recipe.description}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                  <GitMerge className="h-4 w-4" />
                  <span>
                    by {variation.variation_recipe.user.full_name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Variation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Create Recipe Variation
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Variation Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={variationName}
                  onChange={(e) => setVariationName(e.target.value)}
                  placeholder="e.g., Spicy Version, Vegan Alternative"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  What's Different?
                </label>
                <textarea
                  id="description"
                  value={variationDescription}
                  onChange={(e) => setVariationDescription(e.target.value)}
                  placeholder="Describe what makes this variation unique..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVariation}
                disabled={creating || !variationName.trim()}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Create & Edit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
