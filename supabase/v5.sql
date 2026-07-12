-- ============================================================================
-- UAESinger v5 — admin visibility + unique-visitor analytics.
-- Run in Supabase → SQL Editor (after v4.sql).
-- ============================================================================

-- 0. is_admin() — SECURITY DEFINER so it reads profiles WITHOUT triggering RLS.
--    Needed because a profiles policy that queries profiles would recurse.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 1. Admins can read every profile (fixes user / creator counts — profiles RLS
--    otherwise limits admin to its own row).
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles for select
  using (public.is_admin());

-- 2. Payer email snapshot + admin read on payments.
alter table public.payments add column if not exists user_email text;

drop policy if exists "payments_admin_select" on public.payments;
create policy "payments_admin_select"
  on public.payments for select
  using (public.is_admin());

-- 3. Unique daily visitors. One row per (visitor, day) => deduped by construction.
create table if not exists public.visits (
  visitor_id text not null,
  day        date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  primary key (visitor_id, day)
);
create index if not exists visits_day_idx on public.visits(day);

alter table public.visits enable row level security;

-- Anyone (incl. anon) can log a visit; conflicts are ignored by the writer.
drop policy if exists "visits_insert_any" on public.visits;
create policy "visits_insert_any"
  on public.visits for insert with check (true);

-- Only admins can read the analytics.
drop policy if exists "visits_admin_select" on public.visits;
create policy "visits_admin_select"
  on public.visits for select
  using (public.is_admin());
