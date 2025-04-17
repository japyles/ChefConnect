'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Heart, Star, Users } from 'lucide-react'

interface Recipe {
  id: string
  title: string
  image_url: string
  cooking_time: number
  difficulty: string
  servings: number
  likes_count: number
  cuisine_type: string
}

interface CookingStyle {
  topCuisines: { name: string; count: number }[]
  difficultyBreakdown: { [key: string]: number }
  avgCookingTime: number
  avgServings: number
}

export function RecipeHighlights({ userId }: { userId: string }) {
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([])
  const [cookingStyle, setCookingStyle] = useState<CookingStyle>({
    topCuisines: [],
    difficultyBreakdown: {},
    avgCookingTime: 0,
    avgServings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const [recipesResponse, styleResponse] = await Promise.all([
          fetch(`/api/users/${userId}/recipes/top`),
          fetch(`/api/users/${userId}/cooking-style`),
        ])

        if (recipesResponse.ok && styleResponse.ok) {
          const [recipes, style] = await Promise.all([
            recipesResponse.json(),
            styleResponse.json(),
          ])
          setTopRecipes(recipes)
          setCookingStyle(style)
        }
      } catch (error) {
        console.error('Error fetching recipe data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchRecipeData()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Recipes */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Top Recipes</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {recipe.cuisine_type} • {recipe.difficulty}
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.cooking_time}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {recipe.servings}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    {recipe.likes_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Cooking Style Analysis */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Top Cuisines */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h4 className="font-medium text-gray-900">Favorite Cuisines</h4>
          <div className="mt-3 space-y-2">
            {cookingStyle.topCuisines.map((cuisine) => (
              <div key={cuisine.name} className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-orange-500"
                    style={{
                      width: `${
                        (cuisine.count /
                          Math.max(
                            ...cookingStyle.topCuisines.map((c) => c.count)
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="w-24 text-sm text-gray-600">{cuisine.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {cuisine.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h4 className="font-medium text-gray-900">Recipe Difficulty</h4>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Object.entries(cookingStyle.difficultyBreakdown).map(
              ([level, count]) => (
                <div
                  key={level}
                  className="rounded-lg border p-3 text-center"
                >
                  <div className="text-2xl font-semibold text-gray-900">
                    {count}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Cooking Patterns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Cooking Time</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(cookingStyle.avgCookingTime)} minutes
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
          <div className="rounded-full bg-purple-100 p-2 text-purple-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Servings</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(cookingStyle.avgServings)} people
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
