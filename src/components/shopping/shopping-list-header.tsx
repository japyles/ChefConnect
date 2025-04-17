'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Edit2, Share2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ShoppingListHeaderProps {
  list: {
    id: string
    name: string
    user_id: string
  }
  isOwner: boolean
  onUpdate: (updated: Partial<ShoppingListHeaderProps['list']>) => void
}

export function ShoppingListHeader({
  list,
  isOwner,
  onUpdate,
}: ShoppingListHeaderProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [name, setName] = useState(list.name)
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = async () => {
    setIsEditing(true)
    try {
      const response = await fetch(`/api/shopping-lists/${list.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
        }),
      })

      if (response.ok) {
        onUpdate({ name })
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error updating shopping list:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shopping list?')) return

    try {
      const response = await fetch(`/api/shopping-lists/${list.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error deleting shopping list:', error)
    }
  }

  const handleShare = async () => {
    try {
      // Create a text version of the shopping list
      const response = await fetch(`/api/shopping-lists/${list.id}/export`)
      if (response.ok) {
        const data = await response.json()
        await navigator.clipboard.writeText(data.text)
        alert('Shopping list copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing shopping list:', error)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>

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
              Edit Shopping List
            </h2>

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
