"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES } from "@/lib/bookings";

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

// Creator: edit the listing + gated contact for an artist they own. RLS
// (artists_owner_all / artist_contacts_owner_write) enforces ownership.
export async function updateListing(formData: FormData) {
  const { supabase } = await requireUser();
  const artistId = String(formData.get("artistId") ?? "");

  await supabase
    .from("artists")
    .update({
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
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
    phone: String(formData.get("phone") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?saved=1");
}
