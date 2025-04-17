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

  const supabase = createClient()

  try {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        user:profiles(name, avatar_url),
        likes(count),
        comments(count),
        ratings(rating)
      `)
      .eq('id', params.recipeId)
      .single()

    if (error) throw error

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

export async function DELETE(
  req: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.recipeId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
