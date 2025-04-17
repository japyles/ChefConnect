-- Check if tables exist first
DO $$ 
BEGIN
    -- Create likes table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'likes') THEN
        CREATE TABLE likes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recipe_id UUID NOT NULL,
            user_id TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Add foreign key after table creation
        ALTER TABLE likes
            ADD CONSTRAINT fk_recipe_likes
            FOREIGN KEY (recipe_id)
            REFERENCES recipes(id)
            ON DELETE CASCADE;

        -- Add unique constraint
        ALTER TABLE likes
            ADD CONSTRAINT unique_recipe_user_like 
            UNIQUE (recipe_id, user_id);

        -- Add index
        CREATE INDEX idx_likes_recipe_id ON likes(recipe_id);
    END IF;

    -- Create shares table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shares') THEN
        CREATE TABLE shares (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recipe_id UUID NOT NULL,
            user_id TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Add foreign key after table creation
        ALTER TABLE shares
            ADD CONSTRAINT fk_recipe_shares
            FOREIGN KEY (recipe_id)
            REFERENCES recipes(id)
            ON DELETE CASCADE;

        -- Add unique constraint
        ALTER TABLE shares
            ADD CONSTRAINT unique_recipe_user_share 
            UNIQUE (recipe_id, user_id);

        -- Add index
        CREATE INDEX idx_shares_recipe_id ON shares(recipe_id);
    END IF;

    -- Create recipe_ratings table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipe_ratings') THEN
        CREATE TABLE recipe_ratings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recipe_id UUID NOT NULL,
            user_id TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- Add foreign key after table creation
        ALTER TABLE recipe_ratings
            ADD CONSTRAINT fk_recipe_ratings
            FOREIGN KEY (recipe_id)
            REFERENCES recipes(id)
            ON DELETE CASCADE;

        -- Add unique constraint
        ALTER TABLE recipe_ratings
            ADD CONSTRAINT unique_recipe_user_rating 
            UNIQUE (recipe_id, user_id);

        -- Add index
        CREATE INDEX idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
    END IF;
END $$;
