import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()
  const body = await req.json()

  try {
    const { error } = await supabase
      .from('notifications')
      .update(body)
      .eq('id', params.notificationId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error updating notification:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', params.notificationId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
