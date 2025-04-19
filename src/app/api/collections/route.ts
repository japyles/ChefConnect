import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('[COLLECTIONS][GET] userId:', userId);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('collections')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    console.log('[COLLECTIONS][GET] data:', data);
    console.log('[COLLECTIONS][GET] error:', error);

    if (error) {
      console.error('Error fetching collections:', error);
      return new NextResponse('Failed to fetch collections', { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[COLLECTIONS][GET] Exception:', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    console.log('[COLLECTIONS][POST] userId:', userId);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { name } = await req.json();
    console.log('[COLLECTIONS][POST] name:', name);
    if (!name || typeof name !== 'string') {
      return new NextResponse('Collection name is required', { status: 400 });
    }
    const supabase = await createAdminClient();
    // Ensure user profile exists or upsert
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(
        { user_id: userId },
        { onConflict: 'user_id' }
      )
      .select('id')
      .single();
    console.log('[COLLECTIONS][POST] profile:', profile);
    console.log('[COLLECTIONS][POST] profileError:', profileError);
    const { data, error } = await supabase
      .from('collections')
      .insert([
        { name, user_id: userId, created_at: new Date().toISOString() }
      ])
      .select('id, name')
      .single();
    console.log('[COLLECTIONS][POST] insert error:', error);
    console.log('[COLLECTIONS][POST] insert data:', data);
    if (profileError) {
      console.error('Error ensuring user profile:', profileError);
      // Do not block collection creation if profile upsert fails
    }
    if (error) {
      console.error('Error creating collection:', error);
      return new NextResponse('Failed to create collection', { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[COLLECTIONS][POST] Exception:', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
