"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
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
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const base = slugify(title) || "post";
  const { data: existing } = await supabase.from("posts").select("slug").eq("slug", base).maybeSingle();
  const slug = existing ? `${base}-${crypto.randomUUID().slice(0, 4)}` : base;

  await supabase.from("posts").insert({
    slug,
    title,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    category: String(formData.get("category") ?? "Guides").trim() || "Guides",
    body: String(formData.get("body") ?? "").trim() || null,
    read_mins: Number(formData.get("read_mins")) || 4,
    published: true,
  });

  revalidatePath("/admin");
  revalidatePath("/blog");
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
  revalidatePath("/blog");
}
