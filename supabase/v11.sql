-- ============================================================================
-- UAESinger v11 — LOCK DOWN payments. Run this ONLY AFTER setting
-- SUPABASE_SERVICE_ROLE_KEY in the app environment.
--
-- Until now, dev RLS policies let any signed-in user insert an active
-- subscription or flip a payment to 'completed' straight through the anon API —
-- i.e. grant themselves a paid plan for free. The confirm route now activates
-- subscriptions with the service-role key (bypasses RLS, not client-callable),
-- so these client-facing write policies are no longer needed and must go.
-- ============================================================================

-- Remove the free-subscription hole.
drop policy if exists "subscriptions_insert_own_dev" on public.subscriptions;
drop policy if exists "own subscriptions - insert (dev)" on public.subscriptions;

-- Stop users from marking their own payment 'completed'. Reads stay allowed.
drop policy if exists "payments_insert_own" on public.payments;   -- created by the server only
drop policy if exists "payments_update_own" on public.payments;

-- Re-add a minimal insert policy so subscribe() can still record a PENDING
-- payment under the user session (status is checked server-side before activation).
create policy "payments_insert_pending_own"
  on public.payments for insert
  with check (auth.uid() = user_id and status = 'pending');

-- Close the quota-bypass: contact unlocks are now written by the service-role
-- client (revealContact enforces the plan credit limit first). Reads stay open.
drop policy if exists "unlocks_insert_own" on public.contact_unlocks;
