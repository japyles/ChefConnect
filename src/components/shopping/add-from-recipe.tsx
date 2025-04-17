'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@clerk/nextjs'
import { Check, Loader2, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: Array<{
    ingredient: string
    quantity: string | null
  }>
  photos: Array<{
    photo_url: string
    is_primary: boolean
  }>
}

interface AddFromRecipeProps {
  onClose: () => void
  onAdd: (items: Array<{ ingredient: string; quantity: string | null }>) => void
}

export function AddFromRecipe({ onClose, onAdd }: AddFromRecipeProps) {
  const { userId } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/recipes`)
        if (response.ok) {
          const data = await response.json()
          setRecipes(data)
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
  }, [userId])

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectRecipe = async (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    // Pre-select all ingredients
    setSelectedIngredients(
      new Set(recipe.ingredients.map((i) => i.ingredient))
    )
  }

  const toggleIngredient = (ingredient: string) => {
    const newSelected = new Set(selectedIngredients)
    if (newSelected.has(ingredient)) {
      newSelected.delete(ingredient)
    } else {
      newSelected.add(ingredient)
    }
    setSelectedIngredients(newSelected)
  }

  const handleAdd = () => {
    if (!selectedRecipe) return

    const items = selectedRecipe.ingredients.filter((i) =>
      selectedIngredients.has(i.ingredient)
    )
    onAdd(items)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Add from Recipe
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {!selectedRecipe ? (
            <>
              {/* Recipe Search */}
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
                        onClick={() => handleSelectRecipe(recipe)}
                        className="flex cursor-pointer items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:border-blue-500 hover:bg-blue-50"
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
                          <p className="text-sm text-gray-500">
                            {recipe.ingredients.length} ingredients
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected Recipe Ingredients */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {selectedRecipe.title}
                </h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Choose Different Recipe
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((item) => (
                    <div
                      key={item.ingredient}
                      onClick={() => toggleIngredient(item.ingredient)}
                      className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 ${
                        selectedIngredients.has(item.ingredient)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          selectedIngredients.has(item.ingredient)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedIngredients.has(item.ingredient) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span className="flex-1">
                        {item.quantity && (
                          <span className="mr-2 text-gray-500">
                            {item.quantity}
                          </span>
                        )}
                        {item.ingredient}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {selectedRecipe && (
              <button
                onClick={handleAdd}
                disabled={selectedIngredients.size === 0}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add {selectedIngredients.size} Items
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
