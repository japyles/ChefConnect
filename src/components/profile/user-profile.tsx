'use client'

import { useUser } from '@clerk/nextjs'
import { CakeSlice, ChefHat, Heart } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface UserStats {
  recipeCount: number
  favoriteCount: number
  totalLikes: number
}

export function UserProfile() {
  const { user } = useUser()
  const [stats, setStats] = useState<UserStats>({
    recipeCount: 0,
    favoriteCount: 0,
    totalLikes: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${user?.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    if (user?.id) {
      fetchStats()
    }
  }, [user?.id])

  if (!user) return null

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
        {/* Profile Image */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full">
          <Image
            src={user.imageUrl}
            alt={user.fullName || 'Profile picture'}
            fill
            className="object-cover"
          />
        </div>

        {/* User Info */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-1 justify-end space-x-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <ChefHat className="h-5 w-5 text-orange-500" />
              <span className="text-xl font-semibold text-gray-900">
                {stats.recipeCount}
              </span>
            </div>
            <p className="text-sm text-gray-500">Recipes</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <CakeSlice className="h-5 w-5 text-purple-500" />
              <span className="text-xl font-semibold text-gray-900">
                {stats.favoriteCount}
              </span>
            </div>
            <p className="text-sm text-gray-500">Favorites</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-xl font-semibold text-gray-900">
                {stats.totalLikes}
              </span>
            </div>
            <p className="text-sm text-gray-500">Likes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
