'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@clerk/nextjs'
import { Edit2, Globe, Lock, Share2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface CollectionHeaderProps {
  collection: {
    id: string
    name: string
    description: string
    is_public: boolean
    user_id: string
  }
  isOwner: boolean
  onUpdate: (updated: Partial<CollectionHeaderProps['collection']>) => void
}

export function CollectionHeader({
  collection,
  isOwner,
  onUpdate,
}: CollectionHeaderProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description)
  const [isPublic, setIsPublic] = useState(collection.is_public)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = async () => {
    setIsEditing(true)
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          is_public: isPublic,
        }),
      })

      if (response.ok) {
        onUpdate({ name, description, is_public: isPublic })
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error updating collection:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) return

    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
    }
  }

  const handleShare = async () => {
    if (collection.is_public) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/collections/${collection.id}`
      )
      alert('Collection link copied to clipboard!')
    } else {
      if (
        confirm(
          'This collection is private. Would you like to make it public to share?'
        )
      ) {
        const response = await fetch(`/api/collections/${collection.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_public: true,
          }),
        })

        if (response.ok) {
          onUpdate({ is_public: true })
          await navigator.clipboard.writeText(
            `${window.location.origin}/collections/${collection.id}`
          )
          alert('Collection is now public and the link has been copied!')
        }
      }
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
            {collection.is_public ? (
              <Globe className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {collection.description && (
            <p className="mt-1 text-gray-500">{collection.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Edit2 className="h-5 w-5" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit Collection
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-gray-700"
                >
                  Make this collection public
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isEditing || !name.trim()}
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
