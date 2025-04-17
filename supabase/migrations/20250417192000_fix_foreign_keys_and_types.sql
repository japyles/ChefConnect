-- Ensure recipes.user_id is UUID and references user_profiles.id
ALTER TABLE recipes
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

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
