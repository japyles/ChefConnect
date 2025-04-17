import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

const SUGGESTED_TAGS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Quick',
  'Easy',
  'Healthy',
]

export function TagInput() {
  const [inputValue, setInputValue] = useState('')
  const { register, setValue, watch } = useFormContext()
  const tags = watch('tags') || []

  useEffect(() => {
    register('tags')
  }, [register])

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase()
    if (
      normalizedTag &&
      !tags.some((t: string) => t.toLowerCase() === normalizedTag)
    ) {
      setValue('tags', [...tags, tag.trim()])
    }
    setInputValue('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag: string) => tag !== tagToRemove)
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(inputValue)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="tag-input" className="mb-2 block text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          id="tag-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a tag and press Enter"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="rounded-full p-0.5 hover:bg-blue-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-500">Suggested tags:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.filter(
            (tag) => !tags.some((t: string) => t.toLowerCase() === tag.toLowerCase())
          ).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
