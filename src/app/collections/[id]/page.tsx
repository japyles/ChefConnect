'use client'

import { RecipeCard } from '@/components/ui/recipe-card'
import { CollectionHeader } from '@/components/collections/collection-header'
import { AddToCollection } from '@/components/collections/add-to-collection'
import { useAuth } from '@clerk/nextjs'
import { Loader2, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  cooking_time: number
  servings: number
  photos: Array<{ photo_url: string; is_primary: boolean }>
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface Collection {
  id: string
  name: string
  description: string
  is_public: boolean
  user_id: string
  recipes: Recipe[]
}

export default function CollectionPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddRecipe, setShowAddRecipe] = useState(false)

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collections/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCollection(data)
        } else {
          router.push('/profile')
        }
      } catch (error) {
        console.error('Error fetching collection:', error)
        router.push('/profile')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCollection()
    }
  }, [params.id, router])

  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(
        `/api/collections/${collection?.id}/recipes/${recipeId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setCollection((prev) =>
          prev
            ? {
                ...prev,
                recipes: prev.recipes.filter((r) => r.id !== recipeId),
              }
            : null
        )
      }
    } catch (error) {
      console.error('Error removing recipe:', error)
    }
  }

  const handleAddRecipes = async (recipeIds: string[]) => {
    try {
      const response = await fetch(`/api/collections/${collection?.id}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeIds }),
      })

      if (response.ok) {
        // Refresh collection data
        const updatedCollection = await fetch(
          `/api/collections/${params.id}`
        ).then((r) => r.json())
        setCollection(updatedCollection)
        setShowAddRecipe(false)
      }
    } catch (error) {
      console.error('Error adding recipes:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!collection) return null

  const isOwner = userId === collection.user_id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CollectionHeader
          collection={collection}
          isOwner={isOwner}
          onUpdate={(updated) => setCollection({ ...collection, ...updated })}
        />

        <div className="mt-8">
          {/* Add Recipe Button (only for collection owner) */}
          {isOwner && (
            <div className="mb-6">
              <button
                onClick={() => setShowAddRecipe(true)}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                <span>Add Recipes</span>
              </button>
            </div>
          )}

          {/* Recipe Grid */}
          {collection.recipes.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
              <p className="text-lg font-medium text-gray-600">
                No recipes in this collection yet
              </p>
              {isOwner && (
                <button
                  onClick={() => setShowAddRecipe(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add Your First Recipe
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collection.recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  showRemoveButton={isOwner}
                  onRemove={() => handleRemoveRecipe(recipe.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Recipe Modal */}
        {showAddRecipe && (
          <AddToCollection
            collectionId={collection.id}
            onClose={() => setShowAddRecipe(false)}
            onAdd={handleAddRecipes}
            existingRecipeIds={collection.recipes.map((r) => r.id)}
          />
        )}
      </div>
    </div>
  )
}
