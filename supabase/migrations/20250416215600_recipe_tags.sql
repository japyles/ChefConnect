-- Create tags table
CREATE TABLE tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recipe_tags junction table
CREATE TABLE recipe_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipe_id, tag_id)
);

-- Add RLS policies for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow all users to read tags
CREATE POLICY "Allow users to read tags"
ON tags FOR SELECT
TO authenticated
USING (true);

-- Policy to allow admin to manage tags
CREATE POLICY "Allow admin to manage tags"
ON tags
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = (auth.uid())::text
        AND is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = (auth.uid())::text
        AND is_admin = true
    )
);

-- Add RLS policies for recipe_tags
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;

-- Policy to allow all users to read recipe tags
CREATE POLICY "Allow users to read recipe tags"
ON recipe_tags FOR SELECT
TO authenticated
USING (true);

-- Policy to allow users to manage their own recipe tags
CREATE POLICY "Allow users to manage their own recipe tags"
ON recipe_tags
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM recipes
        WHERE recipes.id = recipe_id
        AND recipes.user_id = (auth.uid())::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipes
        WHERE recipes.id = recipe_id
        AND recipes.user_id = (auth.uid())::uuid
    )
);
