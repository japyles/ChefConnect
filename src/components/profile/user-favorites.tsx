'use client'

import { RecipeCard } from '@/components/ui/recipe-card'
import { useAuth } from '@clerk/nextjs'
import { Heart, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function UserFavorites() {
  const { userId } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/favorites`)
        if (response.ok) {
          const data = await response.json()
          setFavorites(data)
        }
      } catch (error) {
        console.error('Error fetching user favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchFavorites()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Heart className="h-6 w-6" />
          <p className="text-lg font-medium">No favorite recipes yet</p>
        </div>
        <a
          href="/recipes"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Discover Recipes
        </a>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((favorite) => (
        <RecipeCard key={favorite.recipe.id} recipe={favorite.recipe} />
      ))}
    </div>
  )
}
