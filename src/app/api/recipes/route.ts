import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    // Get Supabase admin client
    const supabase = await createAdminClient();

    // Insert the recipe into Supabase
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert([
        {
          title: data.title,
          description: data.description,
          ingredients: data.ingredients,
          instructions: data.instructions,
          cook_time: data.cookingTime,
          servings: data.servings,
          user_id: userId,
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
    if (Array.isArray(data.collection_ids) && data.collection_ids.length > 0) {
      const inserts = data.collection_ids.map((collection_id: string) => ({
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
        author:user_profiles(id, full_name, avatar_url),
        tags:recipe_tags(
          tags(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipes:', error);
      return new NextResponse(`Failed to fetch recipes: ${error.message}`, { status: 500 });
    }

    return NextResponse.json({ recipes });
  } catch (error: any) {
    console.error('[RECIPES][GET]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
