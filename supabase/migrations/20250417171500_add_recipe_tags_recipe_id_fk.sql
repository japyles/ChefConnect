-- Add missing foreign key from recipe_tags.recipe_id to recipes.id
ALTER TABLE recipe_tags
ADD CONSTRAINT fk_recipe_tags_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipes(id);
