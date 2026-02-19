-- Voice room listings
create table if not exists public.voice_rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  language text not null check (language in ('english', 'japanese', 'mixed')),
  max_participants integer default 10,
  created_by uuid references auth.users on delete set null,
  is_active boolean default true,
  participant_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.voice_rooms enable row level security;

-- Anyone can read active rooms
create policy "Anyone can read active rooms"
  on public.voice_rooms for select
  using (is_active = true);

-- Authenticated users can create rooms
create policy "Authenticated users can create rooms"
  on public.voice_rooms for insert
  with check (auth.uid() = created_by);

-- Room creators can update their rooms
create policy "Room creators can update their rooms"
  on public.voice_rooms for update
  using (auth.uid() = created_by);

-- Room creators can delete their rooms
create policy "Room creators can delete their rooms"
  on public.voice_rooms for delete
  using (auth.uid() = created_by);

-- Index
create index if not exists idx_voice_rooms_active
  on public.voice_rooms (is_active, created_at desc);

-- Auto-update updated_at
create or replace trigger voice_rooms_updated_at
  before update on public.voice_rooms
  for each row execute procedure public.update_updated_at();
