-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Coaches (mirrors auth.users)
create table public.coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- Students
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  avatar text,
  status text not null default 'active' check (status in ('active','inactive','on-hold')),
  program text,
  join_date date default current_date,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sessions
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  topic text not null,
  date date not null,
  time text,
  duration integer default 60,
  status text not null default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drills
create table public.drills (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  description text,
  -- polymorphic parent (optional - drill can belong to session, student, or another drill)
  parent_type text check (parent_type in ('session','student','drill')),
  parent_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Goals
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  title text not null,
  status text not null default 'not-started' check (status in ('not-started','in-progress','completed')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  due_date date,
  -- polymorphic parent
  parent_type text not null check (parent_type in ('student','session','drill')),
  parent_id uuid not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  content text not null,
  -- polymorphic parent
  parent_type text not null check (parent_type in ('student','session','drill')),
  parent_id uuid not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media
create table public.media (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  url text not null,
  type text not null check (type in ('photo','video')),
  caption text,
  -- polymorphic parent
  parent_type text not null check (parent_type in ('student','session','drill','note')),
  parent_id uuid not null,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.coaches enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.drills enable row level security;
alter table public.goals enable row level security;
alter table public.notes enable row level security;
alter table public.media enable row level security;

-- Coaches: can only see/edit own row
create policy "coaches_self" on public.coaches for all using (auth.uid() = id);

-- All other tables: coach_id must match logged-in user
create policy "students_coach" on public.students for all using (auth.uid() = coach_id);
create policy "sessions_coach" on public.sessions for all using (auth.uid() = coach_id);
create policy "drills_coach" on public.drills for all using (auth.uid() = coach_id);
create policy "goals_coach" on public.goals for all using (auth.uid() = coach_id);
create policy "notes_coach" on public.notes for all using (auth.uid() = coach_id);
create policy "media_coach" on public.media for all using (auth.uid() = coach_id);

-- Auto-create coach profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.coaches (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
