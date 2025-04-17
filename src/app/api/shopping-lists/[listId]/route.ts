import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { listId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const { data: list, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        items:shopping_list_items(
          id,
          ingredient,
          quantity,
          unit,
          checked
        )
      `)
      .eq('id', params.listId)
      .single()

    if (error) throw error

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching shopping list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { listId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()
  const body = await req.json()

  try {
    const { error } = await supabase
      .from('shopping_lists')
      .update(body)
      .eq('id', params.listId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error updating shopping list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { listId: string } }
) {
  const session = await auth()
  if (!session.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', params.listId)
      .eq('user_id', session.userId)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting shopping list:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
