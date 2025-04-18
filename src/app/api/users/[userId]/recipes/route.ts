import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to get the user's UUID from user_profiles
async function getUserProfileUuid(supabase: any, clerkUserId: string) {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', clerkUserId)
    .single();
  if (error || !profile) {
    console.error('Could not find user profile for Clerk user id:', clerkUserId, error);
    return null;
  }
  return profile.id;
}

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId: currentUserId } = await auth();
    const clerkUserId = params.userId;

    if (!currentUserId || currentUserId !== clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAdminClient();
    // Get the UUID from user_profiles
    const userProfileUuid = await getUserProfileUuid(supabase, clerkUserId);
    if (!userProfileUuid) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 400 });
    }

    // Now use the UUID to query recipes
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_photos(id, photo_url, is_primary)
      `)
      .eq('user_id', userProfileUuid);

    if (error) {
      console.error('Error fetching user recipes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(recipes);
  } catch (error: any) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
