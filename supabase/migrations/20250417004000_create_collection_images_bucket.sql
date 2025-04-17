-- Create 'collection-images' storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
select 'collection-images', 'collection-images', true
where not exists (
  select 1 from storage.buckets where id = 'collection-images'
);

-- Optionally, set policies for the bucket
-- Allow public read access (remove if you want private images)
-- You can further restrict with RLS if needed
