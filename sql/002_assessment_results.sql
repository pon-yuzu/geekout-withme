-- Store assessment results
create table if not exists public.assessment_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  language text not null check (language in ('english', 'japanese')),
  mode text not null check (mode in ('text', 'voice', 'both')),
  text_level text,
  voice_level text,
  feedback jsonb,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.assessment_results enable row level security;

-- Users can read their own results
create policy "Users can read their own results"
  on public.assessment_results for select
  using (auth.uid() = user_id);

-- Users can insert their own results
create policy "Users can insert their own results"
  on public.assessment_results for insert
  with check (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_assessment_results_user_id
  on public.assessment_results (user_id, created_at desc);
