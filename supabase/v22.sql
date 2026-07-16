-- ============================================================================
-- UAESinger v22 — thumbs-up on artists, written reviews, experience + skills.
-- Run in Supabase → SQL Editor (after v21.sql).
-- ============================================================================

-- ---------------------------------------------------------------- thumbs up
-- Separate from artist_likes (v18): heart = save/favourite, thumb = upvote.
-- Same shape, RLS and trigger pattern as artist_likes.
create table if not exists public.artist_thumbs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  artist_id  uuid not null references public.artists(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artist_id)
);
create index if not exists artist_thumbs_artist_idx on public.artist_thumbs(artist_id);

alter table public.artist_thumbs enable row level security;
create policy "thumbs_select_own" on public.artist_thumbs for select using (auth.uid() = user_id);
create policy "thumbs_insert_own" on public.artist_thumbs for insert with check (auth.uid() = user_id);
create policy "thumbs_delete_own" on public.artist_thumbs for delete using (auth.uid() = user_id);

alter table public.artists add column if not exists thumbs_count int not null default 0;

create or replace function public.bump_artist_thumbs() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.artists set thumbs_count = thumbs_count + 1 where id = new.artist_id;
  elsif tg_op = 'DELETE' then
    update public.artists set thumbs_count = greatest(thumbs_count - 1, 0) where id = old.artist_id;
  end if;
  return null;
end $$;

drop trigger if exists artist_thumbs_count on public.artist_thumbs;
create trigger artist_thumbs_count after insert or delete on public.artist_thumbs
  for each row execute function public.bump_artist_thumbs();

-- ----------------------------------------------------------------- reviews
-- One review per (user, artist). Publicly readable — reviews are social proof.
-- author_name is snapshotted so the profile needs no join to auth.users
-- (which is not publicly readable).
create table if not exists public.artist_reviews (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.artists(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  author_name text,
  rating      int  not null check (rating between 1 and 5),
  body        text not null check (length(trim(body)) between 1 and 2000),
  created_at  timestamptz not null default now(),
  unique (user_id, artist_id)
);
create index if not exists artist_reviews_artist_idx on public.artist_reviews(artist_id, created_at desc);

alter table public.artist_reviews enable row level security;

create policy "reviews_public_read" on public.artist_reviews for select using (true);

-- Signed-in users may review any artist except one they own (no self-reviews).
create policy "reviews_insert_own" on public.artist_reviews for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.artists a where a.id = artist_id and a.owner_id = auth.uid()
    )
  );
create policy "reviews_update_own" on public.artist_reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reviews_delete_own" on public.artist_reviews for delete using (auth.uid() = user_id);

-- Keep artists.rating / artists.reviews in step with the real rows.
-- Note: this overwrites any seeded rating the moment an artist gets a real
-- review. Artists with no reviews keep whatever is on the row today.
create or replace function public.sync_artist_rating() returns trigger language plpgsql as $$
declare
  target uuid := coalesce(new.artist_id, old.artist_id);
begin
  update public.artists a
  set reviews = r.n,
      rating  = coalesce(round(r.avg, 1), 0)
  from (
    select count(*) as n, avg(rating) as avg
    from public.artist_reviews where artist_id = target
  ) r
  where a.id = target;
  return null;
end $$;

drop trigger if exists artist_reviews_sync on public.artist_reviews;
create trigger artist_reviews_sync after insert or update or delete on public.artist_reviews
  for each row execute function public.sync_artist_rating();

-- ------------------------------------------------------ experience + skills
alter table public.artists add column if not exists experience_years int;
alter table public.artists add column if not exists skills text[] not null default '{}';
