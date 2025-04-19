-- 1. Drop all RLS policies on recipes referencing user_id
DROP POLICY IF EXISTS "Allow SELECT for owner" ON recipes;
DROP POLICY IF EXISTS "Allow INSERT for self" ON recipes;
DROP POLICY IF EXISTS "Allow UPDATE for owner" ON recipes;
DROP POLICY IF EXISTS "Allow DELETE for owner" ON recipes;

-- 2. Alter user_id column to UUID (if needed)
ALTER TABLE recipes
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- 3. Recreate RLS policies (replace with your actual policy logic as needed)
CREATE POLICY "Allow SELECT for owner"
  ON recipes
  FOR SELECT
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Allow INSERT for self"
  ON recipes
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Allow UPDATE for owner"
  ON recipes
  FOR UPDATE
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Allow DELETE for owner"
  ON recipes
  FOR DELETE
  USING (user_id = auth.uid()::uuid);
