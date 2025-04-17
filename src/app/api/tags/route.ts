import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const { data: tags, error } = await supabase
      .from('tags')
      .select(`*, recipe_count:recipe_tags(count)`)
      .order('name')

    if (error) throw error

    // Transform data to include recipe count
    const transformedTags = tags.map((tag) => ({
      ...tag,
      recipe_count: tag.recipe_count[0]?.count || 0,
    }))

    return NextResponse.json(transformedTags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
