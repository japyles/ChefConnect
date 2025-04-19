-- Drop the foreign key constraint on collections.user_id
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_user_id_fkey;

-- Change user_id to text for Clerk compatibility
ALTER TABLE collections ALTER COLUMN user_id TYPE text;
