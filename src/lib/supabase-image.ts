import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate a public URL for a photo in the recipe-images bucket
 * @param {string} path - The path of the image in the bucket
 * @returns {string} - Public URL
 */
export function getRecipeImageUrl(path: string): string {
  if (!path) return '/placeholder-recipe.jpg';
  if (path.startsWith('http')) return path;
  // Defensive: remove any leading slash
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
  const { data } = supabase.storage.from('recipe-images').getPublicUrl(cleanedPath);
  // Debug: log what we're generating
  if (typeof window !== 'undefined') {
    // Only log in browser
    console.log('getRecipeImageUrl input:', path, 'cleaned:', cleanedPath, 'publicUrl:', data?.publicUrl);
  }
  return data?.publicUrl || '/placeholder-recipe.jpg';
}
