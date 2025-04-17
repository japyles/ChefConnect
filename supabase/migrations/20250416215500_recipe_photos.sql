-- Create recipe_photos table
CREATE TABLE recipe_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    step_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for recipe_photos
ALTER TABLE recipe_photos ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all recipe photos
CREATE POLICY "Allow users to read all recipe photos"
ON recipe_photos FOR SELECT
TO authenticated
USING (true);

-- Policy to allow users to insert photos for their own recipes
CREATE POLICY "Allow users to insert photos for their own recipes"
ON recipe_photos FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipes
        WHERE recipes.id = recipe_photos.recipe_id
        AND recipes.user_id = auth.uid()::uuid
    )
);

-- Policy to allow users to update photos for their own recipes
CREATE POLICY "Allow users to update photos for their own recipes"
ON recipe_photos FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM recipes
        WHERE recipes.id = recipe_photos.recipe_id
        AND recipes.user_id = auth.uid()::uuid
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipes
        WHERE recipes.id = recipe_photos.recipe_id
        AND recipes.user_id = auth.uid()::uuid
    )
);

-- Policy to allow users to delete photos for their own recipes
CREATE POLICY "Allow users to delete photos for their own recipes"
ON recipe_photos FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM recipes
        WHERE recipes.id = recipe_photos.recipe_id
        AND recipes.user_id = auth.uid()::uuid
    )
);

-- Create index for recipe_id for faster lookups
CREATE INDEX recipe_photos_recipe_id_idx ON recipe_photos(recipe_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipe_photos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_recipe_photos_updated_at
    BEFORE UPDATE ON recipe_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_recipe_photos_updated_at_column();
