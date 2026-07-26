-- v27: play counts on a video. Unique per viewer per video (not per play), so
-- one person replaying a reel ten times still counts once.
--
-- Same anti-inflation shape as visits (v5): the row is written by a browser-only
-- beacon and keyed by a hashed viewer id, so crawlers (which don't run JS) and
-- reloads can't pump the number. No day in the key — a view is counted once,
-- forever, unlike the daily visit rollup.

create table if not exists public.video_views (
  video_id   uuid not null references public.artist_videos(id) on delete cascade,
  viewer_id  text not null,
  created_at timestamptz not null default now(),
  primary key (video_id, viewer_id)
);

alter table public.video_views enable row level security;
-- Insert-only for everyone, same as visits: the beacon runs for signed-out
-- viewers too. Nobody reads rows directly; the count lives on artist_videos.
drop policy if exists "video_views_insert_any" on public.video_views;
create policy "video_views_insert_any" on public.video_views for insert with check (true);

alter table public.artist_videos add column if not exists views_count int not null default 0;

-- security definer is load-bearing: the trigger runs as whoever inserted the
-- view (anon), and artist_videos' RLS only lets the OWNER update the row. An
-- invoker-rights trigger updates 0 rows and fails silently.
create or replace function public.bump_video_views() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.artist_videos set views_count = views_count + 1 where id = new.video_id;
  return null;
end $$;

drop trigger if exists video_views_count on public.video_views;
create trigger video_views_count after insert on public.video_views
  for each row execute function public.bump_video_views();

-- Same bug, already live: the like/thumb counters (v18/v21/v22/v26) were written
-- invoker-rights too, so every reaction from someone who isn't the owner was
-- silently dropped (prod had likes_count 1 against 3 real rows). Same fix, and a
-- one-off resync so the displayed numbers start from the truth.
create or replace function public.bump_video_likes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.artist_videos set likes_count = likes_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.artist_videos set likes_count = greatest(likes_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end $$;

create or replace function public.bump_video_thumbs() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.artist_videos set thumbs_count = thumbs_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.artist_videos set thumbs_count = greatest(thumbs_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end $$;

create or replace function public.bump_artist_likes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.artists set likes_count = likes_count + 1 where id = new.artist_id;
  elsif tg_op = 'DELETE' then
    update public.artists set likes_count = greatest(likes_count - 1, 0) where id = old.artist_id;
  end if;
  return null;
end $$;

create or replace function public.bump_artist_thumbs() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.artists set thumbs_count = thumbs_count + 1 where id = new.artist_id;
  elsif tg_op = 'DELETE' then
    update public.artists set thumbs_count = greatest(thumbs_count - 1, 0) where id = old.artist_id;
  end if;
  return null;
end $$;

update public.artist_videos v set
  likes_count  = (select count(*) from public.video_likes  l where l.video_id = v.id),
  thumbs_count = (select count(*) from public.video_thumbs t where t.video_id = v.id),
  views_count  = (select count(*) from public.video_views  w where w.video_id = v.id);

update public.artists a set
  likes_count  = (select count(*) from public.artist_likes  l where l.artist_id = a.id),
  thumbs_count = (select count(*) from public.artist_thumbs t where t.artist_id = a.id);
