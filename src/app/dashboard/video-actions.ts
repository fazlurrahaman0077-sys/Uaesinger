"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Record a video the client just uploaded to storage. RLS (artist_videos_owner_write
// + the storage insert policy) guarantees the caller owns the artist and the file.
export async function addVideo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/dashboard");

  const artistId = String(formData.get("artistId") ?? "");
  const storagePath = String(formData.get("storagePath") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  if (!artistId || !storagePath) redirect("/dashboard");

  await supabase.from("artist_videos").insert({
    artist_id: artistId,
    owner_id: user.id,
    storage_path: storagePath,
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
