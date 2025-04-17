'use client'

import { Disclosure } from '@headlessui/react'
import { ChevronDown, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterGroup {
  id: string
  name: string
  options: FilterOption[]
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
]

const timeOptions = [
  { value: '15', label: '15 minutes or less' },
  { value: '30', label: '30 minutes or less' },
  { value: '60', label: '1 hour or less' },
  { value: '120', label: 'Over 1 hour' },
]

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export function RecipeFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: Set<string>
  }>({
    time: new Set(),
    difficulty: new Set(),
    tags: new Set(),
  })
  const [sort, setSort] = useState('newest')
  const [tags, setTags] = useState<FilterOption[]>([])

  // Load tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        if (response.ok) {
          const data = await response.json()
          setTags(
            data.map((tag: any) => ({
              value: tag.id,
              label: tag.name,
              count: tag.recipe_count,
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }

    fetchTags()
  }, [])

  // Initialize filters from URL
  useEffect(() => {
    const time = searchParams.getAll('time')
    const difficulty = searchParams.getAll('difficulty')
    const tagIds = searchParams.getAll('tags')
    const sortBy = searchParams.get('sort') || 'newest'

    setSelectedFilters({
      time: new Set(time),
      difficulty: new Set(difficulty),
      tags: new Set(tagIds),
    })
    setSort(sortBy)
  }, [searchParams])

  const updateFilters = useCallback(
    (groupId: string, value: string, checked: boolean) => {
      const newFilters = { ...selectedFilters }
      if (checked) {
        newFilters[groupId].add(value)
      } else {
        newFilters[groupId].delete(value)
      }
      setSelectedFilters(newFilters)

      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete(groupId)
      newFilters[groupId].forEach((val) => {
        params.append(groupId, val)
      })
      router.push(pathname + '?' + params.toString())
    },
    [selectedFilters, pathname, router, searchParams]
  )

  const updateSort = useCallback(
    (value: string) => {
      setSort(value)
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', value)
      router.push(pathname + '?' + params.toString())
    },
    [pathname, router, searchParams]
  )

  const clearFilters = useCallback(() => {
    setSelectedFilters({
      time: new Set(),
      difficulty: new Set(),
      tags: new Set(),
    })
    setSort('newest')
    router.push(pathname)
  }, [pathname, router])

  const filterGroups: FilterGroup[] = [
    {
      id: 'time',
      name: 'Cooking Time',
      options: timeOptions,
    },
    {
      id: 'difficulty',
      name: 'Difficulty',
      options: difficultyOptions,
    },
    {
      id: 'tags',
      name: 'Tags',
      options: tags,
    },
  ]

  const hasActiveFilters =
    selectedFilters.time.size > 0 ||
    selectedFilters.difficulty.size > 0 ||
    selectedFilters.tags.size > 0 ||
    sort !== 'newest'

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:hidden">
        <button
          type="button"
          className="text-sm font-medium text-gray-700"
          onClick={clearFilters}
        >
          Clear all
        </button>
        <button
          type="button"
          className="text-sm font-medium text-gray-900"
          onClick={() => {}}
        >
          Done
        </button>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-gray-200 py-4">
          <div className="flex items-center space-x-4">
            {/* Sort Menu */}
            <div>
              <select
                value={sort}
                onChange={(e) => updateSort(e.target.value)}
                className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by: {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedFilters.time).map((value) => (
                  <button
                    key={value}
                    onClick={() => updateFilters('time', value, false)}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {timeOptions.find((o) => o.value === value)?.label}
                    <X className="ml-1.5 h-4 w-4" />
                  </button>
                ))}
                {Array.from(selectedFilters.difficulty).map((value) => (
                  <button
                    key={value}
                    onClick={() => updateFilters('difficulty', value, false)}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {
                      difficultyOptions.find((o) => o.value === value)
                        ?.label
                    }
                    <X className="ml-1.5 h-4 w-4" />
                  </button>
                ))}
                {Array.from(selectedFilters.tags).map((value) => (
                  <button
                    key={value}
                    onClick={() => updateFilters('tags', value, false)}
                    className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {tags.find((o) => o.value === value)?.label}
                    <X className="ml-1.5 h-4 w-4" />
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-6">
          {/* Filters */}
          <div className="hidden lg:block">
            <div className="space-y-6">
              {filterGroups.map((group) => (
                <Disclosure
                  as="div"
                  key={group.id}
                  className="border-b border-gray-200 py-6"
                  defaultOpen={true}
                >
                  {({ open }) => (
                    <>
                      <h3 className="-my-3">
                        <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                          <span className="font-medium text-gray-900">
                            {group.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <ChevronDown
                              className={`h-5 w-5 ${
                                open ? 'rotate-180 transform' : ''
                              }`}
                            />
                          </span>
                        </Disclosure.Button>
                      </h3>
                      <Disclosure.Panel className="pt-6">
                        <div className="space-y-4">
                          {group.options.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center"
                            >
                              <input
                                id={`filter-${group.id}-${option.value}`}
                                name={`${group.id}[]`}
                                value={option.value}
                                type="checkbox"
                                checked={selectedFilters[group.id].has(
                                  option.value
                                )}
                                onChange={(e) =>
                                  updateFilters(
                                    group.id,
                                    option.value,
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`filter-${group.id}-${option.value}`}
                                className="ml-3 text-sm text-gray-600"
                              >
                                {option.label}
                                {option.count !== undefined && (
                                  <span className="ml-1 text-gray-400">
                                    ({option.count})
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </div>

          {/* Recipe grid */}
          <div className="col-span-4 lg:col-span-3">
            {/* This will be filled by the parent component */}
          </div>
        </div>
      </div>
    </div>
  )
}
