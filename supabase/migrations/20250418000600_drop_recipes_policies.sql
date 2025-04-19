-- Drop all RLS policies on recipes referencing user_id
DROP POLICY IF EXISTS "Allow SELECT for owner" ON recipes;
DROP POLICY IF EXISTS "Allow INSERT for self" ON recipes;
DROP POLICY IF EXISTS "Allow UPDATE for owner" ON recipes;
DROP POLICY IF EXISTS "Allow DELETE for owner" ON recipes;
