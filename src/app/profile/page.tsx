'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedProfile } from '@/components/profile/enhanced-profile'
import { UserRecipes } from '@/components/profile/user-recipes'
import { UserFavorites } from '@/components/profile/user-favorites'
import { UserDrafts } from '@/components/profile/user-drafts'
import { UserCollections } from '@/components/profile/user-collections'
import { ShoppingLists } from '@/components/profile/shopping-lists'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function ProfilePage() {
  const { userId, isLoaded } = useAuth()

  if (isLoaded && !userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <EnhancedProfile />
        </div>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="recipes">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-4">
            <UserRecipes status="published" />
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <UserDrafts />
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <UserCollections />
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <UserFavorites />
          </TabsContent>

          <TabsContent value="shopping" className="space-y-4">
            <ShoppingLists />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
