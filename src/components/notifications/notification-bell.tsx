'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  type: 'comment' | 'reply' | 'mention' | 'reaction' | 'pin'
  actor: {
    id: string
    full_name: string
    avatar_url: string
  }
  recipe_id: string
  comment_id: string
  read: boolean
  created_at: string
}

export function NotificationBell() {
  const { userId } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
      return () => clearInterval(interval)
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationText = (notification: Notification) => {
    const actor = notification.actor.full_name
    switch (notification.type) {
      case 'comment':
        return `${actor} commented on your recipe`
      case 'reply':
        return `${actor} replied to your comment`
      case 'mention':
        return `${actor} mentioned you in a comment`
      case 'reaction':
        return `${actor} reacted to your comment`
      case 'pin':
        return `${actor} pinned your comment`
      default:
        return ''
    }
  }

  const handleClick = async (notification: Notification) => {
    await markAsRead(notification.id)
    router.push(`/recipes/${notification.recipe_id}#comment-${notification.comment_id}`)
  }

  if (!userId || loading) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex items-start space-x-3 p-3 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <img
                src={notification.actor.avatar_url}
                alt=""
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm">{getNotificationText(notification)}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at))} ago
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
