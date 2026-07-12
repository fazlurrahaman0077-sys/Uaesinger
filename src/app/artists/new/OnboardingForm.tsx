"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, EMIRATES, categoryLabel, priceRange, initials } from "@/lib/artists";
import { createArtist } from "./actions";

const AVAILABILITY = ["Available now", "Booking 2 weeks out", "Limited dates"];

type Vid = { file: File; title: string; preview: string };

export default function OnboardingForm({ userId }: { userId: string }) {
  const [f, setF] = useState({
    name: "",
    category: "",
    city: "",
    tagline: "",
    bio: "",
    languages: "",
    genres: "",
    availability: "Available now",
    price_min: "",
    price_max: "",
    phone: "",
    whatsapp: "",
    email: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [videos, setVideos] = useState<Vid[]>([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emoji = CATEGORIES.find((c) => c.slug === f.category)?.emoji ?? "🎤";
  const price = priceRange(Number(f.price_min) || null, Number(f.price_max) || null);
  const cover = photos[0] ?? null;

  function pickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((x) => x.type.startsWith("image/"));
    setPhotos((p) => [...p, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    e.target.value = "";
  }
  function pickVideos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((x) => x.type.startsWith("video/"));
    setVideos((p) => [...p, ...files.map((file) => ({ file, title: file.name.replace(/\.[^.]+$/, ""), preview: URL.createObjectURL(file) }))]);
    e.target.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.name.trim() || !f.city || !f.category) return setError("Add your name, category and city to continue.");

    setBusy(true);
    try {
      const supabase = createClient();
      const photoPaths: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        setStep(photos.length > 1 ? `Uploading photo ${i + 1} of ${photos.length}…` : "Uploading photo…");
        const ph = photos[i];
        const ext = ph.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: pErr } = await supabase.storage.from("creator-photos").upload(path, ph.file, { contentType: ph.file.type });
        if (pErr) throw pErr;
        photoPaths.push(path);
      }
      const photoPath = photoPaths[0] ?? ""; // first = cover

      const vidMeta: { path: string; title: string }[] = [];
      for (let i = 0; i < videos.length; i++) {
        setStep(`Uploading video ${i + 1} of ${videos.length}…`);
        const v = videos[i];
        const ext = v.file.name.split(".").pop()?.toLowerCase() || "mp4";
        const path = `${userId}/onboarding/${crypto.randomUUID()}.${ext}`;
        const { error: vErr } = await supabase.storage.from("creator-videos").upload(path, v.file, { contentType: v.file.type });
        if (vErr) throw vErr;
        vidMeta.push({ path, title: v.title });
      }

      setStep("Publishing your profile…");
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.set(k, v));
      fd.set("photo_path", photoPath);
      fd.set("photos", JSON.stringify(photoPaths.slice(1))); // gallery (cover excluded)
      fd.set("videos", JSON.stringify(vidMeta));
      await createArtist(fd); // redirects to the new profile
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
      setStep("");
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
      {/* ---- Form ---- */}
      <form onSubmit={onSubmit} className="order-2 lg:order-1 flex flex-col gap-6">
        <Section eyebrow="01" title="Your photos" hint="Add a few great shots — the first is your cover. Skip it and we'll use a stage image for your category.">
          <div className="flex flex-wrap gap-3">
            {photos.map((ph, i) => (
              <span key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[var(--line)] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.preview} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute bottom-0 inset-x-0 text-[9px] font-bold text-center text-white bg-[var(--blue)]/85 py-0.5">COVER</span>}
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/55 text-white text-[11px] leading-none">✕</button>
              </span>
            ))}
            <label className="w-20 h-20 rounded-2xl border border-dashed border-[var(--blue-mid)] bg-[var(--blue-soft)] flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-[var(--blue)] transition-colors">
              <span className="text-[20px]">📷</span>
              <span className="text-[10px] font-semibold text-[var(--blue-dark)]">Add</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickPhotos} className="hidden" />
            </label>
          </div>
        </Section>

        <Section eyebrow="02" title="The basics">
          <Field label="Stage / act name" required>
            <input value={f.name} onChange={set("name")} placeholder="e.g. Layla Hassan" className={input} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category" required>
              <select value={f.category} onChange={set("category")} className={input}>
                <option value="" disabled>Select…</option>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.label}</option>)}
              </select>
            </Field>
            <Field label="Based in" required>
              <select value={f.city} onChange={set("city")} className={input}>
                <option value="" disabled>Select…</option>
                {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
          </div>
          <Field label="One-line tagline">
            <input value={f.tagline} onChange={set("tagline")} placeholder="Wedding & jazz vocalist" className={input} />
          </Field>
          <Field label="About you">
            <textarea value={f.bio} onChange={set("bio")} rows={4} placeholder="Your experience, style, and what makes your set unforgettable." className={`${input} resize-y`} />
          </Field>
        </Section>

        <Section eyebrow="03" title="Your craft">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Languages" hint="Comma separated">
              <input value={f.languages} onChange={set("languages")} placeholder="English, Arabic" className={input} />
            </Field>
            <Field label="Styles / genres" hint="Comma separated">
              <input value={f.genres} onChange={set("genres")} placeholder="Jazz, Arabic, Pop" className={input} />
            </Field>
          </div>
          <Field label="Availability">
            <select value={f.availability} onChange={set("availability")} className={input}>
              {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Price range" hint="AED — shown on your profile">
            <div className="grid grid-cols-2 gap-4">
              <input value={f.price_min} onChange={set("price_min")} type="number" placeholder="From 3000" className={input} />
              <input value={f.price_max} onChange={set("price_max")} type="number" placeholder="To 6000" className={input} />
            </div>
          </Field>
        </Section>

        <Section eyebrow="04" title="Show your work" hint="Upload performance clips — the fastest way to get booked.">
          <label className="flex flex-col items-center justify-center gap-1.5 py-7 rounded-xl border border-dashed border-[var(--blue-mid)] bg-[var(--blue-soft)] cursor-pointer hover:border-[var(--blue)] transition-colors">
            <span className="text-[24px]">🎬</span>
            <span className="text-[13px] font-semibold text-[var(--blue-dark)]">Add videos</span>
            <span className="text-[11px] text-[var(--ink-faint)]">MP4, WebM or MOV · up to 100 MB each</span>
            <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={pickVideos} className="hidden" />
          </label>
          {videos.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {videos.map((v, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[var(--line)] bg-black">
                  <video src={v.preview} className="w-full aspect-video object-cover" muted />
                  <div className="bg-white px-2 py-1.5 flex items-center gap-1.5">
                    <input
                      value={v.title}
                      onChange={(e) => setVideos((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                      className="flex-1 min-w-0 text-[11.5px] outline-none text-[var(--ink-dim)]"
                    />
                    <button type="button" onClick={() => setVideos((p) => p.filter((_, j) => j !== i))} className="text-[11px] font-semibold text-[var(--coral)]">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section eyebrow="05" title="Private contact" hint="Only shown to clients who subscribe and unlock you.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone"><input value={f.phone} onChange={set("phone")} placeholder="+971 50 000 0000" className={input} /></Field>
            <Field label="WhatsApp"><input value={f.whatsapp} onChange={set("whatsapp")} placeholder="+971 50 000 0000" className={input} /></Field>
          </div>
          <Field label="Email"><input value={f.email} onChange={set("email")} type="email" placeholder="you@example.com" className={input} /></Field>
        </Section>

        {error && <p className="text-[13px] text-[var(--coral)] bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="sticky bottom-4 py-3.5 rounded-xl bg-[var(--blue)] text-white text-[15px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-[0_10px_30px_rgba(90,46,134,0.35)] disabled:opacity-70"
        >
          {busy ? step || "Publishing…" : "Publish my profile"}
        </button>
      </form>

      {/* ---- Live preview (signature) ---- */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-[80px]">
        <p className="hidden lg:block text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-3">Live preview</p>
        <div className="rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-[0_16px_50px_rgba(16,26,38,0.10)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_50%_0%,var(--blue-mid),var(--blue-soft)_60%)] flex items-center justify-center">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="font-display text-[64px] font-bold text-[var(--blue-deep)]/40">{initials(f.name || "Your Name")}</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-white bg-[var(--orange)] px-2.5 py-1 rounded-md">New</span>
            <span className="absolute bottom-3 left-3 text-[10.5px] font-semibold text-white bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-md">
              {emoji} {f.category ? categoryLabel(f.category) : "Category"} · {f.city || "Emirate"}
            </span>
          </div>
          <div className="p-4">
            <p className="font-display text-[17px] font-semibold text-[var(--ink)]">{f.name || "Your stage name"}</p>
            <p className="text-[12.5px] text-[var(--ink-dim)] mb-2">{f.tagline || "Your one-line tagline"}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-[var(--ink-dim)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{f.availability}
              </span>
              {price && <span className="text-[11.5px] font-semibold text-[var(--ink)]">{price}</span>}
            </div>
            {videos.length > 0 && <p className="mt-2 text-[11px] text-[var(--blue-dark)] font-semibold">🎬 {videos.length} video{videos.length > 1 ? "s" : ""} attached</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const input =
  "px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Section({ eyebrow, title, hint, children }: { eyebrow: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[13px] font-bold text-[var(--orange)]">{eyebrow}</span>
        <div>
          <legend className="font-display text-[17px] font-semibold text-[var(--ink)]">{title}</legend>
          {hint && <p className="text-[12px] text-[var(--ink-faint)] mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">
        {label} {required && <span className="text-[var(--orange)]">*</span>}
        {hint && <span className="font-normal text-[var(--ink-faint)]"> · {hint}</span>}
      </span>
      {children}
    </label>
  );
}
