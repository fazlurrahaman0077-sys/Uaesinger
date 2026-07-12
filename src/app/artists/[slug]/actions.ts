"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdmin } from "@/lib/supabase/admin";
import { getAccess } from "@/lib/subscription";

// Spend one contact credit to unlock this artist (idempotent per artist).
// The quota is enforced here; the write uses the service-role client so a client
// can't insert unlocks directly to bypass the credit limit (once v11 removes the
// user-facing insert policy). Falls back to the user session until the key is set.
export async function revealContact(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const artistId = String(formData.get("artistId") ?? "");

  const { user, plan, quota, unlocksUsed } = await getAccess();
  if (!user) redirect(`/signin?next=/artists/${slug}`);
  if (!plan) redirect("/pricing");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("contact_unlocks")
    .select("id")
    .eq("user_id", user.id)
    .eq("artist_id", artistId)
    .maybeSingle();

  if (!existing) {
    if (quota !== null && unlocksUsed >= quota) {
      redirect(`/artists/${slug}?limit=1`);
    }
    const writer = hasAdmin() ? createAdminClient() : supabase;
    await writer.from("contact_unlocks").insert({ user_id: user.id, artist_id: artistId });
  }

  revalidatePath(`/artists/${slug}`);
  redirect(`/artists/${slug}`);
}

// Send a booking enquiry to the artist. Lands in the creator's dashboard inbox.
export async function requestBooking(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const artistId = String(formData.get("artistId") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?next=/artists/${slug}`);

  await supabase.from("bookings").insert({
    artist_id: artistId,
    user_id: user.id,
    event_date: String(formData.get("event_date") ?? "").trim() || null,
    message: String(formData.get("message") ?? "").trim() || null,
    hirer_name: String(formData.get("hirer_name") ?? "").trim() || null,
    hirer_phone: String(formData.get("hirer_phone") ?? "").trim() || null,
  });

  revalidatePath(`/artists/${slug}`);
  redirect(`/artists/${slug}?enquiry=sent`);
}
