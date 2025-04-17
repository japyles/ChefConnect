'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, FolderHeart, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Collection {
  id: string
  name: string
  description: string
  cover_image: string
  recipe_count: number
}

export function RecipeCollections({ userId }: { userId: string }) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/collections`)
        if (response.ok) {
          const data = await response.json()
          setCollections(data)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchCollections()
    }
  }, [userId])

  const createCollection = async () => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection),
      })
      if (response.ok) {
        setNewCollection({ name: '', description: '' })
        fetch(`/api/users/${userId}/collections`)
          .then((response) => response.json())
          .then((data) => setCollections(data));
      }
    } catch (error) {
      console.error('Error creating collection:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recipe Collections</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  value={newCollection.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewCollection((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Weekend Brunch Favorites"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewCollection((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What's special about this collection?"
                />
              </div>
              <Button onClick={createCollection} className="w-full">
                Create Collection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3]">
              {collection.cover_image ? (
                <Image
                  src={collection.cover_image}
                  alt={collection.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <FolderHeart className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit Collection</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Delete Collection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900">{collection.name}</h4>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {collection.description}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                {collection.recipe_count} recipes
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
