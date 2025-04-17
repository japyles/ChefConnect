'use client'

import { useAuth } from '@clerk/nextjs'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Smile } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Reaction {
  emoji: string
  count: number
  users: Array<{
    id: string
    full_name: string
  }>
}

interface CommentReactionsProps {
  commentId: string
  reactions: Reaction[]
  onReactionChange: () => void
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🤔', '👎']

export function CommentReactions({
  commentId,
  reactions,
  onReactionChange,
}: CommentReactionsProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const [showPicker, setShowPicker] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleReaction = async (emoji: string) => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    try {
      const response = await fetch(
        `/api/recipes/comments/${commentId}/reactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emoji }),
        }
      )

      if (response.ok) {
        onReactionChange()
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
    }
  }

  const hasReacted = (emoji: string) =>
    reactions.some((r) =>
      r.users.some((u) => u.id === userId && r.emoji === emoji)
    )

  return (
    <div className="flex items-center space-x-2">
      <div className="flex flex-wrap gap-1">
        {COMMON_EMOJIS.map((emoji) => {
          const reaction = reactions.find((r) => r.emoji === emoji)
          const count = reaction?.count || 0
          const isActive = hasReacted(emoji)

          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`inline-flex items-center space-x-1 rounded-full border px-2 py-0.5 text-sm hover:bg-gray-100 ${
                isActive
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-500'
              }`}
            >
              <span>{emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setShowPicker(!showPicker)}
          className={`rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 ${
            showPicker ? 'bg-gray-100' : ''
          }`}
        >
          <Smile className="h-5 w-5" />
        </button>

        {showPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full right-0 z-50 mb-2"
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji: any) => {
                handleReaction(emoji.native)
                setShowPicker(false)
              }}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
