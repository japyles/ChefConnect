import { TablesRow } from '@/lib/db/types'
import { Clock, Heart, Share2, Users } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface RecipeHeaderProps {
  recipe: TablesRow<'recipes'> & {
    user: TablesRow<'user_profiles'>
    _count?: { favorites: number }
  }
  isOwner: boolean
  onFavoriteToggle: () => Promise<void>
  isFavorited: boolean
}

export function RecipeHeader({
  recipe,
  isOwner,
  onFavoriteToggle,
  isFavorited,
}: RecipeHeaderProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      })
    } catch (err) {
      console.error('Error sharing:', err)
    }
    setIsSharing(false)
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex flex-col lg:flex-row">
        {/* Recipe Image */}
        <div className="relative aspect-video w-full lg:w-2/3">
          <Image
            src={recipe.photos?.[0]?.photo_url || '/placeholder-recipe.jpg'}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Recipe Info */}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src={recipe.user?.avatar_url || '/placeholder-avatar.jpg'}
                alt={recipe.user?.full_name || 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {recipe.user?.full_name || 'User'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(recipe.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onFavoriteToggle}
                className={`rounded-full p-2 ${
                  isFavorited
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="h-5 w-5" fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="rounded-full bg-gray-50 p-2 text-gray-600 hover:bg-gray-100"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900">{recipe.title}</h1>
          <p className="mb-6 text-gray-600">{recipe.description}</p>

          <div className="mt-auto flex items-center space-x-6">
            <div className="flex items-center text-gray-500">
              <Clock className="mr-2 h-5 w-5" />
              <span>{recipe.cooking_time} mins</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="mr-2 h-5 w-5" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
