import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const supabase = await createAdminClient();
    const fileExt = (file as File).name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `collection-images/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('collection-images')
      .upload(filePath, file as File, { upsert: true });

    if (error) {
      console.error('Error uploading image:', error);
      return new NextResponse('Failed to upload image', { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('collection-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl, path: filePath });
  } catch (error: any) {
    console.error('[UPLOAD_COLLECTION_IMAGE]', error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
