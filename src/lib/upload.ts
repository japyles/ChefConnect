import { supabase } from './supabase';

export async function uploadImage(file: File) {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;  // Removed recipe-images/ prefix since it's the bucket name

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Upload the file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(filePath, fileData, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,  // Allow overwriting files
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

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
