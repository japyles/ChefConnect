'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  Award,
  ChefHat,
  Edit2,
  Facebook,
  Globe,
  Instagram,
  Twitter,
} from 'lucide-react'
import Image from 'next/image'
import { EditProfileForm } from './edit-profile-form'
import { ActivityFeed } from './activity-feed'
import { ExpertiseProgress } from './expertise-progress'
import { RecipeHighlights } from './recipe-highlights'
import { RecipeCollections } from './recipe-collections'
import { RecipeSearch } from './recipe-search'
import { RecipeStats } from './recipe-stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserStats {
  recipeCount: number
  favoriteCount: number
  totalLikes: number
}

interface UserProfile {
  bio: string | null
  website_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'professional' | null
  dietary_preferences: string[]
  favorite_cuisines: string[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

const EXPERTISE_LEVELS = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  professional: { label: 'Professional', color: 'bg-red-100 text-red-800' },
}

export function EnhancedProfile() {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    bio: null,
    website_url: null,
    twitter_url: null,
    instagram_url: null,
    facebook_url: null,
    expertise_level: null,
    dietary_preferences: [],
    favorite_cuisines: [],
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<UserStats>({
    recipeCount: 0,
    favoriteCount: 0,
    totalLikes: 0,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/users/achievements')
        if (response.ok) {
          const data = await response.json()
          setAchievements(data)
        }
      } catch (error) {
        console.error('Error fetching achievements:', error)
      }
    }

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
      fetchProfile()
      fetchAchievements()
      fetchStats()
    }
  }, [user?.id])

  const handleSave = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setProfile((prev) => ({ ...prev, ...updates }))
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full">
              <Image
                src={user.imageUrl}
                alt={user.fullName || 'Profile picture'}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.fullName}
              </h1>
              <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
              {profile.expertise_level && (
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    EXPERTISE_LEVELS[profile.expertise_level].color
                  }`}
                >
                  <ChefHat className="mr-1 inline-block h-4 w-4" />
                  {EXPERTISE_LEVELS[profile.expertise_level].label} Chef
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        </div>

        {isEditing ? (
          <div className="mt-6">
            <EditProfileForm
              profile={profile}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* Bio */}
            <div className="mt-6">
              <p className="text-gray-600">
                {profile.bio || 'No bio yet. Click edit to add one!'}
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap gap-4">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Globe className="h-5 w-5" />
                  <span>Website</span>
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Twitter className="h-5 w-5" />
                  <span>Twitter</span>
                </a>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
              )}
              {profile.facebook_url && (
                <a
                  href={profile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Facebook className="h-5 w-5" />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stats and Progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recipes</h2>
                <ChefHat className="h-5 w-5 text-orange-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.recipeCount}
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Favorites</h2>
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.favoriteCount}
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Total Likes</h2>
                <Award className="h-5 w-5 text-red-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalLikes}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
          <ExpertiseProgress level={profile.expertise_level} stats={stats} />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="highlights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[1000px]">
          <TabsTrigger value="highlights">Highlights</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="highlights">
          <div className="space-y-6">
            <RecipeSearch
              onSearch={(query) => console.log('Search:', query)}
              onFilterChange={(filters) => console.log('Filters:', filters)}
            />
            <RecipeHighlights userId={user.id} />
          </div>
        </TabsContent>

        <TabsContent value="collections">
          <RecipeCollections userId={user.id} />
        </TabsContent>

        <TabsContent value="stats">
          <RecipeStats userId={user.id} />
        </TabsContent>

        <TabsContent value="achievements">
          {achievements.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Achievements</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex flex-col items-center rounded-lg border p-4 text-center"
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <h3 className="mt-2 font-medium">{achievement.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
            <ActivityFeed userId={user.id} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Preferences */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Dietary Preferences */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Dietary Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {(profile.dietary_preferences ?? []).map((pref) => (
              <span
                key={pref}
                className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
              >
                {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Favorite Cuisines */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Favorite Cuisines</h2>
          <div className="flex flex-wrap gap-2">
            {(profile.favorite_cuisines ?? []).map((cuisine) => (
              <span
                key={cuisine}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
