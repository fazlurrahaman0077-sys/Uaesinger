-- v25: replace the content-guessing spam filter with a server-enforced rate
-- limit, and give admins real edit rights (not just delete) on user data.

-- ---------------------------------------------------------------- rate limit
alter table public.contact_messages add column if not exists ip_hash text;
create index if not exists contact_messages_ip_recent_idx
  on public.contact_messages (ip_hash, created_at desc);

-- The only write path into contact_messages. Runs as definer so the limit is
-- enforced server-side and atomically — a client cannot read the table to count
-- its own submissions, and cannot bypass the check by calling insert directly
-- (the open insert policy is dropped below).
create or replace function public.submit_contact_message(
  p_name text, p_email text, p_subject text, p_message text, p_ip_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
begin
  if p_name = '' or p_email = '' or p_message = '' then
    return false;
  end if;

  select count(*) into recent
    from public.contact_messages
   where ip_hash = p_ip_hash
     and created_at > now() - interval '1 hour';

  -- Three messages an hour is generous for a human, useless for a bot.
  if recent >= 3 then
    return false;
  end if;

  insert into public.contact_messages (name, email, subject, message, ip_hash)
  values (left(p_name, 120), left(p_email, 200), left(p_subject, 200), left(p_message, 4000), p_ip_hash);
  return true;
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text, text) to anon, authenticated;

-- Close the open door: the function is now the only way in.
drop policy if exists "contact_insert_any" on public.contact_messages;

-- ---------------------------------------------------------------- admin edit
-- Admins moderate user-supplied copy (bios, taglines, video titles) rather than
-- only deleting it. artists already has artists_admin_all.
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contacts_admin_all" on public.artist_contacts;
create policy "contacts_admin_all" on public.artist_contacts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "videos_admin_all" on public.artist_videos;
create policy "videos_admin_all" on public.artist_videos
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "photos_admin_all" on public.artist_photos;
create policy "photos_admin_all" on public.artist_photos
  for all using (public.is_admin()) with check (public.is_admin());
