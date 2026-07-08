-- ============================================================================
-- UAESinger v2 — credit-based plans, blog posting, admin.
-- Run in Supabase → SQL Editor (after schema.sql).
-- ============================================================================

-- 1. Contact unlocks — one row per (hirer, artist) revealed. Enforces the
--    per-plan quota at the DB layer: you can only read a contact you've unlocked.
create table if not exists public.contact_unlocks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  artist_id  uuid not null references public.artists(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artist_id)
);
create index if not exists contact_unlocks_user_idx on public.contact_unlocks(user_id);

alter table public.contact_unlocks enable row level security;
create policy "unlocks_select_own"
  on public.contact_unlocks for select using (auth.uid() = user_id);
create policy "unlocks_insert_own"
  on public.contact_unlocks for insert with check (auth.uid() = user_id);

-- 2. Contacts are now readable only for artists you've unlocked (or own).
drop policy if exists "artist_contacts_select_subscribers" on public.artist_contacts;
create policy "artist_contacts_select_unlocked"
  on public.artist_contacts for select
  using (
    exists (
      select 1 from public.contact_unlocks u
      where u.user_id = auth.uid() and u.artist_id = artist_contacts.artist_id
    )
    or exists (
      select 1 from public.artists a
      where a.id = artist_contacts.artist_id and a.owner_id = auth.uid()
    )
  );

-- 3. Blog posts.
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  excerpt    text,
  category   text default 'Guides',
  body       text,          -- paragraphs separated by blank lines
  read_mins  int not null default 4,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
create policy "posts_public_read"
  on public.posts for select using (published);
create policy "posts_admin_all"
  on public.posts for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 4. Admins can manage all artists (publish/unpublish/delete).
create policy "artists_admin_all"
  on public.artists for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 5. Artist-set public price range (shown on the profile & cards).
alter table public.artists add column if not exists price_min int;
alter table public.artists add column if not exists price_max int;

-- Make yourself admin (replace the email):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
