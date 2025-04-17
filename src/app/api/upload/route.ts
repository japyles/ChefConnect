import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Blob, File } from 'node:buffer';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return new NextResponse('No valid file provided', { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('File must be an image', { status: 400 });
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse('File size must be less than 5MB', { status: 400 });
    }

    console.log('Attempting to upload file:', {
      type: file.type,
      size: file.size,
      userId
    });

    try {
      // Create a unique file name
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${file.type.split('/')[1]}`;

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Get Supabase client
      const supabase = await createClient();

      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          duplex: 'half',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase storage error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      if (!data?.path) {
        throw new Error('No file path returned from upload');
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(data.path);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      console.log('Upload successful:', { publicUrl, path: data.path });
      return NextResponse.json({ url: publicUrl, path: data.path });
    } catch (uploadError: any) {
      console.error('Upload error details:', {
        error: uploadError,
        message: uploadError.message,
        stack: uploadError.stack,
        userId
      });
      return new NextResponse(
        `Upload failed: ${uploadError.message}`,
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in upload route:', {
      error,
      message: error.message,
      stack: error.stack
    });
    return new NextResponse(
      `Server error: ${error.message}`,
      { status: 500 }
    );
  }
}
