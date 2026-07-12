"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addVideo } from "@/app/dashboard/video-actions";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB — matches the bucket limit.

export default function VideoUploader({ artistId, userId }: { artistId: string; userId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    if (!file) return setError("Choose a video file.");
    if (!file.type.startsWith("video/")) return setError("That's not a video file.");
    if (file.size > MAX_BYTES) return setError("Video is over the 100 MB limit.");

    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${userId}/${artistId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("creator-videos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const fd = new FormData();
      fd.set("artistId", artistId);
      fd.set("storagePath", path);
      fd.set("title", title);
      await addVideo(fd); // server action revalidates + redirects
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5 bg-[var(--bg2)] border border-dashed border-[var(--line)] rounded-xl p-4">
      <input
        name="title"
        placeholder="Video title (optional)"
        className="px-3 py-2 rounded-lg border border-[var(--line)] text-[13px] bg-white outline-none focus:border-[var(--blue)]"
      />
      <input
        name="file"
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="text-[12.5px] text-[var(--ink-dim)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--blue-soft)] file:text-[var(--blue-dark)] file:font-semibold file:text-[12px]"
      />
      {error && <p className="text-[12px] text-[var(--coral)] font-medium">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="py-2 rounded-lg bg-[var(--blue)] text-white text-[13px] font-semibold hover:bg-[var(--blue-dark)] transition-all disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Upload video"}
      </button>
      <p className="text-[11px] text-[var(--ink-faint)]">MP4, WebM or MOV · up to 100 MB.</p>
    </form>
  );
}
