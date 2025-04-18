'use client'

import { Clock, Heart, Star, User2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

interface Recipe {
  id: string
  title: string
  description: string
  cooking_time: number
  photos: Array<{
    photo_url: string
    is_primary: boolean
  }>
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
  favorites: Array<{ count: number }>
  average_rating: number
}

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { userId } = useAuth();
  const primaryPhoto = recipe.photos?.find((p) => p.is_primary)?.photo_url
  const isOwner = userId && recipe.user?.id === userId

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    const res = await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE' });
    if (res.ok) {
      window.location.reload();
    } else {
      alert('Failed to delete recipe.');
    }
  };

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Recipe Image */}
      <div className="relative aspect-[4/3]">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-4xl">🍳</span>
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
            {recipe.title}
          </h3>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="ml-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
              title="Delete Recipe"
            >
              Delete
            </button>
          )}
        </div>
        {recipe.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Author */}
            <div className="flex items-center space-x-1">
              {recipe.user?.avatar_url ? (
                <img
                  src={recipe.user.avatar_url}
                  alt=""
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <User2 className="h-4 w-4" />
              )}
              <span>{recipe.user?.full_name || 'Unknown'}</span>
            </div>

            {/* Cooking Time */}
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cooking_time} min</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Favorites */}
            {recipe.favorites?.[0]?.count > 0 && (
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4 fill-current" />
                <span>{recipe.favorites[0].count}</span>
              </div>
            )}

            {/* Rating */}
            {recipe.average_rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span>{recipe.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
