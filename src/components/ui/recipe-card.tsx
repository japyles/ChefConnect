import { TablesRow } from '@/lib/db/types'
import { Clock, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getRecipeImageUrl } from '@/lib/supabase-image'

interface RecipeCardProps {
  recipe: TablesRow<'recipes'> & {
    recipe_photos: Array<{ photo_url: string; is_primary: boolean }>
    author: TablesRow<'profiles'> & { image_url?: string; name: string }
    tags: Array<{ tags: { name: string } }>
    title: string
    description?: string
    cooking_time?: number
    servings?: number
    id: string | number
  }
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // Use recipe_photos from API response (not photos)
  const primaryPhotoPath = recipe.recipe_photos?.find((p: { photo_url: string; is_primary: boolean }) => p.is_primary)?.photo_url
  if (typeof window !== 'undefined') {
    console.log('RecipeCard primaryPhotoPath:', primaryPhotoPath, 'recipe:', recipe);
  }
  const primaryPhoto = primaryPhotoPath ? getRecipeImageUrl(primaryPhotoPath) : '/placeholder-recipe.jpg'

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={primaryPhoto}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
          {recipe.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-500">
          {recipe.description || 'No description provided'}
        </p>
        <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{recipe.cooking_time} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.tags?.slice(0, 3).map(({ tags }: { tags: { name: string } }) => (
            <span
              key={tags.name}
              className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              {tags.name}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full">
            <Image
              src={recipe.author?.image_url || '/placeholder-avatar.png'}
              alt={recipe.author?.name || 'Unknown author'}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm text-gray-500">{recipe.author?.name || 'Unknown author'}</span>
        </div>
      </div>
    </Link>
  )
}
