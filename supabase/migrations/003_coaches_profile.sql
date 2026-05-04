-- Extend coaches table with profile fields
alter table public.coaches
  add column if not exists title text default '',
  add column if not exists bio text default '',
  add column if not exists phone text default '',
  add column if not exists timezone text default 'America/New_York',
  add column if not exists updated_at timestamptz default now();
