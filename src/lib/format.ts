// Shared by a client component (VideoReel) and a server one (dashboard), so it
// lives outside both: every export of a "use client" module becomes a client
// reference, and the server can't call one.

// 1.2K rather than 1200, via Intl — no formatter of our own.
export function formatViews(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

// Bios and reviews get pasted from WhatsApp/Word, which substitutes non-breaking
// spaces. A whole paragraph joined by them is one unbreakable word: it either
// overflows the column or breaks mid-word. Swapping them for real spaces on read
// restores normal wrapping — the CSS overflow-wrap is only a backstop now.
export function normalizeText(s: string | null | undefined): string {
  return (s ?? "").replace(/[\u00A0\u202F\u2007]/g, " ");
}
