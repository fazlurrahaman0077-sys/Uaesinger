"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES } from "@/lib/bookings";
import { hasContactInfo, resolvePhone } from "@/lib/validate";

function list(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/dashboard");
  return { supabase, user };
}

// Anyone: edit their own account details. profiles_update_own scopes the write
// to the caller's row, and role is deliberately not editable here — only an
// admin can change that.
export async function updateMyProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (hasContactInfo(fullName)) redirect("/dashboard?error=leak");

  await supabase.from("profiles").update({ full_name: fullName || null }).eq("id", user.id);
  revalidatePath("/dashboard");
  redirect("/dashboard?saved=profile");
}

// Creator: update the status of an incoming enquiry. RLS (bookings_update_owner)
// ensures only the owning artist can write.
export async function updateBookingStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!BOOKING_STATUSES.includes(status as never)) redirect("/dashboard");

  await supabase.from("bookings").update({ status }).eq("id", id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// Creator: share their contact card with a hirer who enquired. Runs as the
// creator, so we can read our own artist_contacts and snapshot it onto the
// booking (RLS: bookings_update_owner). The hirer then reads it off their own
// booking row — no phone is ever exposed publicly.
export async function shareCard(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const artistId = String(formData.get("artistId") ?? "");
  if (!id || !artistId) redirect("/dashboard");

  const { data: c } = await supabase
    .from("artist_contacts")
    .select("phone, whatsapp, email")
    .eq("artist_id", artistId)
    .maybeSingle();

  await supabase
    .from("bookings")
    .update({ shared_card: c ?? {}, status: "contacted" })
    .eq("id", id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// Creator: delete a listing they own. RLS (artists_owner_all) enforces ownership;
// artist_contacts / videos / photos / bookings cascade on delete.
export async function deleteListing(formData: FormData) {
  const { supabase } = await requireUser();
  const artistId = String(formData.get("artistId") ?? "");
  if (!artistId) redirect("/dashboard");
  await supabase.from("artists").delete().eq("id", artistId);
  revalidatePath("/dashboard");
  revalidatePath("/artists");
  redirect("/dashboard");
}

// Creator: edit the listing + gated contact for an artist they own. RLS
// (artists_owner_all / artist_contacts_owner_write) enforces ownership.
export async function updateListing(formData: FormData) {
  const { supabase } = await requireUser();
  const artistId = String(formData.get("artistId") ?? "");
  const tagline = String(formData.get("tagline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();

  // UAE numbers only — but a number saved before that rule must not block the
  // owner from editing the rest of their listing, so only a real change is
  // validated (see resolvePhone).
  const { data: current } = await supabase
    .from("artist_contacts")
    .select("phone, whatsapp")
    .eq("artist_id", artistId)
    .maybeSingle();

  const phoneResult = resolvePhone(phoneRaw, current?.phone ?? null);
  const whatsappResult = resolvePhone(whatsappRaw, current?.whatsapp ?? null);
  if (phoneResult.invalid || whatsappResult.invalid) {
    redirect("/dashboard?error=phone");
  }
  const phone = phoneResult.value;
  const whatsapp = whatsappResult.value;

  // Contact details are the paid product — they must not leak into public copy.
  if (hasContactInfo(tagline, bio, String(formData.get("genres") ?? ""), String(formData.get("languages") ?? ""))) {
    redirect("/dashboard?error=leak");
  }

  await supabase
    .from("artists")
    .update({
      tagline: tagline || null,
      bio: bio || null,
      languages: list(formData.get("languages")),
      genres: list(formData.get("genres")),
      availability: String(formData.get("availability") ?? "Available now"),
      price_min: Number(formData.get("price_min")) || null,
      price_max: Number(formData.get("price_max")) || null,
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", artistId);

  // Upsert gated contact (row may not exist for older listings).
  await supabase.from("artist_contacts").upsert({
    artist_id: artistId,
    phone,
    whatsapp,
    email: String(formData.get("email") ?? "").trim() || null,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?saved=1");
}
