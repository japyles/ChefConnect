'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  Clock,
  Heart,
  Share2,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

interface RecipeStats {
  totalRecipes: number
  totalLikes: number
  totalShares: number
  avgRating: number
  topCategories: { name: string; count: number }[]
  monthlyStats: {
    month: string
    recipes: number
    likes: number
  }[]
}

export function RecipeStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<RecipeStats>({
    totalRecipes: 0,
    totalLikes: 0,
    totalShares: 0,
    avgRating: 0,
    topCategories: [],
    monthlyStats: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/recipe-stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching recipe stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchStats()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="rounded-full bg-blue-100 p-2 text-blue-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Recipes</p>
            <p className="text-2xl font-semibold">{stats.totalRecipes}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="rounded-full bg-red-100 p-2 text-red-600">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Likes</p>
            <p className="text-2xl font-semibold">{stats.totalLikes}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="rounded-full bg-green-100 p-2 text-green-600">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Shares</p>
            <p className="text-2xl font-semibold">{stats.totalShares}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Rating</p>
            <p className="text-2xl font-semibold">
              {stats.avgRating.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Growth */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Monthly Growth</h3>
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {stats.monthlyStats.map((month) => (
              <div key={month.month} className="flex w-full flex-col gap-1">
                <div
                  className="w-full rounded-t bg-blue-500"
                  style={{
                    height: `${
                      (month.recipes /
                        Math.max(
                          ...stats.monthlyStats.map((m) => m.recipes)
                        )) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="w-full rounded-t bg-red-400"
                  style={{
                    height: `${
                      (month.likes /
                        Math.max(
                          ...stats.monthlyStats.map((m) => m.likes)
                        )) *
                      100
                    }%`,
                  }}
                />
                <span className="mt-2 text-center text-xs text-gray-600">
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Recipes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <span className="text-sm text-gray-600">Likes</span>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Top Categories</h3>
        <div className="space-y-4">
          {stats.topCategories.map((category) => (
            <div key={category.name} className="flex items-center gap-4">
              <div className="w-32 text-sm text-gray-600">
                {category.name}
              </div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        (category.count /
                          Math.max(
                            ...stats.topCategories.map((c) => c.count)
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm font-medium">
                {category.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
