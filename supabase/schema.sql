-- ============================================================================
-- UAESinger — schema (no seed data). Run in Supabase → SQL Editor.
-- Talent content is PUBLIC; contact details are gated behind an active
-- subscription, enforced by RLS (not just the app UI).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles — extends auth.users
-- ============================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'hirer' check (role in ('hirer','artist','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- categories
-- ============================================================================
create table if not exists public.categories (
  slug       text primary key,
  label      text not null,
  emoji      text,
  blurb      text,
  sort_order int not null default 0
);

alter table public.categories enable row level security;

create policy "categories_public_read"
  on public.categories for select
  using (true);

-- ============================================================================
-- subscriptions — hirer access (unlocks all contacts)
-- ============================================================================
create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  plan               text not null,
  status             text not null default 'active' check (status in ('active','canceled','past_due')),
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- DEV-ONLY self-activation so the flow is testable without a payment processor.
-- Before launch: drop this policy and let only the Stripe webhook write rows.
create policy "subscriptions_insert_own_dev"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- artists — PUBLIC content (no contact info here)
-- ============================================================================
create table if not exists public.artists (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category_slug text not null references public.categories(slug),
  owner_id      uuid references auth.users(id) on delete set null,
  city          text not null,
  tagline       text,
  bio           text,
  rating        numeric(2,1) not null default 0,
  reviews       int not null default 0,
  gigs          int not null default 0,
  languages     text[] not null default '{}',
  genres        text[] not null default '{}',
  availability  text not null default 'Available now',
  response_rate int  not null default 0,
  featured_tag  text,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists artists_category_idx  on public.artists(category_slug);
create index if not exists artists_published_idx on public.artists(is_published);

alter table public.artists enable row level security;

create policy "artists_public_read_published"
  on public.artists for select
  using (is_published);

create policy "artists_owner_all"
  on public.artists for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
-- artist_contacts — GATED. Never publicly readable.
-- ============================================================================
create table if not exists public.artist_contacts (
  artist_id uuid primary key references public.artists(id) on delete cascade,
  phone     text,
  email     text,
  whatsapp  text
);

alter table public.artist_contacts enable row level security;

-- Readable only by an active subscriber, or the artist owner.
create policy "artist_contacts_select_subscribers"
  on public.artist_contacts for select
  using (
    exists (
      select 1
      from public.subscriptions s
      where s.user_id = auth.uid()
        and s.status = 'active'
    )
    or exists (
      select 1
      from public.artists a
      where a.id = artist_contacts.artist_id
        and a.owner_id = auth.uid()
    )
  );

create policy "artist_contacts_owner_write"
  on public.artist_contacts for all
  using (
    exists (
      select 1
      from public.artists a
      where a.id = artist_contacts.artist_id
        and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.artists a
      where a.id = artist_contacts.artist_id
        and a.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- bookings — enquiries hirer -> artist
-- ============================================================================
create table if not exists public.bookings (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artists(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_date date,
  message    text,
  status     text not null default 'new' check (status in ('new','contacted','confirmed','declined')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_idx   on public.bookings(user_id);
create index if not exists bookings_artist_idx on public.bookings(artist_id);

alter table public.bookings enable row level security;

create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);
