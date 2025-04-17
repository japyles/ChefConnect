'use client'

import { Check, Link, Trash2 } from 'lucide-react'
import Link from 'next/link'

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

interface ShoppingListItemsProps {
  items: ShoppingListItem[]
  onToggle: (itemId: string) => void
  onDelete: (itemId: string) => void
}

export function ShoppingListItems({
  items,
  onToggle,
  onDelete,
}: ShoppingListItemsProps) {
  // Group items by recipe
  const groupedItems = items.reduce(
    (acc, item) => {
      const key = item.recipe_id || 'ungrouped'
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    },
    {} as Record<string, ShoppingListItem[]>
  )

  // Sort items: checked items go to the bottom
  const sortItems = (items: ShoppingListItem[]) => {
    return [...items].sort((a, b) => {
      if (a.is_checked === b.is_checked) return 0
      return a.is_checked ? 1 : -1
    })
  }

  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white">
        <p className="text-gray-500">No items in this list</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ungrouped items */}
      {groupedItems.ungrouped && groupedItems.ungrouped.length > 0 && (
        <div className="space-y-2">
          {sortItems(groupedItems.ungrouped).map((item) => (
            <ShoppingItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Recipe groups */}
      {Object.entries(groupedItems).map(
        ([recipeId, items]) =>
          recipeId !== 'ungrouped' && (
            <div key={recipeId} className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link className="h-4 w-4" />
                <Link
                  href={`/recipes/${recipeId}`}
                  className="hover:text-blue-600 hover:underline"
                >
                  {items[0].recipe?.title}
                </Link>
              </div>
              {sortItems(items).map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )
      )}
    </div>
  )
}

function ShoppingItem({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingListItem
  onToggle: (itemId: string) => void
  onDelete: (itemId: string) => void
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border bg-white p-3 ${
        item.is_checked ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
      }`}
    >
      <div className="flex flex-1 items-center space-x-3">
        <button
          onClick={() => onToggle(item.id)}
          className={`flex h-5 w-5 items-center justify-center rounded border ${
            item.is_checked
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300'
          }`}
        >
          {item.is_checked && <Check className="h-3 w-3" />}
        </button>
        <span
          className={`flex-1 ${
            item.is_checked ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}
        >
          {item.quantity && (
            <span className="mr-2 text-gray-500">{item.quantity}</span>
          )}
          {item.ingredient}
        </span>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
