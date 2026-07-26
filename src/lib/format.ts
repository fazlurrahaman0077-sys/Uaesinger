// Shared by a client component (VideoReel) and a server one (dashboard), so it
// lives outside both: every export of a "use client" module becomes a client
// reference, and the server can't call one.

// 1.2K rather than 1200, via Intl — no formatter of our own.
export function formatViews(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
