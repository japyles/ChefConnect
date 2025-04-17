'use client'

import { RecipeForm } from '@/components/ui/recipe-form/recipe-form'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function NewRecipePage() {
  const router = useRouter()
  const { userId } = useAuth()

  const handleSubmit = async (data: any) => {
    if (!userId) return

    try {
      console.log('Creating recipe with data:', data);

      // Create the recipe
      const recipeResponse = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          cooking_time: data.cookingTime,
          servings: data.servings,
          user_id: userId,
        }),
      })

      if (!recipeResponse.ok) {
        const errorText = await recipeResponse.text();
        console.error('Recipe creation failed:', errorText);
        throw new Error(`Failed to create recipe: ${errorText}`);
      }

      const recipe = await recipeResponse.json()
      console.log('Recipe created:', recipe);

      // Add photos
      if (data.images && data.images.length > 0) {
        console.log('Adding photos:', data.images);
        const photoPromises = data.images.map(async (image: any, index: number) => {
          console.log('Processing photo:', { image, index });
          const photoResponse = await fetch(`/api/recipes/${recipe.id}/photos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              photo_url: image.url,
              is_primary: index === 0, // First image is primary
              step_number: image.stepNumber || null,
            }),
          });

          if (!photoResponse.ok) {
            const errorText = await photoResponse.text();
            console.error('Photo addition failed:', errorText);
            throw new Error(`Failed to add photo: ${errorText}`);
          }

          const result = await photoResponse.json();
          console.log('Photo added successfully:', result);
          return result;
        });

        const photoResults = await Promise.all(photoPromises);
        console.log('Photos added:', photoResults);
      }

      // Add tags
      if (data.tags && data.tags.length > 0) {
        console.log('Adding tags:', data.tags);
        const tagResponse = await fetch(`/api/recipes/${recipe.id}/tags`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tags: data.tags }),
        });

        if (!tagResponse.ok) {
          const errorText = await tagResponse.text();
          console.error('Tag addition failed:', errorText);
          throw new Error(`Failed to add tags: ${errorText}`);
        }
      }

      router.push('/recipes?created=1')
    } catch (error) {
      console.error('Error creating recipe:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Create New Recipe</h1>
        <RecipeForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
