import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    console.log('Received photo data:', data);
    console.log('Recipe ID:', params.recipeId);
    console.log('User ID:', userId);

    const supabase = await createAdminClient();
    console.log('Supabase client created:', !!supabase);

    try {
      // Verify recipe exists and belongs to user
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', params.recipeId)
        .eq('user_id', userId)
        .single();

      if (recipeError) {
        console.error('Recipe verification error:', recipeError);
        return new NextResponse('Recipe not found or unauthorized', { status: 404 });
      }

      if (!recipe) {
        console.error('Recipe not found');
        return new NextResponse('Recipe not found', { status: 404 });
      }

      // Validate required fields
      if (!data.photo_url) {
        console.error('Missing photo_url');
        return new NextResponse('photo_url is required', { status: 400 });
      }

      const photoData = {
        recipe_id: params.recipeId,
        photo_url: data.photo_url,
        is_primary: data.is_primary || false,
        step_number: data.step_number || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Inserting photo data:', photoData);

      // Insert the photo
      const { data: photo, error: photoError } = await supabase
        .from('recipe_photos')
        .insert([photoData])
        .select()
        .single();

      if (photoError) {
        console.error('Error saving photo:', photoError);
        return new NextResponse(`Failed to save photo: ${photoError.message}`, { status: 500 });
      }

      if (!photo) {
        console.error('No photo data returned after insert');
        return new NextResponse('Failed to save photo: No data returned', { status: 500 });
      }

      console.log('Successfully saved photo:', photo);
      return NextResponse.json(photo);
    } catch (error: any) {
      console.error('[RECIPE_PHOTOS] Detailed error:', {
        error,
        message: error.message,
        stack: error.stack
      });
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('[RECIPE_PHOTOS] Detailed error:', {
      error,
      message: error.message,
      stack: error.stack
    });
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
