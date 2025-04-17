'use client'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Smile } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowPicker(!showPicker)}
        type="button"
        className={`rounded p-1 hover:bg-gray-100 ${
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
              onEmojiSelect(emoji)
              setShowPicker(false)
            }}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  )
}
