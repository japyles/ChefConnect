-- Enable Row Level Security and restrict all actions to the owner (by Clerk user_id)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT for owner"
  ON collections
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow INSERT for self"
  ON collections
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow UPDATE for owner"
  ON collections
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Allow DELETE for owner"
  ON collections
  FOR DELETE
  USING (user_id = auth.uid());
