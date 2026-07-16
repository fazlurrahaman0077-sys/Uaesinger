"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdmin } from "@/lib/supabase/admin";
import { getAccess } from "@/lib/subscription";
import { FREE_MODE } from "@/lib/plans";

// Spend one contact credit to unlock this artist (idempotent per artist).
// The quota is enforced here; the write uses the service-role client so a client
// can't insert unlocks directly to bypass the credit limit (once v11 removes the
// user-facing insert policy). Falls back to the user session until the key is set.
export async function revealContact(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const artistId = String(formData.get("artistId") ?? "");

  const { user, plan, quota, unlocksUsed } = await getAccess();
  if (!user) redirect(`/signin?next=/artists/${slug}`);
  // FREE_MODE: any signed-in user reveals for free, unlimited. Otherwise a plan
  // with remaining credits is required.
  if (!FREE_MODE && !plan) redirect("/pricing");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("contact_unlocks")
    .select("id")
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .maybeSingle();

  if (!existing) {
    if (!FREE_MODE && quota !== null && unlocksUsed >= quota) {
      redirect(`/artists/${slug}?limit=1`);
    }
    const writer = hasAdmin() ? createAdminClient() : supabase;
    await writer.from("contact_unlocks").insert({ user_id: user.id, artist_id: artistId });
  }

  revalidatePath(`/artists/${slug}`);
  redirect(`/artists/${slug}`);
}

// Send a booking enquiry to the artist. Lands in the creator's dashboard inbox.
// Send a booking enquiry. Returns a result (no redirect / no page revalidation)
// so the client can show success inline — no heavy profile re-render, instant.
export async function requestBooking(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const artistId = String(formData.get("artistId") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to send an enquiry." };

  const { error } = await supabase.from("bookings").insert({
    artist_id: artistId,
    user_id: user.id,
    event_date: String(formData.get("event_date") ?? "").trim() || null,
    message: String(formData.get("message") ?? "").trim() || null,
    hirer_name: String(formData.get("hirer_name") ?? "").trim() || null,
    hirer_phone: String(formData.get("hirer_phone") ?? "").trim() || null,
  });
  if (error) return { ok: false, error: "Couldn't send — please try again." };
  return { ok: true };
}

// Write (or rewrite) a review. One per user per artist — upsert on that unique
// pair so editing works without a separate update path. RLS blocks reviewing an
// artist you own; the artists.rating/reviews columns are kept by the v22 trigger.
export async function submitReview(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const artistId = String(formData.get("artistId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: "Pick a rating from 1 to 5 stars." };
  if (body.length === 0) return { ok: false, error: "Please write a few words about your experience." };
  if (body.length > 2000) return { ok: false, error: "Review is too long (2000 characters max)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to leave a review." };

  // Say plainly why, rather than inferring it from an error code — 42501 covers
  // every privilege failure, not just this one. RLS is still the real guard.
  const { data: owned } = await supabase
    .from("artists")
    .select("id")
    .eq("id", artistId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (owned) return { ok: false, error: "You can't review your own profile." };

  // Identity comes from the session, never the form — a typed name is spoofable,
  // and full_name isn't unique (two live accounts are both "Micah"). The email is
  // the identity; full_name is only a display label.
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const displayName = profile?.full_name?.trim() || (user.email ?? "").split("@")[0] || "Anonymous";
  const row = { author_name: displayName, author_email: user.email, rating, body };

  // Deliberately not .upsert(): it sends Prefer: resolution=merge-duplicates, and
  // PostgREST then builds ON CONFLICT DO UPDATE SET author_email = excluded.author_email.
  // Reading EXCLUDED needs SELECT on author_email, which v23 revokes to keep the
  // email private — so the upsert dies with 42501. Insert, then update on conflict:
  // the update writes literals and never reads the revoked column.
  const { error: insertError } = await supabase
    .from("artist_reviews")
    .insert({ artist_id: artistId, user_id: user.id, ...row });

  if (insertError) {
    if (insertError.code !== "23505") return { ok: false, error: "Couldn't post your review — please try again." };
    // Already reviewed this artist — treat a second submit as an edit.
    const { error: updateError } = await supabase
      .from("artist_reviews")
      .update(row)
      .eq("user_id", user.id)
      .eq("artist_id", artistId);
    if (updateError) return { ok: false, error: "Couldn't update your review — please try again." };
  }

  revalidatePath(`/artists/${slug}`);
  return { ok: true };
}
