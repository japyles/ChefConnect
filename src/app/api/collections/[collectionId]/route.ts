import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { collectionId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  try {
    const { data: collection, error } = await supabase
      .from('recipe_collections')
      .select(`
        *,
        recipes:recipe_collection_items(
          recipe:recipes(
            id,
            title,
            image_url,
            cooking_time,
            difficulty,
            servings,
            cuisine_type
          )
        )
      `)
      .eq('id', params.collectionId)
      .single()

    if (error) throw error

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { collectionId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()
  const body = await req.json()

  try {
    const { error } = await supabase
      .from('recipe_collections')
      .update(body)
      .eq('id', params.collectionId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error updating collection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { collectionId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('recipe_collections')
      .delete()
      .eq('id', params.collectionId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
