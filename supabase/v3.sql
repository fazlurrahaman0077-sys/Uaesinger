-- ============================================================================
-- UAESinger v3 — close the booking loop. Run in Supabase → SQL Editor
-- (after schema.sql + v2.sql).
--
-- Today: hirers can INSERT/SELECT their own bookings, but the artist the
-- enquiry is for can neither see it nor act on it. This adds a hirer-contact
-- snapshot and the artist-owner read/update policies so the enquiry inbox works.
-- ============================================================================

-- 1. Snapshot the hirer's contact on the booking so the creator can act on it
--    without a reciprocal unlock.
alter table public.bookings add column if not exists hirer_name  text;
alter table public.bookings add column if not exists hirer_phone text;

-- 2. Artist owners can read enquiries sent to artists they own.
drop policy if exists "bookings_select_owner" on public.bookings;
create policy "bookings_select_owner"
  on public.bookings for select
  using (
    exists (
      select 1 from public.artists a
      where a.id = bookings.artist_id and a.owner_id = auth.uid()
    )
  );

-- 3. Artist owners can update the status of those enquiries.
drop policy if exists "bookings_update_owner" on public.bookings;
create policy "bookings_update_owner"
  on public.bookings for update
  using (
    exists (
      select 1 from public.artists a
      where a.id = bookings.artist_id and a.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.artists a
      where a.id = bookings.artist_id and a.owner_id = auth.uid()
    )
  );
