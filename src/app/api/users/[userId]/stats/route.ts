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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient();

    // Get recipe count
    const { count: recipeCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // Get favorite count
    const { count: favoriteCount } = await supabase
      .from('recipe_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // Get total likes on user's recipes
    const { data: userRecipes } = await supabase
      .from('recipes')
      .select('id')
      .eq('user_id', targetUserId);

    const recipeIds = userRecipes?.map(recipe => recipe.id) || [];

    let totalLikes = 0;
    if (recipeIds.length > 0) {
      const { count } = await supabase
        .from('recipe_favorites')
        .select('*', { count: 'exact', head: true })
        .in('recipe_id', recipeIds);
      totalLikes = count || 0;
    }

    return NextResponse.json({
      recipeCount: recipeCount || 0,
      favoriteCount: favoriteCount || 0,
      totalLikes,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
