-- Recreate RLS policies for recipes
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
