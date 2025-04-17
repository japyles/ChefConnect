-- Add foreign key from recipe_tags.tag_id to tags.id
ALTER TABLE recipe_tags
ADD CONSTRAINT fk_recipe_tags_tag_id FOREIGN KEY (tag_id) REFERENCES tags(id);
