import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();
    const targetUserId = params.userId;

    if (!currentUserId || currentUserId !== targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAdminClient();

    // Get top 6 recipes by likes
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        recipe_photos (
          id,
          photo_url,
          is_primary
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json(recipes || []);
  } catch (error) {
    console.error('Error fetching top recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top recipes' },
      { status: 500 }
    );
  }
}
