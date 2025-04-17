import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createAdminClient } from '@/lib/supabase/server'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
}

interface UserAchievement {
  achievement_id: string
  earned_at: string
  achievements: Achievement
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        earned_at,
        achievements (
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
