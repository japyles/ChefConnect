import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Ensures that a user_profiles row exists for the current Clerk user
async function ensureUserProfile(supabase: any, userId: string) {
  // Try to upsert the profile (insert if not exists, update otherwise)
  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        // Optionally set more fields like full_name, avatar_url, etc.
        // full_name: ...,
      },
      { onConflict: 'user_id' }
    );
  if (error) {
    console.error('Error ensuring user profile:', error);
    return false;
  }
  return true;
}

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  cookingTime: z.number().min(1, 'Cooking time is required'),
  servings: z.number().min(1, 'Number of servings is required'),
  tags: z.array(z.string()),
  status: z.enum(['published', 'draft']).default('published'),
  collection_ids: z.array(z.string()).optional(),
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    console.log('Received recipe data:', data);
    console.log('User ID:', userId);

    // Validate recipe data
    const parsedData = recipeSchema.parse(data);

    // Get Supabase admin client
    const supabase = await createAdminClient();
    // Ensure user profile exists
    await ensureUserProfile(supabase, userId);

    // Look up the user's profile UUID
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Could not find user profile for Clerk user id:', userId, profileError);
      return new NextResponse('User profile not found', { status: 400 });
    }

    const userProfileUuid = profile.id;

    // Insert the recipe into Supabase
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert([
        {
          title: parsedData.title,
          description: parsedData.description,
          ingredients: parsedData.ingredients,
          instructions: parsedData.instructions,
          cook_time: parsedData.cookingTime,
          servings: parsedData.servings,
          status: parsedData.status || 'published',
          user_id: userProfileUuid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      return new NextResponse(`Failed to create recipe: ${error.message}`, { status: 500 });
    }

    if (!recipe) {
      return new NextResponse('Failed to create recipe: No recipe data returned', { status: 500 });
    }

    // Assign to collections if collection_ids are provided
    if (Array.isArray(parsedData.collection_ids) && parsedData.collection_ids.length > 0) {
      const inserts = parsedData.collection_ids.map((collection_id: string) => ({
        recipe_id: recipe.id,
        collection_id,
        created_at: new Date().toISOString()
      }));
      const { error: collError } = await supabase
        .from('recipe_collections')
        .insert(inserts);
      if (collError) {
        console.error('Error assigning recipe to collections:', collError);
        return new NextResponse(`Recipe created but failed to assign collections: ${collError.message}`, { status: 500 });
      }
    }

    console.log('Created recipe:', recipe);
    return NextResponse.json(recipe);
  } catch (error: any) {
    console.error('[RECIPES]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        photos:recipe_photos(photo_url, is_primary),
        user:user_profiles(id, full_name, avatar_url),
        tags:recipe_tags!fk_recipe_tags_recipe_id(
          tags:tags!fk_recipe_tags_tag_id(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      return new NextResponse(`Failed to fetch recipes: ${error.message}`, { status: 500 });
    }

    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('[RECIPES][GET]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
