# UAESinger — Hirer & Creator platform (logged-in experience)

Date: 2026-07-12

## Goal
Close the two-sided loop. The public site, paywall/unlock, auth, blog, admin, and
pricing are already real and DB-backed — leave them. Add the authenticated home
base for both sides and make the booking enquiry loop work end to end, enforced by
RLS (no mocks).

## Scope decisions
- **"Content creator" = the existing performers** (singers, DJs, dancers, etc.).
  No new user type; flesh out their dashboard.
- **Communication = enquiry inbox** (one enquiry each way + status), not realtime chat.
- Keep the dev-stub subscription (already flagged for Stripe swap). No new payments.

## Current gap
- `bookings` table exists but **nothing in the UI writes to it** — the profile's
  "Request booking" button is a dead no-op.
- Artists have **no RLS to read** bookings sent to them → enquiries are invisible.
- Neither side has a dashboard: hirers can't see their unlocks/enquiries; creators
  can't edit their listing or see incoming enquiries.

## Changes

### 1. DB migration — `supabase/v3.sql` (run in Supabase SQL Editor)
- Add `hirer_name`, `hirer_phone` to `bookings` (snapshot so the creator can act).
- RLS: artist owner can `SELECT` and `UPDATE` bookings for artists they own.
  (Today only `bookings_insert_own` + `bookings_select_own` exist.)
- No new tables.

### 2. Booking form (hirer → creator)
- Replace the dead "Request booking" button on `/artists/[slug]` with a real form
  → server action `requestBooking` inserting a `bookings` row (event_date, message,
  hirer_name, hirer_phone). Signed-in only; unauth users routed to sign in.

### 3. `/dashboard` — role-aware, single route
Reads `profiles.role` + `getAccess()`.
- **Hirer view:** current plan + credits remaining; unlocked artists with their
  contact details; "My enquiries" list with live status.
- **Creator (artist) view:** edit listing (tagline, bio, price, languages, genres,
  availability, publish toggle) + edit gated contact; **enquiry inbox** with
  hirer name/phone/date/message and a status dropdown (`requestBooking` sibling
  action `updateBookingStatus`).
- Admins get a link through to `/admin` (unchanged).

### 4. `lib/bookings.ts`
Small query helpers: `listMyEnquiries()` (hirer), `listIncomingEnquiries()`
(creator, across owned artists), matching the `lib/talent.ts` style.

### 5. Nav
`Header`: signed-in users get a **Dashboard** link.

## Not doing (YAGNI)
Threaded/realtime chat, influencer vertical, Stripe, review writing.

## Verification
- `npm run build` compiles.
- Drive the loop against live Supabase: hirer sends enquiry from a profile →
  appears in creator's inbox → creator changes status → hirer sees new status.
