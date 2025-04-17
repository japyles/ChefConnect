import { createAdminClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();
    const targetUserId = params.userId;

    if (!currentUserId || currentUserId !== targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAdminClient();

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(
        `
        *,
        recipe_photos (
          id,
          photo_url,
          is_primary
        )
      `
      )
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json(recipes || []);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user recipes' },
      { status: 500 }
    );
  }
}
