import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    const currentUserId = session.userId

    if (!currentUserId || currentUserId !== params.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: favorites, error } = await supabase
      .from('recipe_favorites')
      .select(
        `
        id,
        recipe:recipe_id (
          *,
          photos (
            id,
            photo_url,
            is_primary
          ),
          recipe_tags (
            tags (
              name
            )
          ),
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Error fetching user favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user favorites' },
      { status: 500 }
    )
  }
}
