-- ============================================================================
-- UAESinger v21 — per-video likes (thumbs up). Mirrors artist_likes (v18).
-- Run after v20.sql.
-- ============================================================================
create table if not exists public.video_likes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  video_id   uuid not null references public.artist_videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists video_likes_video_idx on public.video_likes(video_id);

alter table public.video_likes enable row level security;
create policy "video_likes_select_own" on public.video_likes for select using (auth.uid() = user_id);
create policy "video_likes_insert_own" on public.video_likes for insert with check (auth.uid() = user_id);
create policy "video_likes_delete_own" on public.video_likes for delete using (auth.uid() = user_id);

alter table public.artist_videos add column if not exists likes_count int not null default 0;

create or replace function public.bump_video_likes() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.artist_videos set likes_count = likes_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.artist_videos set likes_count = greatest(likes_count - 1, 0) where id = old.video_id;
  end if;
  return null;
end $$;

drop trigger if exists video_likes_count on public.video_likes;
create trigger video_likes_count after insert or delete on public.video_likes
  for each row execute function public.bump_video_likes();
