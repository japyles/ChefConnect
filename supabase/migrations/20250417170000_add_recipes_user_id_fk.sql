-- Add foreign key from recipes.user_id to user_profiles.id
ALTER TABLE recipes
ADD CONSTRAINT fk_recipes_user_id_uuid FOREIGN KEY (user_id) REFERENCES user_profiles(id);
