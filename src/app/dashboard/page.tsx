'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeCard } from '@/components/recipe-card';
import { useRecipeStore } from '@/store/recipes';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const recipes = useRecipeStore((state) => state.recipes);

  // Redirect to home if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // Filter recipes for the current user (in a real app, this would be a server-side query)
  const userRecipes = recipes.filter(recipe => recipe.user_id === user.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.firstName || user.username}!</h1>
        <p className="mt-2 text-gray-600">Manage your recipes and collections</p>
      </div>

      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recipes">My Recipes</TabsTrigger>
          <TabsTrigger value="collections">My Collections</TabsTrigger>
          <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Recipes</h2>
            <button
              onClick={() => router.push('/recipes/new')}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Create New Recipe
            </button>
          </div>

          {userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  name={recipe.title}
                  description={`Created by you`}
                  recipeCount={1}
                  coverImage={recipe.image}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">No recipes yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first recipe
              </p>
              <button
                onClick={() => router.push('/recipes/new')}
                className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Create Recipe
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Collections</h2>
            <button
              onClick={() => router.push('/collections/new')}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Create Collection
            </button>
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No collections yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Organize your favorite recipes into collections
            </p>
            <button
              onClick={() => router.push('/collections/new')}
              className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Create Collection
            </button>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <h2 className="text-xl font-semibold">Saved Recipes</h2>
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No saved recipes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Save recipes you want to try later
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Browse Recipes
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
