import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const { data: collections, error } = await supabase
      .from('recipe_collections')
      .select(`
        id,
        name,
        description,
        cover_image,
        recipes:recipe_collection_items(count)
      `)
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform the data to include recipe count
    const transformedCollections = collections.map((collection) => ({
      ...collection,
      recipe_count: collection.recipes?.[0]?.count || 0,
    }))

    return NextResponse.json(transformedCollections)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
