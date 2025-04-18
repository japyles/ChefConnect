-- Add missing foreign key from recipes.user_id to user_profiles.id
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

-- Add missing foreign key from recipe_tags.tag_id to tags.id
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

-- Add missing foreign key from recipe_tags.recipe_id to recipes.id
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
