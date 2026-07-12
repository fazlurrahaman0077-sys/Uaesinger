"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

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
}

export async function deleteArtist(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("artists").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
  revalidatePath("/artists");
}

export async function createPost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = postFields(formData);
  if (!fields.title) redirect("/admin/posts/new?error=title");

  const slug = await uniqueSlug(supabase, String(formData.get("slug") ?? ""), fields.title);
  await supabase.from("posts").insert({ slug, ...fields });

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
  await supabase.from("posts").update({ slug, ...fields }).eq("id", id);

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
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
  revalidatePath("/blog");
}
