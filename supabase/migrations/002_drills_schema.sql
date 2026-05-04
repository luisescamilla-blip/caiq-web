-- Extend drills table with missing fields
alter table public.drills
  add column if not exists category text default 'Other',
  add column if not exists tags text[] default '{}',
  add column if not exists difficulty text not null default 'beginner'
    check (difficulty in ('beginner','intermediate','advanced')),
  add column if not exists duration integer default 15,
  add column if not exists youtube_url text;
