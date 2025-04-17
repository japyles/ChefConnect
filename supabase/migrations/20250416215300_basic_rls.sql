-- Enable RLS on recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
ON recipes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
