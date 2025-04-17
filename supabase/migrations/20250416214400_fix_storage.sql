-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Allow users to delete own uploads" on storage.objects;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;

-- Ensure the recipe-images bucket exists and is public
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do update set public = true;

-- Create new storage policies
create policy "recipe_images_public_select"
on storage.objects for select
to public
using ( bucket_id = 'recipe-images' );

create policy "recipe_images_auth_insert"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'recipe-images'
    -- File size limit is handled in the application code
);
