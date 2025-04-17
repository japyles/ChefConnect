'use client'

import { ShoppingListHeader } from '@/components/shopping/shopping-list-header'
import { ShoppingListItems } from '@/components/shopping/shopping-list-items'
import { AddFromRecipe } from '@/components/shopping/add-from-recipe'
import { useAuth } from '@clerk/nextjs'
import { Loader2, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ShoppingListItem {
  id: string
  ingredient: string
  quantity: string | null
  is_checked: boolean
  recipe_id: string | null
  recipe?: {
    id: string
    title: string
  }
}

interface ShoppingList {
  id: string
  name: string
  user_id: string
  items: ShoppingListItem[]
}

export default function ShoppingListPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const [list, setList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddFromRecipe, setShowAddFromRecipe] = useState(false)
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await fetch(`/api/shopping-lists/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setList(data)
        } else {
          router.push('/profile')
        }
      } catch (error) {
        console.error('Error fetching shopping list:', error)
        router.push('/profile')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchList()
    }
  }, [params.id, router])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return

    try {
      const response = await fetch(`/api/shopping-lists/${list?.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient: newItem,
        }),
      })

      if (response.ok) {
        const item = await response.json()
        setList((prev) =>
          prev
            ? {
                ...prev,
                items: [...prev.items, item],
              }
            : null
        )
        setNewItem('')
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleToggleItem = async (itemId: string) => {
    try {
      const item = list?.items.find((i) => i.id === itemId)
      if (!item) return

      const response = await fetch(
        `/api/shopping-lists/${list?.id}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_checked: !item.is_checked,
          }),
        }
      )

      if (response.ok) {
        setList((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((i) =>
                  i.id === itemId
                    ? { ...i, is_checked: !i.is_checked }
                    : i
                ),
              }
            : null
        )
      }
    } catch (error) {
      console.error('Error toggling item:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `/api/shopping-lists/${list?.id}/items/${itemId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setList((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((i) => i.id !== itemId),
              }
            : null
        )
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleAddFromRecipe = async (items: Array<{ ingredient: string; quantity: string | null }>) => {
    try {
      const response = await fetch(`/api/shopping-lists/${list?.id}/items/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      })

      if (response.ok) {
        const newItems = await response.json()
        setList((prev) =>
          prev
            ? {
                ...prev,
                items: [...prev.items, ...newItems],
              }
            : null
        )
        setShowAddFromRecipe(false)
      }
    } catch (error) {
      console.error('Error adding items from recipe:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!list) return null

  const isOwner = userId === list.user_id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ShoppingListHeader
          list={list}
          isOwner={isOwner}
          onUpdate={(updated) => setList({ ...list, ...updated })}
        />

        <div className="mt-8 space-y-6">
          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="flex space-x-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newItem.trim()}
              className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              <span>Add</span>
            </button>
          </form>

          {/* Add from Recipe Button */}
          <button
            onClick={() => setShowAddFromRecipe(true)}
            className="inline-flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-5 w-5" />
            <span>Add Items from Recipe</span>
          </button>

          {/* Shopping List Items */}
          <ShoppingListItems
            items={list.items}
            onToggle={handleToggleItem}
            onDelete={handleDeleteItem}
          />
        </div>

        {/* Add from Recipe Modal */}
        {showAddFromRecipe && (
          <AddFromRecipe
            onClose={() => setShowAddFromRecipe(false)}
            onAdd={handleAddFromRecipe}
          />
        )}
      </div>
    </div>
  )
}
