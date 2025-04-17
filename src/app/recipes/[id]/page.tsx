'use client'

import { RecipeComments } from '@/components/ui/recipe-comments'
import { RecipeHeader } from '@/components/ui/recipe-header'
import { RecipeIngredients } from '@/components/ui/recipe-ingredients'
import { RecipeInstructions } from '@/components/ui/recipe-instructions'
import { RecipeNotes } from '@/components/recipes/recipe-notes'
import { RecipeVariations } from '@/components/recipes/recipe-variations'
import { RecipeWithDetails } from '@/lib/db/types'
import { useAuth } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Variation {
  id: string
  original_recipe_id: string
  variation_recipe_id: string
  created_at: string
  variation_recipe: RecipeWithDetails
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userId, isSignedIn } = useAuth()
  
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [servings, setServings] = useState(0)
  const [variations, setVariations] = useState<Variation[]>([])

  const fetchRecipe = useCallback(async () => {
    try {
      const response = await fetch(`/api/recipes/${params.id}`)
      if (!response.ok) {
        throw new Error('Recipe not found')
      }
      const data = await response.json()
      setRecipe(data)
      setServings(data.servings)
    } catch (error) {
      console.error('Error fetching recipe:', error)
      router.push('/recipes')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  const fetchVariations = useCallback(async () => {
    try {
      const response = await fetch(`/api/recipes/${params.id}/variations`)
      if (response.ok) {
        const data = await response.json()
        setVariations(data)
      }
    } catch (error) {
      console.error('Error fetching variations:', error)
    }
  }, [params.id])

  const checkIfFavorited = useCallback(async () => {
    if (!userId) return
    try {
      const response = await fetch(`/api/recipes/${params.id}/favorite`)
      const data = await response.json()
      setIsFavorited(data.favorited)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }, [params.id, userId])

  useEffect(() => {
    fetchRecipe()
    fetchVariations()
    checkIfFavorited()
  }, [fetchRecipe, fetchVariations, checkIfFavorited])

  const handleFavoriteToggle = async () => {
    if (!userId) {
      // Redirect to sign in
      return
    }

    try {
      const response = await fetch(`/api/recipes/${params.id}/favorite`, {
        method: 'POST',
      })
      const data = await response.json()
      setIsFavorited(data.favorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleAddComment = async (content: string, rating: number) => {
    try {
      const response = await fetch(`/api/recipes/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, rating }),
      })
      
      if (!response.ok) throw new Error('Failed to add comment')
      
      const newComment = await response.json()
      setRecipe(prev => {
        if (!prev) return prev
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        }
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen animate-pulse bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 rounded-xl bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RecipeHeader
          recipe={recipe}
          isOwner={userId === recipe.user_id}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorited={isFavorited}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RecipeIngredients
              ingredients={recipe.ingredients as string[]}
              servings={servings}
              onServingsChange={setServings}
            />
          </div>

          <div className="space-y-8 lg:col-span-2">
            <RecipeInstructions
              instructions={recipe.instructions as string[]}
              photos={recipe.photos}
            />
            <div className="mt-8">
              <RecipeComments
                recipeId={recipe.id}
                comments={recipe.comments}
                onAddComment={handleAddComment}
                isAuthenticated={!!isSignedIn}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecipeNotes recipeId={recipe.id} isOwner={userId === recipe.user_id} />
          </div>

          <div className="space-y-8">
            <RecipeVariations
              recipeId={recipe.id}
              variations={variations}
              isOwner={userId === recipe.user_id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
