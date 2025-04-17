'use client'

import { useEffect, useState } from 'react'
import {
  Award,
  ChefHat,
  Clock,
  Heart,
  MessageCircle,
  Star,
  GitBranch,
  FolderPlus,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  activity_type: string
  target_id: string
  metadata: {
    title?: string
    name?: string
  }
  created_at: string
}

const ACTIVITY_ICONS = {
  recipe_created: ChefHat,
  recipe_updated: Clock,
  recipe_liked: Heart,
  recipe_favorited: Star,
  collection_created: FolderPlus,
  achievement_earned: Award,
  comment_added: MessageCircle,
  variation_created: GitBranch,
}

const ACTIVITY_COLORS = {
  recipe_created: 'text-orange-500',
  recipe_updated: 'text-blue-500',
  recipe_liked: 'text-red-500',
  recipe_favorited: 'text-yellow-500',
  collection_created: 'text-purple-500',
  achievement_earned: 'text-green-500',
  comment_added: 'text-indigo-500',
  variation_created: 'text-teal-500',
}

const ACTIVITY_MESSAGES = {
  recipe_created: 'created a new recipe',
  recipe_updated: 'updated their recipe',
  recipe_liked: 'liked the recipe',
  recipe_favorited: 'favorited the recipe',
  collection_created: 'created a new collection',
  achievement_earned: 'earned the achievement',
  comment_added: 'commented on',
  variation_created: 'created a variation of',
}

export function ActivityFeed({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/activities`)
        if (response.ok) {
          const data = await response.json()
          setActivities(data)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchActivities()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center space-x-4 rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No activity yet</h3>
        <p className="mt-2 text-gray-500">
          Activities will appear here as you interact with recipes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type as keyof typeof ACTIVITY_ICONS]
        const color = ACTIVITY_COLORS[activity.activity_type as keyof typeof ACTIVITY_COLORS]
        const message = ACTIVITY_MESSAGES[activity.activity_type as keyof typeof ACTIVITY_MESSAGES]

        return (
          <div
            key={activity.id}
            className="flex items-start space-x-4 rounded-lg bg-white p-4 shadow-sm"
          >
            <div className={`rounded-lg bg-gray-50 p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-900">
                {message}{' '}
                {activity.metadata.title && (
                  <Link
                    href={`/recipes/${activity.target_id}`}
                    className="font-medium text-orange-600 hover:text-orange-700"
                  >
                    {activity.metadata.title}
                  </Link>
                )}
                {activity.metadata.name && (
                  <span className="font-medium text-orange-600">
                    {activity.metadata.name}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
