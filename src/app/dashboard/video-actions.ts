"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MAX_VIDEOS } from "@/lib/artists";
import { hasContactInfo } from "@/lib/validate";

// Record a video the client just uploaded to storage. RLS (artist_videos_owner_write
// + the storage insert policy) guarantees the caller owns the artist and the file.
export async function addVideo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/dashboard");

  const artistId = String(formData.get("artistId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  // Only accept our own Cloudinary CDN urls (never a creator's external link).
  if (!artistId || !url || !url.includes("res.cloudinary.com")) redirect("/dashboard");
  // A video title is public copy too — no smuggling a handle into it.
  if (hasContactInfo(title)) redirect("/dashboard?error=leak");

  // Enforce the per-creator video cap so profiles stay light (owner-scoped by RLS).
  const { count } = await supabase
    .from("artist_videos")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artistId);
  if ((count ?? 0) >= MAX_VIDEOS) redirect("/dashboard");

  await supabase.from("artist_videos").insert({
    artist_id: artistId,
    owner_id: user.id,
    url,
    title,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function removeVideo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/dashboard");

  const id = String(formData.get("id") ?? "");
  const storagePath = String(formData.get("storagePath") ?? "");

  // Remove the DB row (RLS-scoped to the owner) then the storage object.
  await supabase.from("artist_videos").delete().eq("id", id);
  if (storagePath) await supabase.storage.from("creator-videos").remove([storagePath]);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
