// Types + static category taxonomy. Artist rows now live in Supabase
// (see src/lib/talent.ts for queries). This file stays free of server-only
// imports so client components (e.g. the onboarding form) can use it too.

export type Category = {
  slug: string;
  label: string;
  emoji: string;
  blurb: string;
};

// The 6 fixed categories. Mirrored in the DB `categories` table (FK target) —
// keep in sync with supabase/seed-categories.sql.
export const CATEGORIES: Category[] = [
  { slug: "singers", label: "Singers", emoji: "🎤", blurb: "Wedding vocalists, jazz & Arabic singers, cover artists." },
  { slug: "djs-bands", label: "DJs & Bands", emoji: "🎵", blurb: "Club DJs, live bands and instrumental ensembles." },
  { slug: "dancers", label: "Dancers", emoji: "💃", blurb: "Contemporary, traditional and troupe performers." },
  { slug: "mcs-hosts", label: "MCs & Hosts", emoji: "✨", blurb: "Bilingual hosts and masters of ceremony." },
  { slug: "photographers", label: "Photographers", emoji: "📷", blurb: "Event, portrait and cinematic coverage." },
  { slug: "entertainers", label: "Entertainers", emoji: "🎭", blurb: "Magicians, LED shows and specialty acts." },
  { slug: "drum-lyre", label: "Drum & Lyre Corps", emoji: "🥁", blurb: "Marching drum & lyre corps for parades and national days." },
];

// The seven Emirates — used for the onboarding city select and footer links.
export const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export type Artist = {
  slug: string;
  name: string;
  category: string; // Category.slug
  city: string;
  tagline: string;
  bio: string;
  rating: number;
  reviews: number;
  gigs: number;
  languages: string[];
  genres: string[];
  availability: string;
  responseRate: number;
  featuredTag: string | null;
  priceMin: number | null;
  priceMax: number | null;
  photoPath: string | null;
};

// Public URL for an uploaded creator profile photo.
export function publicPhotoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/creator-photos/${path}`;
}

// "AED 3,000 – 6,000", "From AED 3,000", or null if the artist set no range.
export function priceRange(min: number | null, max: number | null): string | null {
  const f = (n: number) => `AED ${n.toLocaleString()}`;
  if (min && max) return `${f(min)} – ${max.toLocaleString()}`;
  if (min) return `From ${f(min)}`;
  if (max) return `Up to ${f(max)}`;
  return null;
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug;
}

// Initials for the avatar tile (fallback when an image can't load).
export function initials(name: string): string {
  const words = name.replace(/^The\s+/i, "").split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? "").concat(words[1]?.[0] ?? "").toUpperCase();
}

// Small stable string hash → used to fan artists across the image variants.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// AI-generated category imagery lives in /public/creators/{category}-{1,2,wide}.jpg.
// Cards use a portrait variant (picked deterministically per artist); the
// profile hero uses the wide one.
export function artistImage(slug: string, category: string, photoPath?: string | null): string {
  if (photoPath) return publicPhotoUrl(photoPath);
  const variant = (hash(slug) % 2) + 1; // 1 or 2
  return `/creators/${category}-${variant}.jpg`;
}

export function artistHero(category: string, photoPath?: string | null): string {
  if (photoPath) return publicPhotoUrl(photoPath);
  return `/creators/${category}-wide.jpg`;
}
