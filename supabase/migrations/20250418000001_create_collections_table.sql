-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    cover_image text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: index for fast lookup
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
