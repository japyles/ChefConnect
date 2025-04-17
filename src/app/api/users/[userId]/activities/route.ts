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
    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
