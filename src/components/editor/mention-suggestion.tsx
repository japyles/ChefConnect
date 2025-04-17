'use client'

import { useEffect, useState } from 'react'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

interface User {
  id: string
  full_name: string
  avatar_url: string
}

interface MentionListProps {
  items: User[]
  command: (user: User) => void
}

export const MentionList = ({ items, command }: MentionListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter']
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }
        if (e.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }
        if (e.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [items, selectedIndex])

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  return items.length > 0 ? (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => selectItem(index)}
          className={`flex w-full items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100 ${
            index === selectedIndex ? 'bg-gray-100' : ''
          }`}
        >
          {item.avatar_url ? (
            <img
              src={item.avatar_url}
              alt=""
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xs text-gray-600">
                {item.full_name[0]}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-900">{item.full_name}</span>
        </button>
      ))}
    </div>
  ) : null
}

export const suggestion = {
  items: async ({ query }: { query: string }) => {
    if (!query) return []
    try {
      const response = await fetch(`/api/users/search?q=${query}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      const users: User[] = await response.json()
      return users.slice(0, 5)
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  render: () => {
    let component: any
    let popup: any

    return {
      onStart: (props: any) => {
        component = new MentionList({
          ...props,
          target: document.body,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate: (props: any) => {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }
        return component.onKeyDown(props)
      },

      onExit: () => {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}
