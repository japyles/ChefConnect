-- Ensure recipes.user_id is UUID and references user_profiles.id
-- 1. Drop all RLS policies on recipes (explicitly, by name)
DROP POLICY IF EXISTS "Allow users to read all recipes" ON recipes;
DROP POLICY IF EXISTS "Allow users to insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Allow users to update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Allow users to delete their own recipes" ON recipes;

-- 2. Alter user_id column to UUID
ALTER TABLE recipes
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- 3. Recreate RLS policies for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read all recipes" ON recipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to insert their own recipes" ON recipes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::uuid);
CREATE POLICY "Allow users to update their own recipes" ON recipes FOR UPDATE TO authenticated USING (user_id = auth.uid()::uuid);
CREATE POLICY "Allow users to delete their own recipes" ON recipes FOR DELETE TO authenticated USING (user_id = auth.uid()::uuid);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_recipes_user_id_uuid' AND table_name = 'recipes'
    ) THEN
        ALTER TABLE recipes
          ADD CONSTRAINT fk_recipes_user_id_uuid FOREIGN KEY (user_id) REFERENCES user_profiles(id);
    END IF;
END $$;

-- Ensure recipe_tags.tag_id is UUID and references tags.id
ALTER TABLE recipe_tags
  ALTER COLUMN tag_id TYPE UUID USING tag_id::uuid;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_recipe_tags_tag_id' AND table_name = 'recipe_tags'
    ) THEN
        ALTER TABLE recipe_tags
          ADD CONSTRAINT fk_recipe_tags_tag_id FOREIGN KEY (tag_id) REFERENCES tags(id);
    END IF;
END $$;

-- Ensure recipe_tags.recipe_id is UUID and references recipes.id
ALTER TABLE recipe_tags
  ALTER COLUMN recipe_id TYPE UUID USING recipe_id::uuid;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_recipe_tags_recipe_id' AND table_name = 'recipe_tags'
    ) THEN
        ALTER TABLE recipe_tags
          ADD CONSTRAINT fk_recipe_tags_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipes(id);
    END IF;
END $$;
