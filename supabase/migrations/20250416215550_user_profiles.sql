-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    dietary_preferences TEXT[],
    favorite_cuisines TEXT[],
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all profiles
CREATE POLICY "Allow users to read all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Policy to allow users to manage their own profile
CREATE POLICY "Allow users to manage their own profile"
ON user_profiles
TO authenticated
USING (user_id = (auth.uid())::text)
WITH CHECK (user_id = (auth.uid())::text);
