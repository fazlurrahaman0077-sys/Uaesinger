-- Run once in Supabase → SQL Editor.
-- Tracks which hirers have an active subscription (unlocks artist contact details).

create table if not exists public.subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  plan       text not null,
  status     text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

-- A user can see their own subscription.
create policy "own subscriptions - select"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- DEV-ONLY: lets a signed-in user activate their own subscription so the flow
-- is testable without a payment processor. Before launch, DROP this policy and
-- write rows only from the Stripe webhook (service role bypasses RLS).
create policy "own subscriptions - insert (dev)"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);
