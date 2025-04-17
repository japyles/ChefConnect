import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with local development credentials
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function testImageUpload() {
  try {
    // First, let's sign up a test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456'
    });

    if (authError) {
      throw authError;
    }

    console.log('Test user created:', authData);

    // Create a test image (1x1 pixel transparent PNG)
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const imageData = Buffer.from(base64Image, 'base64');
    const fileName = 'test-image.png';

    // Upload the image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(`recipe-images/${fileName}`, imageData, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    console.log('Image uploaded successfully:', uploadData);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(`recipe-images/${fileName}`);

    console.log('Public URL:', publicUrl);

  } catch (error) {
    console.error('Error:', error);
  }
}

testImageUpload();
