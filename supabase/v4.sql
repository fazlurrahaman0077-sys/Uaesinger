-- ============================================================================
-- UAESinger v4 — Ziina payments. Run in Supabase → SQL Editor
-- (after schema.sql + v2.sql + v3.sql).
--
-- Tracks each Ziina payment intent so the /pricing/confirm return handler can
-- match a returning user to their intent and verify it server-side before
-- activating the subscription.
-- ============================================================================

create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  plan       text not null,
  ziina_id   text not null unique,           -- Ziina payment_intent id
  amount_aed int  not null,
  status     text not null default 'pending' -- pending | completed | failed
             check (status in ('pending','completed','failed')),
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments(user_id);

alter table public.payments enable row level security;

-- A user manages only their own payment rows. The confirm handler runs as the
-- signed-in user, verifies status with Ziina, then flips this row + activates
-- the subscription (subscriptions insert RLS already allows own rows).
create policy "payments_select_own"
  on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert_own"
  on public.payments for insert with check (auth.uid() = user_id);
create policy "payments_update_own"
  on public.payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Record which payment funded a subscription (audit trail).
alter table public.subscriptions add column if not exists ziina_payment_id text;
