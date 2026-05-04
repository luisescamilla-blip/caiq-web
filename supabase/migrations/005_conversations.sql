-- Conversations: persisted Cai chat threads
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  title text not null default 'New Conversation',
  tags text[] default '{}',
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "conversations_coach" on public.conversations for all using (auth.uid() = coach_id);
