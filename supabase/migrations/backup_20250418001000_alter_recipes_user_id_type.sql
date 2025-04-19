-- Alter user_id column to UUID
ALTER TABLE recipes
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
