-- ============================================================================
-- UAESinger v18 — artist likes (heart button).
-- Run in Supabase → SQL Editor (after v17.sql).
-- ============================================================================

-- One row per (user, artist) like. Same shape/RLS as contact_unlocks (v2).
create table if not exists public.artist_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  artist_id  uuid not null references public.artists(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artist_id)
);
create index if not exists artist_likes_artist_idx on public.artist_likes(artist_id);

alter table public.artist_likes enable row level security;
create policy "likes_select_own"
  on public.artist_likes for select using (auth.uid() = user_id);
create policy "likes_insert_own"
  on public.artist_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own"
  on public.artist_likes for delete using (auth.uid() = user_id);

-- Denormalized count on artists so public cards/profile show it without an
-- aggregate query (artists are already publicly readable).
alter table public.artists add column if not exists likes_count int not null default 0;

create or replace function public.bump_artist_likes() returns trigger
  language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.artists set likes_count = likes_count + 1 where id = new.artist_id;
  elsif tg_op = 'DELETE' then
    update public.artists set likes_count = greatest(likes_count - 1, 0) where id = old.artist_id;
  end if;
  return null;
end $$;

drop trigger if exists artist_likes_count on public.artist_likes;
create trigger artist_likes_count
  after insert or delete on public.artist_likes
  for each row execute function public.bump_artist_likes();

-- Backfill any rows that predate the trigger.
update public.artists a
set likes_count = (select count(*) from public.artist_likes l where l.artist_id = a.id);
