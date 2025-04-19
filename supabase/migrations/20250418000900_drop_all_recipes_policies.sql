-- Drop ALL policies on the recipes table, regardless of name
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'recipes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s" ON public.recipes;', policy_record.policyname);
    END LOOP;
END $$;
