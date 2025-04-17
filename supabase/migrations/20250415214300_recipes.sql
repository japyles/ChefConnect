-- Create recipes table
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cuisine_type TEXT,
    dietary_preferences TEXT[],
    ingredients JSONB,
    images JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all recipes
CREATE POLICY "Allow users to read all recipes"
ON recipes FOR SELECT
TO authenticated
USING (true);

-- Policy to allow users to insert their own recipes
CREATE POLICY "Allow users to insert their own recipes"
ON recipes FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::uuid = user_id);

-- Policy to allow users to update their own recipes
CREATE POLICY "Allow users to update their own recipes"
ON recipes FOR UPDATE
TO authenticated
USING (auth.uid()::uuid = user_id)
WITH CHECK (auth.uid()::uuid = user_id);

-- Policy to allow users to delete their own recipes
CREATE POLICY "Allow users to delete their own recipes"
ON recipes FOR DELETE
TO authenticated
USING (auth.uid()::uuid = user_id);

-- Create index for user_id for faster lookups
CREATE INDEX recipes_user_id_idx ON recipes(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
