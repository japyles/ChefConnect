'use client'

import { RecipeCard } from '@/components/recipes/recipe-card'
import { RecipeFilters } from '@/components/recipes/recipe-filters'
import { RecipeSearch } from '@/components/recipes/recipe-search'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Recipe {
  id: string
  title: string
  description: string
  photos: Array<{
    photo_url: string
    is_primary: boolean
  }>
  user: {
    id: string
    full_name: string
    avatar_url: string
  }
  favorites: Array<{ count: number }>
  average_rating: number
  cooking_time: number
  created_at: string
}

interface SearchResults {
  recipes: Recipe[]
  total: number
  page: number
  totalPages: number
}

export default function RecipesPage() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          '/api/recipes' + (searchParams.toString() ? '?' + searchParams.toString() : '')
        )
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched recipes data:', data)
          if (Array.isArray(data)) {
            setRecipes(data)
            setResults(null)
          } else if (data && Array.isArray(data.recipes)) {
            setRecipes(data.recipes)
            setResults(data)
          } else {
            setRecipes([])
            setResults(null)
          }
        }
      } catch (error) {
        console.error('Error fetching recipes:', error)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [searchParams])

  // Show toast if redirected after creating a recipe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('created') === '1') {
        toast.success('Recipe created successfully!')
        // Remove the query param from the URL so the toast doesn't show again on refresh
        params.delete('created')
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '')
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h1 className="text-2xl font-bold text-gray-900">
              Explore Recipes
            </h1>
            <RecipeSearch />
          </div>
        </div>
        <div className='flex w-full gap-8'>
                  {/* Filters and Results */}
        <div className="w-1/3">
        <RecipeFilters />
          </div>

{/* Recipe Grid */}
<div className="py-8 w-2/3">
  {loading ? (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ) : recipes.length === 0 ? (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <p className="text-lg font-medium text-gray-900">
        No recipes found
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your search or filters
      </p>
    </div>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )}

  {/* Pagination */}
  {results && results.totalPages > 1 && (
    <div className="mt-8 flex items-center justify-center space-x-2">
      {Array.from({ length: results.totalPages }).map((_, i) => {
        const page = i + 1
        const isActive = page === results.page

        return (
          <button
            key={page}
            onClick={() => {
              const params = new URLSearchParams(
                searchParams.toString()
              )
              params.set('page', page.toString())
              window.history.pushState(
                null,
                '',
                '?' + params.toString()
              )
            }}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        )
      })}
    </div>
  )}
</div>
        </div>

      </div>
    </div>
  )
}
