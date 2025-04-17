'use client'

import { RecipeForm } from '@/components/ui/recipe-form/recipe-form'
import { useAuth } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchRecipe = useCallback(async () => {
    try {
      const response = await fetch(`/api/recipes/${params.id}`)
      if (!response.ok) {
        throw new Error('Recipe not found')
      }
      const data = await response.json()
      
      // Check if the user is the owner
      if (data.user_id !== userId) {
        router.push('/recipes')
        return
      }

      setRecipe(data)
    } catch (error) {
      console.error('Error fetching recipe:', error)
      router.push('/recipes')
    } finally {
      setLoading(false)
    }
  }, [params.id, router, userId])

  useEffect(() => {
    fetchRecipe()
  }, [fetchRecipe])

  const handleSubmit = async (data: any) => {
    try {
      // Update recipe
      const recipeResponse = await fetch(`/api/recipes/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          cooking_time: data.cookingTime,
          servings: data.servings,
        }),
      })

      if (!recipeResponse.ok) {
        throw new Error('Failed to update recipe')
      }

      const updatedRecipe = await recipeResponse.json()

      // Handle photos
      // First, get existing photos
      const existingPhotos = recipe.photos || []
      const newPhotos = data.images.filter(
        (img: any) => !existingPhotos.find((p: any) => p.photo_url === img.url)
      )
      const removedPhotos = existingPhotos.filter(
        (p: any) => !data.images.find((img: any) => img.url === p.photo_url)
      )

      // Remove deleted photos
      await Promise.all(
        removedPhotos.map((photo: any) =>
          fetch(`/api/recipes/${params.id}/photos/${photo.id}`, {
            method: 'DELETE',
          })
        )
      )

      // Add new photos
      await Promise.all(
        newPhotos.map((image: any) =>
          fetch(`/api/recipes/${params.id}/photos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              photo_url: image.url,
              is_primary: !image.stepNumber,
              step_number: image.stepNumber,
            }),
          })
        )
      )

      // Update tags
      await fetch(`/api/recipes/${params.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: data.tags }),
      })

      router.push(`/recipes/${updatedRecipe.id}`)
    } catch (error) {
      console.error('Error updating recipe:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="h-12 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-8 h-[600px] animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Edit Recipe</h1>

        <RecipeForm
          initialData={{
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookingTime: recipe.cooking_time,
            servings: recipe.servings,
            tags: recipe.tags?.map((t: any) => t.tags.name) || [],
            photos: recipe.photos,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
