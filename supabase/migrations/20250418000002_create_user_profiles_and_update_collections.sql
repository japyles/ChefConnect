-- Create user_profiles table for Clerk users
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text UNIQUE NOT NULL, -- Clerk user ID
    full_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Remove FK from collections.user_id, change to text, add user_profile_id
ALTER TABLE public.collections
    DROP CONSTRAINT IF EXISTS collections_user_id_fkey,
    ALTER COLUMN user_id TYPE text,
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.collections
    ADD COLUMN IF NOT EXISTS user_profile_id uuid REFERENCES user_profiles(id);
