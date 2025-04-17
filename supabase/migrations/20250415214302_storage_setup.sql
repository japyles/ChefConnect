-- Create the recipe-images bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Policy to allow authenticated uploads
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and (storage.foldername(name))[1] = 'recipe-images'
  -- Restrict file size to 5MB
  and length(name) < 5000000
);

-- Policy to allow public read access to images
create policy "Allow public read access"
on storage.objects
for select
to public
using (bucket_id = 'recipe-images');

-- Policy to allow users to delete their own uploads
create policy "Allow users to delete own uploads"
on storage.objects
for delete
to authenticated
using (bucket_id = 'recipe-images' and auth.uid() = owner::uuid);
