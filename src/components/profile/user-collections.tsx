'use client'

import { useAuth } from '@clerk/nextjs'
import { FolderPlus, Loader2, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Collection {
  id: string
  name: string
  description: string
  is_public: boolean
  recipe_count: number
  preview_images: string[]
}

export function UserCollections() {
  const { userId } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/collections`)
        if (response.ok) {
          const data = await response.json()
          setCollections(data)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchCollections()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with add collection button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your Collections</h2>
        <button
          onClick={() => setShowNewCollectionModal(true)}
          className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>New Collection</span>
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <FolderPlus className="h-6 w-6" />
            <p className="text-lg font-medium">No collections yet</p>
          </div>
          <button
            onClick={() => setShowNewCollectionModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Collection Preview */}
              <div className="relative h-48">
                {collection.preview_images.length > 0 ? (
                  <div className="grid h-full grid-cols-2 grid-rows-2">
                    {collection.preview_images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <FolderPlus className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Collection Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{collection.name}</h3>
                  <span className="text-sm text-gray-500">
                    {collection.recipe_count} recipes
                  </span>
                </div>
                {collection.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Collection Modal would go here */}
      {/* We'll implement this in the next step */}
    </div>
  )
}
