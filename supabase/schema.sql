-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgvector";

-- Create custom types
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

-- Create tables
-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipes table
create table if not exists public.recipes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    ingredients jsonb not null, -- Array of ingredients with amounts
    instructions jsonb not null, -- Array of step-by-step instructions
    cooking_time integer not null, -- In minutes
    servings integer not null,
    notes text,
    video_url text,
    status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe photos table (one-to-many with recipes)
create table if not exists public.recipe_photos (
    id uuid default uuid_generate_v4() primary key,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    photo_url text not null,
    is_primary boolean default false,
    step_number integer, -- Optional: link photo to specific instruction step
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tags table
create table if not exists public.tags (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe tags junction table (many-to-many)
create table if not exists public.recipe_tags (
    recipe_id uuid references public.recipes(id) on delete cascade,
    tag_id uuid references public.tags(id) on delete cascade,
    primary key (recipe_id, tag_id)
);

-- Comments table
create table if not exists public.comments (
    id uuid default uuid_generate_v4() primary key,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    rating integer check (rating >= 1 and rating <= 5),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Favorites table (many-to-many relationship between users and recipes)
create table if not exists public.favorites (
    user_id uuid references public.profiles(id) on delete cascade,
    recipe_id uuid references public.recipes(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, recipe_id)
);

-- Meal plans table
create table if not exists public.meal_plans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    planned_date date not null,
    meal_type meal_type not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shopping lists table
create table if not exists public.shopping_lists (
    id uuid default uuid_generate_v4() primary key,
    user_id text not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Shopping list items table
create table if not exists public.shopping_list_items (
    id uuid default uuid_generate_v4() primary key,
    shopping_list_id uuid references public.shopping_lists(id) on delete cascade not null,
    ingredient text not null,
    quantity text,
    is_checked boolean default false,
    recipe_id uuid references public.recipes(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Collections table
create table if not exists public.collections (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  name text not null,
  description text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Collection recipes junction table
create table if not exists public.collection_recipes (
  collection_id uuid references public.collections(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (collection_id, recipe_id)
);

-- Recipe notes table for step-by-step cooking notes
create table if not exists public.recipe_notes (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade,
  user_id text not null,
  step_number integer,
  note text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe variations table
create table if not exists public.recipe_variations (
  id uuid default uuid_generate_v4() primary key,
  original_recipe_id uuid references public.recipes(id) on delete cascade,
  variation_recipe_id uuid references public.recipes(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(original_recipe_id, variation_recipe_id)
);

-- Comment mentions table
create table if not exists public.comment_mentions (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint comment_mentions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Comment helpful votes table
create table if not exists public.comment_helpful (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint comment_helpful_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade,
  constraint comment_helpful_unique unique (comment_id, user_id)
);

-- Comment reactions table
create table if not exists public.comment_reactions (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade,
  user_id text not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint comment_reactions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade,
  constraint comment_reactions_unique unique (comment_id, user_id, emoji)
);

-- Enable RLS on reactions
alter table public.comment_reactions enable row level security;

-- Add thread_path for better comment threading
alter table public.comments 
add column if not exists thread_path ltree;

-- Add materialized path trigger
create or replace function public.update_thread_path()
returns trigger as $$
begin
  if new.parent_id is null then
    new.thread_path = text2ltree(new.id::text);
  else
    select thread_path || text2ltree(new.id::text)
    into new.thread_path
    from public.comments
    where id = new.parent_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Add trigger for thread path
create trigger update_thread_path_trigger
  before insert on public.comments
  for each row
  execute function public.update_thread_path();

-- Create indexes for better query performance
create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists recipe_photos_recipe_id_idx on public.recipe_photos(recipe_id);
create index if not exists comments_recipe_id_idx on public.comments(recipe_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists meal_plans_user_id_idx on public.meal_plans(user_id);
create index if not exists meal_plans_recipe_id_idx on public.meal_plans(recipe_id);
create index if not exists shopping_list_items_shopping_list_id_idx on public.shopping_list_items(shopping_list_id);
create index if not exists comment_mentions_comment_id_idx on public.comment_mentions(comment_id);
create index if not exists comment_mentions_user_id_idx on public.comment_mentions(user_id);
create index if not exists comment_helpful_comment_id_idx on public.comment_helpful(comment_id);
create index if not exists comment_helpful_user_id_idx on public.comment_helpful(user_id);
create index if not exists comments_thread_path_idx on public.comments using gist(thread_path);
create index if not exists comment_reactions_comment_id_idx on public.comment_reactions(comment_id);
create index if not exists comment_reactions_user_id_idx on public.comment_reactions(user_id);
create index if not exists comment_reactions_emoji_idx on public.comment_reactions(emoji);

-- Set up Row Level Security (RLS)
-- Profiles: viewable by everyone, but only updatable by the owner
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles
    for select using (true);
create policy "Users can update own profile" on public.profiles
    for update using (auth.uid() = id);

-- Recipes: viewable by everyone, but only updatable by the owner
alter table public.recipes enable row level security;
create policy "Recipes are viewable by everyone" on public.recipes
    for select using (true);
create policy "Users can insert their own recipes" on public.recipes
    for insert with check (auth.uid() = user_id);
create policy "Users can update own recipes" on public.recipes
    for update using (auth.uid() = user_id);
create policy "Users can delete own recipes" on public.recipes
    for delete using (auth.uid() = user_id);

-- Collections policies
alter table public.collections enable row level security;
create policy "Users can create their own collections"
  on public.collections for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own collections"
  on public.collections for select
  to authenticated
  using (auth.uid() = user_id or is_public = true);

create policy "Users can update their own collections"
  on public.collections for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on public.collections for delete
  to authenticated
  using (auth.uid() = user_id);

-- Collection recipes policies
alter table public.collection_recipes enable row level security;
create policy "Users can add recipes to their collections"
  on public.collection_recipes for insert
  to authenticated
  with check (exists (
    select 1 from public.collections
    where id = public.collection_recipes.collection_id
    and user_id = auth.uid()
  ));

create policy "Users can view recipes in their collections"
  on public.collection_recipes for select
  to authenticated
  using (exists (
    select 1 from public.collections
    where id = public.collection_recipes.collection_id
    and (user_id = auth.uid() or is_public = true)
  ));

create policy "Users can remove recipes from their collections"
  on public.collection_recipes for delete
  to authenticated
  using (exists (
    select 1 from public.collections
    where id = public.collection_recipes.collection_id
    and user_id = auth.uid()
  ));

-- Recipe notes policies
alter table public.recipe_notes enable row level security;
create policy "Users can create their own recipe notes"
  on public.recipe_notes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view recipe notes"
  on public.recipe_notes for select
  to authenticated
  using (true);

create policy "Users can update their own recipe notes"
  on public.recipe_notes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own recipe notes"
  on public.recipe_notes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Shopping lists policies
alter table public.shopping_lists enable row level security;
create policy "Users can create their own shopping lists"
  on public.shopping_lists for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own shopping lists"
  on public.shopping_lists for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own shopping lists"
  on public.shopping_lists for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own shopping lists"
  on public.shopping_lists for delete
  to authenticated
  using (auth.uid() = user_id);

-- Shopping list items policies
alter table public.shopping_list_items enable row level security;
create policy "Users can manage their shopping list items"
  on public.shopping_list_items for all
  to authenticated
  using (exists (
    select 1 from public.shopping_lists
    where id = public.shopping_list_items.shopping_list_id
    and user_id = auth.uid()
  ));

-- Comment mentions policies
alter table public.comment_mentions enable row level security;
create policy "Users can view all mentions"
  on public.comment_mentions for select
  to authenticated
  using (true);

create policy "Users can create mentions"
  on public.comment_mentions for insert
  to authenticated
  using (true);

-- Comment helpful votes policies
alter table public.comment_helpful enable row level security;
create policy "Users can view all helpful votes"
  on public.comment_helpful for select
  to authenticated
  using (true);

create policy "Users can toggle their own helpful votes"
  on public.comment_helpful for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Comment reactions policies
alter table public.comment_reactions enable row level security;
create policy "Users can view all reactions"
  on public.comment_reactions for select
  to authenticated
  using (true);

create policy "Users can toggle their own reactions"
  on public.comment_reactions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Create functions for common operations
create or replace function public.get_recipe_with_details(recipe_id uuid)
returns json
language plpgsql
security definer
as $$
begin
    return (
        select json_build_object(
            'recipe', r,
            'photos', (
                select json_agg(p)
                from public.recipe_photos p
                where p.recipe_id = r.id
            ),
            'tags', (
                select json_agg(t.name)
                from public.tags t
                join public.recipe_tags rt on rt.tag_id = t.id
                where rt.recipe_id = r.id
            ),
            'author', (
                select row_to_json(p)
                from public.profiles p
                where p.id = r.user_id
            ),
            'comments', (
                select json_agg(
                    json_build_object(
                        'comment', c,
                        'user', (
                            select row_to_json(p)
                            from public.profiles p
                            where p.id = c.user_id
                        )
                    )
                )
                from public.comments c
                where c.recipe_id = r.id
            )
        )
        from public.recipes r
        where r.id = recipe_id
    );
end;
$$;

create or replace function public.get_comment_with_details(p_comment_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'id', c.id,
    'content', c.content,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'user', json_build_object(
      'id', u.id,
      'full_name', u.name,
      'avatar_url', u.image_url
    ),
    'reactions', (
      select json_agg(json_build_object(
        'emoji', r.emoji,
        'count', count(*),
        'users', json_agg(json_build_object(
          'id', ru.id,
          'full_name', ru.name
        ))
      ))
      from comment_reactions r
      join public.profiles ru on r.user_id = ru.id
      where r.comment_id = c.id
      group by r.emoji
    ),
    'replies', (
      select json_agg(json_build_object(
        'id', rc.id,
        'content', rc.content,
        'created_at', rc.created_at,
        'updated_at', rc.updated_at,
        'user', json_build_object(
          'id', ru.id,
          'full_name', ru.name,
          'avatar_url', ru.image_url
        )
      ))
      from public.comments rc
      join public.profiles ru on rc.user_id = ru.id
      where rc.parent_id = c.id
      order by rc.created_at asc
    )
  ) into result
  from public.comments c
  join public.profiles u on c.user_id = u.id
  where c.id = p_comment_id;

  return result;
end;
$$;

-- Add trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger to comments
alter table public.comments 
add column if not exists updated_at timestamp with time zone;
create trigger handle_comments_updated_at
  before update on public.comments
  for each row
  execute function public.handle_updated_at();

-- Add notification types enum
create type notification_type as enum (
  'comment',
  'reply',
  'mention',
  'reaction',
  'pin'
);

-- Add notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null references auth.users(id) on delete cascade,
  type notification_type not null,
  actor_id text references auth.users(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint notifications_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);

-- Add pinned comments table
create table if not exists public.pinned_comments (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  pinned_by text not null references auth.users(id) on delete cascade,
  pinned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint pinned_comments_unique unique (comment_id, recipe_id)
);

-- User preferences table
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null references auth.users(id) on delete cascade,
  notification_email boolean default true,
  notification_web boolean default true,
  notification_mobile boolean default true,
  email_digest_frequency text default 'daily',
  theme text default 'light',
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for user_preferences
alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists user_preferences_user_id_idx on public.user_preferences(user_id);

-- Add indexes
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_read_idx on public.notifications(read);
create index if not exists notifications_created_at_idx on public.notifications(created_at);
create index if not exists pinned_comments_recipe_id_idx on public.pinned_comments(recipe_id);

-- Enable RLS
alter table public.notifications enable row level security;
alter table public.pinned_comments enable row level security;
alter table public.user_preferences enable row level security;

-- Add RLS policies
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());

create policy "Recipe owners can manage pinned comments"
  on public.pinned_comments for all
  to authenticated
  using (
    exists (
      select 1 from public.recipes
      where id = recipe_id
      and user_id = auth.uid()
    )
  );

create policy "Anyone can view pinned comments"
  on public.pinned_comments for select
  to authenticated
  using (true);

create policy "Users can manage their own preferences"
  on public.user_preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Add notification functions
create or replace function public.notify_mentioned_users()
returns trigger as $$
declare
  mentioned_user text;
  mentions text[];
begin
  -- Extract @mentions from content using regex
  select array_agg(distinct substring(mention from 2))
  into mentions
  from regexp_matches(new.content, '@([a-zA-Z0-9_]+)', 'g') as mention;

  -- Create notifications for each mentioned user
  for mentioned_user in select unnest(mentions)
  loop
    insert into public.notifications (
      user_id,
      type,
      actor_id,
      recipe_id,
      comment_id
    )
    select
      u.id,
      'mention',
      new.user_id,
      new.recipe_id,
      new.id
    from auth.users u
    where u.username = mentioned_user
    and u.id != new.user_id;
  end loop;

  return new;
end;
$$ language plpgsql security definer;

create or replace function public.notify_comment_reaction()
returns trigger as $$
begin
  -- Create notification for comment owner
  insert into public.notifications (
    user_id,
    type,
    actor_id,
    recipe_id,
    comment_id
  )
  select
    c.user_id,
    'reaction',
    new.user_id,
    c.recipe_id,
    c.id
  from public.comments c
  where c.id = new.comment_id
  and c.user_id != new.user_id;

  return new;
end;
$$ language plpgsql security definer;

create or replace function public.notify_comment_reply()
returns trigger as $$
begin
  -- Create notification for parent comment owner
  if new.parent_id is not null then
    insert into public.notifications (
      user_id,
      type,
      actor_id,
      recipe_id,
      comment_id
    )
    select
      c.user_id,
      'reply',
      new.user_id,
      new.recipe_id,
      new.id
    from public.comments c
    where c.id = new.parent_id
    and c.user_id != new.user_id;
  else
    -- Notify recipe owner of new top-level comment
    insert into public.notifications (
      user_id,
      type,
      actor_id,
      recipe_id,
      comment_id
    )
    select
      r.user_id,
      'comment',
      new.user_id,
      new.recipe_id,
      new.id
    from public.recipes r
    where r.id = new.recipe_id
    and r.user_id != new.user_id;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Add triggers
create trigger notify_mentioned_users_trigger
  after insert or update on public.comments
  for each row
  execute function public.notify_mentioned_users();

create trigger notify_comment_reaction_trigger
  after insert on public.comment_reactions
  for each row
  execute function public.notify_comment_reaction();

create trigger notify_comment_reply_trigger
  after insert on public.comments
  for each row
  execute function public.notify_comment_reply();

-- User profiles table
create table user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  bio text,
  website_url text,
  twitter_url text,
  instagram_url text,
  facebook_url text,
  expertise_level text check (expertise_level in ('beginner', 'intermediate', 'advanced', 'professional')),
  dietary_preferences text[] default array[]::text[],
  favorite_cuisines text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_profiles_user_id_key unique (user_id)
);

-- Add RLS policies for user_profiles
alter table user_profiles enable row level security;

create policy "Users can view any profile"
  on user_profiles for select
  using (true);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = user_id);

-- Create index for faster lookups
create index user_profiles_user_id_idx on user_profiles(user_id);

-- Add achievements table
create table achievements (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add user achievements table
create table user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  achievement_id uuid not null references achievements(id),
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_achievements_user_achievement_key unique (user_id, achievement_id)
);

-- Add RLS policies for user_achievements
alter table user_achievements enable row level security;

create policy "Users can view any user achievements"
  on user_achievements for select
  using (true);

create policy "System can insert user achievements"
  on user_achievements for insert
  with check (true);

-- Create indexes for faster lookups
create index user_achievements_user_id_idx on user_achievements(user_id);
create index user_achievements_achievement_id_idx on user_achievements(achievement_id);

-- Insert default achievements
insert into achievements (name, description, icon, criteria) values
  ('Kitchen Novice', 'Created your first recipe', '👨‍🍳', '{"recipes_created": 1}'),
  ('Rising Star', 'Received 10 likes on your recipes', '⭐', '{"total_likes": 10}'),
  ('Recipe Maven', 'Created 10 recipes', '🏆', '{"recipes_created": 10}'),
  ('Community Favorite', 'Received 100 likes on your recipes', '🌟', '{"total_likes": 100}'),
  ('Comment Enthusiast', 'Left 50 comments on recipes', '💬', '{"comments_made": 50}'),
  ('Collection Curator', 'Created 5 recipe collections', '📚', '{"collections_created": 5}'),
  ('Helping Hand', 'Marked as helpful on 25 comments', '🤝', '{"helpful_marks": 25}'),
  ('Recipe Master', 'Created 50 recipes', '👨‍🍳', '{"recipes_created": 50}'),
  ('Social Butterfly', 'Connected all social media accounts', '🦋', '{"social_accounts": ["twitter", "instagram", "facebook"]}'),
  ('Cuisine Explorer', 'Created recipes from 10 different cuisines', '🌎', '{"unique_cuisines": 10}');

-- Add activity feed table
create table user_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  activity_type text not null check (
    activity_type in (
      'recipe_created',
      'recipe_updated',
      'recipe_liked',
      'recipe_favorited',
      'collection_created',
      'achievement_earned',
      'comment_added',
      'variation_created'
    )
  ),
  target_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for user_activities
alter table user_activities enable row level security;

create policy "Users can view any activity"
  on user_activities for select
  using (true);

create policy "System can insert activities"
  on user_activities for insert
  with check (true);

-- Create index for faster lookups
create index user_activities_user_id_idx on user_activities(user_id);
create index user_activities_created_at_idx on user_activities(created_at);

-- Function to create activity
create or replace function create_user_activity(
  p_user_id text,
  p_activity_type text,
  p_target_id uuid,
  p_metadata jsonb default '{}'::jsonb
) returns void as $$
begin
  insert into user_activities (user_id, activity_type, target_id, metadata)
  values (p_user_id, p_activity_type, p_target_id, p_metadata);
end;
$$ language plpgsql security definer;

-- Trigger for recipe creation
create or replace function on_recipe_created()
returns trigger as $$
begin
  perform create_user_activity(
    new.user_id,
    'recipe_created',
    new.id,
    jsonb_build_object('title', new.title)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger recipe_created_activity
  after insert on recipes
  for each row
  execute function on_recipe_created();

-- Trigger for recipe likes
create or replace function on_recipe_liked()
returns trigger as $$
declare
  v_recipe_title text;
begin
  select title into v_recipe_title from recipes where id = new.recipe_id;
  
  perform create_user_activity(
    new.user_id,
    'recipe_liked',
    new.recipe_id,
    jsonb_build_object('title', v_recipe_title)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger recipe_liked_activity
  after insert on likes
  for each row
  execute function on_recipe_liked();

-- Trigger for recipe favorites
create or replace function on_recipe_favorited()
returns trigger as $$
declare
  v_recipe_title text;
begin
  select title into v_recipe_title from recipes where id = new.recipe_id;
  
  perform create_user_activity(
    new.user_id,
    'recipe_favorited',
    new.recipe_id,
    jsonb_build_object('title', v_recipe_title)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger recipe_favorited_activity
  after insert on favorites
  for each row
  execute function on_recipe_favorited();

-- Trigger for achievement earned
create or replace function on_achievement_earned()
returns trigger as $$
declare
  v_achievement_name text;
begin
  select name into v_achievement_name from achievements where id = new.achievement_id;
  
  perform create_user_activity(
    new.user_id,
    'achievement_earned',
    new.achievement_id,
    jsonb_build_object('name', v_achievement_name)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger achievement_earned_activity
  after insert on user_achievements
  for each row
  execute function on_achievement_earned();
