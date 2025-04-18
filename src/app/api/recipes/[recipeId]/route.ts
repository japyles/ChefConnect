import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  try {
    console.log('Fetching recipe with ID:', params.recipeId)
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        user:user_profiles(id, full_name, avatar_url),
        tags:recipe_tags!fk_recipe_tags_recipe_id(
          tags:tags!fk_recipe_tags_tag_id(name)
        )
      `)
      .eq('id', params.recipeId)
      .single()

    console.log('Supabase recipe query result:', recipe, error)

    if (error) throw error
    if (!recipe) {
      return new NextResponse('Recipe not found', { status: 404 })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()
  const body = await req.json()

  try {
    const { error } = await supabase
      .from('recipes')
      .update(body)
      .eq('id', params.recipeId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error updating recipe:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE: Only allow owner to delete their recipe
export async function DELETE(req: Request, { params }: { params: { recipeId: string } }) {
  const session = await auth();
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const supabase = await createClient();
  try {
    // Only delete if the recipe belongs to the current user
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.recipeId)
      .eq('user_id', session.userId);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
