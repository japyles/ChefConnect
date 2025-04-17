'use client'

import { useAuth } from '@clerk/nextjs'
import {
  Check,
  Loader2,
  Plus,
  ShoppingBasket,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ShoppingListItem {
  id: string
  ingredient: string
  quantity: string | null
  is_checked: boolean
  recipe_id: string | null
}

interface ShoppingList {
  id: string
  name: string
  created_at: string
  items: ShoppingListItem[]
}

export function ShoppingLists() {
  const { userId } = useAuth()
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [newListName, setNewListName] = useState('')
  const [showNewListInput, setShowNewListInput] = useState(false)

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/shopping-lists`)
        if (response.ok) {
          const data = await response.json()
          setLists(data)
        }
      } catch (error) {
        console.error('Error fetching shopping lists:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchLists()
    }
  }, [userId])

  const createNewList = async () => {
    if (!newListName.trim()) return

    try {
      const response = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newListName,
        }),
      })

      if (response.ok) {
        const newList = await response.json()
        setLists([...lists, newList])
        setNewListName('')
        setShowNewListInput(false)
      }
    } catch (error) {
      console.error('Error creating shopping list:', error)
    }
  }

  const toggleItem = async (listId: string, itemId: string) => {
    try {
      const response = await fetch(
        `/api/shopping-lists/${listId}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_checked: !lists
              .find((l) => l.id === listId)
              ?.items.find((i) => i.id === itemId)?.is_checked,
          }),
        }
      )

      if (response.ok) {
        setLists(
          lists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                items: list.items.map((item) => {
                  if (item.id === itemId) {
                    return { ...item, is_checked: !item.is_checked }
                  }
                  return item
                }),
              }
            }
            return list
          })
        )
      }
    } catch (error) {
      console.error('Error toggling item:', error)
    }
  }

  const deleteList = async (listId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLists(lists.filter((list) => list.id !== listId))
      }
    } catch (error) {
      console.error('Error deleting shopping list:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with add list button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Shopping Lists</h2>
        <button
          onClick={() => setShowNewListInput(true)}
          className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>New List</span>
        </button>
      </div>

      {/* New list input */}
      {showNewListInput && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={createNewList}
            className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowNewListInput(false)}
            className="rounded-lg bg-gray-500 p-2 text-white hover:bg-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {lists.length === 0 && !showNewListInput ? (
        <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-gray-200 bg-white p-8 text-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <ShoppingBasket className="h-6 w-6" />
            <p className="text-lg font-medium">No shopping lists</p>
          </div>
          <button
            onClick={() => setShowNewListInput(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Your First List
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{list.name}</h3>
                <button
                  onClick={() => deleteList(list.id)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {list.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2"
                  >
                    <button
                      onClick={() => toggleItem(list.id, item.id)}
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        item.is_checked
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {item.is_checked && <Check className="h-3 w-3" />}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        item.is_checked ? 'text-gray-400 line-through' : ''
                      }`}
                    >
                      {item.quantity && `${item.quantity} `}
                      {item.ingredient}
                    </span>
                  </div>
                ))}
              </div>

              {list.items.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">
                  No items in this list
                </p>
              )}

              <div className="mt-4 text-center">
                <a
                  href={`/shopping-lists/${list.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Full List
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
