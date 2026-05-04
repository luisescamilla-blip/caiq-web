-- Add avatar_url to coaches table
alter table public.coaches
  add column if not exists avatar_url text;

-- Create avatars storage bucket (public read, auth write)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own avatar
create policy "avatars_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' AND name = auth.uid()::text || '/avatar');

-- Allow authenticated users to update/replace their own avatar
create policy "avatars_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' AND name = auth.uid()::text || '/avatar');

-- Allow public read of all avatars
create policy "avatars_public_read" on storage.objects
  for select to public
  using (bucket_id = 'avatars');
