import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.userId)
      .single()

    if (error) throw error

    // Return default preferences if none exist
    if (!data) {
      return NextResponse.json({
        notification_email: true,
        notification_web: true,
        notification_mobile: true,
        email_digest_frequency: 'daily',
        theme: 'light',
        language: 'en',
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const updates = await req.json()
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: session.userId,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    return new NextResponse('OK')
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
