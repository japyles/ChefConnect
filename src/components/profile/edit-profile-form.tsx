'use client'

import { useEffect, useState } from 'react'
import { Globe, Twitter, Instagram, Facebook } from 'lucide-react'

interface EditProfileFormProps {
  profile: {
    bio: string | null
    website_url: string | null
    twitter_url: string | null
    instagram_url: string | null
    facebook_url: string | null
    expertise_level: string | null
    dietary_preferences: string[]
    favorite_cuisines: string[]
  }
  onSave: (updates: any) => Promise<void>
  onCancel: () => void
}

const EXPERTISE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' },
]

const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Kosher',
  'Halal',
]

const CUISINES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'Mediterranean',
  'French',
  'American',
  'Korean',
  'Vietnamese',
  'Middle Eastern',
  'Greek',
  'Spanish',
  'Brazilian',
]

export function EditProfileForm({
  profile,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [form, setForm] = useState(profile)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(form)
  }

  const handlePreferenceToggle = (
    type: 'dietary_preferences' | 'favorite_cuisines',
    value: string
  ) => {
    const current = form[type]
    setForm((prev) => ({
      ...prev,
      [type]: current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          value={form.bio || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Social Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              Website
            </label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={form.website_url || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, website_url: e.target.value }))
              }
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Twitter className="h-4 w-4" />
              Twitter
            </label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={form.twitter_url || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, twitter_url: e.target.value }))
              }
              placeholder="https://twitter.com/username"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Instagram className="h-4 w-4" />
              Instagram
            </label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={form.instagram_url || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, instagram_url: e.target.value }))
              }
              placeholder="https://instagram.com/username"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Facebook className="h-4 w-4" />
              Facebook
            </label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={form.facebook_url || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, facebook_url: e.target.value }))
              }
              placeholder="https://facebook.com/username"
            />
          </div>
        </div>
      </div>

      {/* Expertise Level */}
      <div>
        <h3 className="text-lg font-medium">Cooking Expertise</h3>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EXPERTISE_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, expertise_level: level.value }))
              }
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                form.expertise_level === level.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div>
        <h3 className="text-lg font-medium">Dietary Preferences</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIETARY_PREFERENCES.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => handlePreferenceToggle('dietary_preferences', pref)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                form.dietary_preferences.includes(pref)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Favorite Cuisines */}
      <div>
        <h3 className="text-lg font-medium">Favorite Cuisines</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => handlePreferenceToggle('favorite_cuisines', cuisine)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                form.favorite_cuisines.includes(cuisine)
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
