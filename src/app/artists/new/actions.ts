"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/artists";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function list(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createArtist(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/artists/new");

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "").trim();

  // Trust-boundary validation.
  if (!name || !city || !CATEGORIES.some((c) => c.slug === category)) {
    redirect("/artists/new?error=missing");
  }

  const base = slugify(name) || "artist";
  const { data: existing } = await supabase.from("artists").select("slug").eq("slug", base).maybeSingle();
  const slug = existing ? `${base}-${crypto.randomUUID().slice(0, 4)}` : base;

  const { error: aErr } = await supabase.from("artists").insert({
    slug,
    name,
    category_slug: category,
    owner_id: user.id,
    city,
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    languages: list(formData.get("languages")),
    genres: list(formData.get("genres")),
    availability: String(formData.get("availability") ?? "Available now"),
    price_min: Number(formData.get("price_min")) || null,
    price_max: Number(formData.get("price_max")) || null,
    rating: 0,
    reviews: 0,
    gigs: 0,
    response_rate: 100,
    featured_tag: "New this month",
    is_published: true,
  });
  if (aErr) redirect("/artists/new?error=save");

  // Fetch the new id, then store gated contact details.
  const { data: created } = await supabase.from("artists").select("id").eq("slug", slug).maybeSingle();
  if (created) {
    await supabase.from("artist_contacts").insert({
      artist_id: created.id,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    });
  }

  // Mark the account as an artist.
  await supabase.from("profiles").update({ role: "artist" }).eq("id", user.id);

  redirect(`/artists/${slug}`);
}
