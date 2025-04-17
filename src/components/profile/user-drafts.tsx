'use client'

import { RecipeCard } from '@/components/ui/recipe-card'
import { useAuth } from '@clerk/nextjs'
import { FileEdit, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function UserDrafts() {
  const { userId } = useAuth()
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/recipes?status=draft`)
        if (response.ok) {
          const data = await response.json()
          setDrafts(data)
        }
      } catch (error) {
        console.error('Error fetching drafts:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchDrafts()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <FileEdit className="h-6 w-6" />
          <p className="text-lg font-medium">No recipe drafts</p>
        </div>
        <a
          href="/recipes/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Start a New Recipe
        </a>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {drafts.map((draft) => (
        <RecipeCard
          key={draft.id}
          recipe={draft}
          showEditButton
          showDeleteButton
          isDraft
        />
      ))}
    </div>
  )
}
