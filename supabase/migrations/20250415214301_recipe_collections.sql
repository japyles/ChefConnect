-- Create recipe collections table
CREATE TABLE recipe_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recipe collection items table
CREATE TABLE recipe_collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES recipe_collections(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, recipe_id)
);

-- Add RLS policies for recipe_collections
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own collections
CREATE POLICY "Allow users to read own collections"
ON recipe_collections FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own collections
CREATE POLICY "Allow users to insert own collections"
ON recipe_collections FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to update their own collections
CREATE POLICY "Allow users to update own collections"
ON recipe_collections FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to delete their own collections
CREATE POLICY "Allow users to delete own collections"
ON recipe_collections FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Add RLS policies for recipe_collection_items
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read items in their collections
CREATE POLICY "Allow users to read own collection items"
ON recipe_collection_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM recipe_collections
        WHERE id = recipe_collection_items.collection_id
        AND auth.uid()::text = user_id
    )
);

-- Policy to allow users to insert items into their collections
CREATE POLICY "Allow users to insert own collection items"
ON recipe_collection_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM recipe_collections
        WHERE id = recipe_collection_items.collection_id
        AND auth.uid()::text = user_id
    )
);

-- Policy to allow users to delete items from their collections
CREATE POLICY "Allow users to delete own collection items"
ON recipe_collection_items FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM recipe_collections
        WHERE id = recipe_collection_items.collection_id
        AND auth.uid()::text = user_id
    )
);

-- Create indexes for faster lookups
CREATE INDEX recipe_collections_user_id_idx ON recipe_collections(user_id);
CREATE INDEX recipe_collection_items_collection_id_idx ON recipe_collection_items(collection_id);
CREATE INDEX recipe_collection_items_recipe_id_idx ON recipe_collection_items(recipe_id);

-- Trigger to automatically update updated_at for collections
CREATE TRIGGER update_recipe_collections_updated_at
    BEFORE UPDATE ON recipe_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
