"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { hasContactInfo, resolvePhone } from "@/lib/validate";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}

// Shared post fields from the editor form (used by create + update).
function postFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    category: String(formData.get("category") ?? "Guides").trim() || "Guides",
    body: String(formData.get("body") ?? "").trim() || null,
    read_mins: Number(formData.get("read_mins")) || 4,
    published: formData.get("published") === "on",
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
  };
}

// Unique slug: use the admin-provided one (or derive from title), then suffix if taken.
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  desired: string,
  fallbackTitle: string,
  ignoreId?: string,
): Promise<string> {
  const base = slugify(desired) || slugify(fallbackTitle) || "post";
  let q = supabase.from("posts").select("id").eq("slug", base);
  if (ignoreId) q = q.neq("id", ignoreId);
  const { data: clash } = await q.maybeSingle();
  return clash ? `${base}-${crypto.randomUUID().slice(0, 4)}` : base;
}

export async function toggleArtist(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const publish = formData.get("publish") === "true";
  await supabase.from("artists").update({ is_published: publish }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/artists");
  redirect("/admin?saved=artist");
}

export async function deleteArtist(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("artists").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
  revalidatePath("/artists");
  redirect("/admin?saved=deleted");
}

function list(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Full moderation edit of any creator's listing — including the description.
// The same rules the creator is held to apply here: UAE-only numbers, and no
// contact details in public copy (an admin shouldn't be able to launder them in).
export async function adminUpdateArtist(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const back = `/admin/artists/${id}/edit`;

  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
  if (!id || !name) redirect(`${back}?error=missing`);

  // Same grandfathering as the creator's own editor — an admin cleaning up a
  // legacy listing shouldn't be blocked by a number that predates the rule.
  const { data: currentContact } = await supabase
    .from("artist_contacts")
    .select("phone, whatsapp")
    .eq("artist_id", id)
    .maybeSingle();

  const phoneResult = resolvePhone(phoneRaw, currentContact?.phone ?? null);
  const whatsappResult = resolvePhone(whatsappRaw, currentContact?.whatsapp ?? null);
  if (phoneResult.invalid || whatsappResult.invalid) redirect(`${back}?error=phone`);
  const phone = phoneResult.value;
  const whatsapp = whatsappResult.value;

  if (hasContactInfo(name, tagline, bio, String(formData.get("tags") ?? ""), String(formData.get("skills") ?? ""))) {
    redirect(`${back}?error=leak`);
  }

  const { error } = await supabase
    .from("artists")
    .update({
      name,
      tagline: tagline || null,
      bio: bio || null,
      category_slug: String(formData.get("category_slug") ?? ""),
      city: String(formData.get("city") ?? "").trim(),
      subcategory: String(formData.get("subcategory") ?? "").trim() || null,
      availability: String(formData.get("availability") ?? "Available now"),
      languages: list(formData.get("languages")),
      genres: list(formData.get("genres")),
      skills: list(formData.get("skills")),
      tags: list(formData.get("tags")),
      gender: String(formData.get("gender") ?? "").trim() || null,
      nationality: String(formData.get("nationality") ?? "").trim() || null,
      price_min: Number(formData.get("price_min")) || null,
      price_max: Number(formData.get("price_max")) || null,
      experience_years: Number(formData.get("experience_years")) || null,
      is_published: formData.get("is_published") === "on",
    })
    .eq("id", id);
  if (error) redirect(`${back}?error=save`);

  await supabase.from("artist_contacts").upsert({
    artist_id: id,
    phone,
    whatsapp,
    email: String(formData.get("email") ?? "").trim() || null,
  });

  revalidatePath("/admin");
  revalidatePath("/artists");
  redirect("/admin?saved=artist");
}

// Edit a user's own record: display name and role.
export async function adminUpdateUser(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !["hirer", "artist", "admin"].includes(role)) redirect("/admin?error=user");
  // Don't let an admin demote themselves out of the panel they're standing in.
  if (userId === user.id && role !== "admin") redirect("/admin?error=self");

  await supabase
    .from("profiles")
    .update({ full_name: String(formData.get("full_name") ?? "").trim() || null, role })
    .eq("id", userId);

  revalidatePath("/admin");
  redirect("/admin?saved=user");
}

// Remove everything a user authored. Deleting their artists cascades that
// artist's contacts, videos, photos and enquiries (see v24 for the policies).
async function wipeUserContent(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  userId: string,
) {
  await supabase.from("artists").delete().eq("owner_id", userId);
  await supabase.from("artist_reviews").delete().eq("user_id", userId);
  await supabase.from("bookings").delete().eq("user_id", userId);
}

export async function deleteUserContent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) redirect("/admin?error=user");

  await wipeUserContent(supabase, userId);
  revalidatePath("/admin");
  revalidatePath("/artists");
  redirect("/admin?saved=wiped");
}

export async function deleteUser(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  // Never let an admin delete themselves — that is a one-click lockout.
  if (!userId || userId === user.id) redirect("/admin?error=self");

  await wipeUserContent(supabase, userId);
  await supabase.from("profiles").delete().eq("id", userId);
  revalidatePath("/admin");
  revalidatePath("/artists");
  // The auth.users row survives — removing it needs the service-role key.
  redirect("/admin?saved=user");
}

export async function deleteMessage(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("contact_messages").delete().eq("id", String(formData.get("id")));
  // Redirect, don't just revalidate — without it the row stays on screen after a
  // successful delete and the button reads as broken.
  revalidatePath("/admin");
  redirect("/admin?saved=message");
}

export async function createPost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = postFields(formData);
  if (!fields.title) redirect("/admin/posts/new?error=title");

  const slug = await uniqueSlug(supabase, String(formData.get("slug") ?? ""), fields.title);
  const { error } = await supabase.from("posts").insert({ slug, ...fields });
  if (error) redirect(`/admin/posts/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin?saved=post");
}

export async function updatePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const fields = postFields(formData);
  if (!id || !fields.title) redirect(`/admin/posts/${id}/edit?error=title`);

  const slug = await uniqueSlug(supabase, String(formData.get("slug") ?? ""), fields.title, id);
  const { error } = await supabase.from("posts").update({ slug, ...fields }).eq("id", id);
  if (error) redirect(`/admin/posts/${id}/edit?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin?saved=post");
}

// Publish / unpublish from the admin list (draft <-> live).
export async function togglePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("posts")
    .update({ published: formData.get("publish") === "true" })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin?saved=post");
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin?saved=deleted");
}
