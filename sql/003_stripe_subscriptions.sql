-- Stripe customer mapping
create table if not exists public.stripe_customers (
  id uuid references auth.users on delete cascade primary key,
  stripe_customer_id text unique not null,
  created_at timestamptz default now() not null
);

-- Subscription records
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  stripe_subscription_id text unique not null,
  status text not null default 'inactive',
  price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;

-- Users can read their own customer record
create policy "Users can read their own customer record"
  on public.stripe_customers for select
  using (auth.uid() = id);

-- Users can read their own subscriptions
create policy "Users can read their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role can manage all (for webhook processing)
create policy "Service role can manage stripe_customers"
  on public.stripe_customers for all
  using (auth.role() = 'service_role');

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- Index
create index if not exists idx_subscriptions_user_id
  on public.subscriptions (user_id);

-- Auto-update updated_at
create or replace trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();
