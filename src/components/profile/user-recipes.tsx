'use client'

import { RecipeCard } from '@/components/ui/recipe-card'
import { useAuth } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function UserRecipes() {
  const { userId } = useAuth()
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/recipes`)
        if (response.ok) {
          const data = await response.json()
          setRecipes(data)
        }
      } catch (error) {
        console.error('Error fetching user recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRecipes()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-lg font-medium text-gray-600">
          You haven&apos;t created any recipes yet
        </p>
        <a
          href="/recipes/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Your First Recipe
        </a>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          showEditButton
          showDeleteButton
        />
      ))}
    </div>
  )
}
