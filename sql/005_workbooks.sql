-- Workbooks table
create table public.workbooks (
  id text primary key,                    -- nanoid(12)
  user_id uuid references auth.users on delete cascade not null,
  topic text not null,
  topic_label text not null,
  level text not null,
  level_label text not null,
  destination text not null,
  dest_label text not null,
  profile_json jsonb not null default '{}',
  theme_color text not null default 'orange',
  title text not null,
  subtitle text not null default '',
  status text not null default 'generating'
    check (status in ('generating', 'completed', 'failed')),
  days_completed integer not null default 0,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.workbooks enable row level security;
create policy "own_select" on public.workbooks for select using (auth.uid() = user_id);
create policy "own_insert" on public.workbooks for insert with check (auth.uid() = user_id);
create policy "own_update" on public.workbooks for update using (auth.uid() = user_id);
create index idx_workbooks_user on public.workbooks (user_id, created_at desc);

-- Workbook days table
create table public.workbook_days (
  id uuid default gen_random_uuid() primary key,
  workbook_id text references public.workbooks(id) on delete cascade not null,
  day_number integer not null,
  item_en text not null,
  item_ja text not null,
  item_emoji text,
  content_json jsonb not null,
  created_at timestamptz default now() not null,
  unique (workbook_id, day_number)
);

alter table public.workbook_days enable row level security;
create policy "own_select" on public.workbook_days for select using (
  exists (select 1 from public.workbooks where id = workbook_id and user_id = auth.uid())
);
create policy "own_insert" on public.workbook_days for insert with check (
  exists (select 1 from public.workbooks where id = workbook_id and user_id = auth.uid())
);
create index idx_wdays_workbook on public.workbook_days (workbook_id, day_number);
