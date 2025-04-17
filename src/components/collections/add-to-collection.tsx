'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@clerk/nextjs'
import { Check, Loader2, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  photos: Array<{ photo_url: string; is_primary: boolean }>
}

interface AddToCollectionProps {
  collectionId: string
  onClose: () => void
  onAdd: (recipeIds: string[]) => void
  existingRecipeIds: string[]
}

export function AddToCollection({
  collectionId,
  onClose,
  onAdd,
  existingRecipeIds,
}: AddToCollectionProps) {
  const { userId } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/recipes`)
        if (response.ok) {
          const data = await response.json()
          // Filter out recipes that are already in the collection
          setRecipes(
            data.filter((recipe: Recipe) => !existingRecipeIds.includes(recipe.id))
          )
        }
      } catch (error) {
        console.error('Error fetching recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRecipes()
    }
  }, [userId, existingRecipeIds])

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  )

  const toggleRecipe = (recipeId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId)
    } else {
      newSelected.add(recipeId)
    }
    setSelectedIds(newSelected)
  }

  const handleAdd = () => {
    onAdd(Array.from(selectedIds))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Add Recipes</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Recipe List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-gray-500">
                No recipes found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => toggleRecipe(recipe.id)}
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 ${
                      selectedIds.has(recipe.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      {recipe.photos?.find((p) => p.is_primary)?.photo_url ? (
                        <img
                          src={
                            recipe.photos.find((p) => p.is_primary)?.photo_url
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <span className="text-2xl">🍳</span>
                        </div>
                      )}
                    </div>

                    {/* Recipe Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {recipe.title}
                      </h3>
                      {recipe.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {recipe.description}
                        </p>
                      )}
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        selectedIds.has(recipe.id)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedIds.has(recipe.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Add {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
