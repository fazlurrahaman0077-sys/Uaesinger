-- v24: admin moderation — delete spam contact messages, wipe a user's data, and
-- keep the signup email on the profile so the admin user list can show it
-- (auth.users is unreadable from the app's anon/authenticated client).

-- ---------------------------------------------------------------- profile email
alter table public.profiles add column if not exists email text;

update public.profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id and p.email is distinct from u.email;

-- Store it on every future signup too.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- RLS is unchanged: profiles is readable only by its owner (profiles_select_own)
-- or an admin (profiles_admin_select), so email is never public.

-- ---------------------------------------------------------------- moderation
-- Spam: the contact form is open to the world, so admins need a way to clear it.
drop policy if exists "contact_admin_delete" on public.contact_messages;
create policy "contact_admin_delete" on public.contact_messages
  for delete using (public.is_admin());

-- A user's own rows. Admin already has ALL on artists (artists_admin_all), and
-- deleting an artist cascades its contacts/videos/photos/bookings.
drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

drop policy if exists "reviews_admin_delete" on public.artist_reviews;
create policy "reviews_admin_delete" on public.artist_reviews
  for delete using (public.is_admin());

drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete" on public.bookings
  for delete using (public.is_admin());
