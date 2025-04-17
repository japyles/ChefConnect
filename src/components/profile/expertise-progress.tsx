'use client'

import { ChefHat } from 'lucide-react'

interface ExpertiseProgressProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional' | null
  stats: {
    recipeCount: number
    totalLikes: number
    favoriteCount: number
  }
}

const EXPERTISE_REQUIREMENTS = {
  beginner: {
    recipes: 0,
    likes: 0,
    favorites: 0,
    color: 'bg-green-100 text-green-800',
    progressColor: 'bg-green-500',
  },
  intermediate: {
    recipes: 5,
    likes: 25,
    favorites: 10,
    color: 'bg-blue-100 text-blue-800',
    progressColor: 'bg-blue-500',
  },
  advanced: {
    recipes: 20,
    likes: 100,
    favorites: 50,
    color: 'bg-purple-100 text-purple-800',
    progressColor: 'bg-purple-500',
  },
  professional: {
    recipes: 50,
    likes: 500,
    favorites: 200,
    color: 'bg-red-100 text-red-800',
    progressColor: 'bg-red-500',
  },
}

const LEVELS = ['beginner', 'intermediate', 'advanced', 'professional'] as const

export function ExpertiseProgress({ level, stats }: ExpertiseProgressProps) {
  const currentLevel = level || 'beginner'
  const currentLevelIndex = LEVELS.indexOf(currentLevel)
  const nextLevel = LEVELS[currentLevelIndex + 1]

  const calculateProgress = (stat: number, requirement: number) => {
    return Math.min((stat / requirement) * 100, 100)
  }

  if (!nextLevel) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-900">Master Chef</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">
          Congratulations! You've reached the highest level of expertise.
        </p>
      </div>
    )
  }

  const requirements = EXPERTISE_REQUIREMENTS[nextLevel]
  const progress = {
    recipes: calculateProgress(stats.recipeCount, requirements.recipes),
    likes: calculateProgress(stats.totalLikes, requirements.likes),
    favorites: calculateProgress(stats.favoriteCount, requirements.favorites),
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium">Next Level: {nextLevel}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            EXPERTISE_REQUIREMENTS[currentLevel].color
          }`}
        >
          {currentLevel}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Recipes ({stats.recipeCount})</span>
            <span className="text-gray-900">{requirements.recipes}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full ${
                EXPERTISE_REQUIREMENTS[nextLevel].progressColor
              }`}
              style={{ width: `${progress.recipes}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Likes ({stats.totalLikes})</span>
            <span className="text-gray-900">{requirements.likes}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full ${
                EXPERTISE_REQUIREMENTS[nextLevel].progressColor
              }`}
              style={{ width: `${progress.likes}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Favorites ({stats.favoriteCount})
            </span>
            <span className="text-gray-900">{requirements.favorites}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full ${
                EXPERTISE_REQUIREMENTS[nextLevel].progressColor
              }`}
              style={{ width: `${progress.favorites}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Keep creating and sharing recipes to reach the next level!
      </p>
    </div>
  )
}
