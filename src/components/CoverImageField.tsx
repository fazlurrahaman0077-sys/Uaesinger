"use client";

import { useState } from "react";
import { uploadImageToCloudinary, cloudinaryConfigured } from "@/lib/cloudinary";

// Blog cover image picker: uploads to Cloudinary on select, keeps the CDN url in
// a hidden input so it submits with the post form. Also usable for inline images
// (the returned url can be pasted into the body HTML as <img src=...>).
export default function CoverImageField({ defaultUrl }: { defaultUrl?: string | null }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!cloudinaryConfigured()) return setError("Image uploads aren't set up — add Cloudinary keys.");
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setError("Image is over 10 MB.");
    setBusy(true);
    try {
      setUrl(await uploadImageToCloudinary(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">Cover image</span>
      <input type="hidden" name="cover_url" value={url} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Cover preview" className="w-full max-w-[360px] aspect-[16/9] object-cover rounded-lg border border-[var(--line)] mb-1" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onPick}
        disabled={busy}
        className="text-[12.5px] text-[var(--ink-dim)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--blue-soft)] file:text-[var(--blue-dark)] file:font-semibold file:text-[12px]"
      />
      {busy && <span className="text-[11px] text-[var(--blue-dark)] font-semibold">Uploading…</span>}
      {error && <span className="text-[11px] text-[var(--coral)] font-medium">{error}</span>}
      {url && (
        <span className="text-[11px] text-[var(--ink-faint)] break-all">
          Paste into the body to place inline: <code>&lt;img src=&quot;{url}&quot; /&gt;</code>
        </span>
      )}
    </label>
  );
}
