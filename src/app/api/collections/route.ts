import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createAdminClient();
    // Fetch collections for the user
    const { data, error } = await supabase
      .from('collections')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching collections:', error);
      return new NextResponse('Failed to fetch collections', { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[COLLECTIONS]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { name } = await req.json();
    if (!name || typeof name !== 'string') {
      return new NextResponse('Collection name is required', { status: 400 });
    }
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .insert([
        { name, user_id: userId, created_at: new Date().toISOString() }
      ])
      .select('id, name')
      .single();
    if (error) {
      console.error('Error creating collection:', error);
      return new NextResponse('Failed to create collection', { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[COLLECTIONS][POST]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
