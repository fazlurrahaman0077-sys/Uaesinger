// Types + static category taxonomy. Artist rows now live in Supabase
// (see src/lib/talent.ts for queries). This file stays free of server-only
// imports so client components (e.g. the onboarding form) can use it too.

export type Category = {
  slug: string;
  label: string;
  emoji: string;
  blurb: string;
};

// Main categories. Mirrored in the DB `categories` table (FK target). Original
// slugs kept for back-compat with existing rows + /public/creators images.
export const CATEGORIES: Category[] = [
  { slug: "singers", label: "Singers", emoji: "🎤", blurb: "Wedding vocalists, jazz, Arabic & Bollywood singers, cover artists." },
  { slug: "djs-bands", label: "DJs & Bands", emoji: "🎧", blurb: "Club DJs, live bands and instrumental ensembles." },
  { slug: "musicians", label: "Musicians", emoji: "🎻", blurb: "Guitarists, pianists, violinists, oud & tabla players." },
  { slug: "dancers", label: "Dancers", emoji: "💃", blurb: "Bollywood, belly, contemporary and troupe performers." },
  { slug: "mcs-hosts", label: "MCs & Hosts", emoji: "🎙️", blurb: "Bilingual hosts and masters of ceremony." },
  { slug: "comedians", label: "Comedians", emoji: "😂", blurb: "Stand-up, improv and corporate comedy acts." },
  { slug: "magicians", label: "Magicians", emoji: "🪄", blurb: "Close-up, stage magicians, mentalists and illusionists." },
  { slug: "photographers", label: "Photographers", emoji: "📷", blurb: "Wedding, event, corporate and fashion coverage." },
  { slug: "videographers", label: "Videographers", emoji: "📹", blurb: "Cinematic, drone, reels and live-streaming creators." },
  { slug: "wedding-performers", label: "Wedding Performers", emoji: "💐", blurb: "Bridal entry, henna artists, wedding MCs and packages." },
  { slug: "entertainers", label: "Entertainers", emoji: "🎪", blurb: "Stilt walkers, mascots, mime and street performers." },
  { slug: "kids", label: "Kids Entertainers", emoji: "🧒", blurb: "Clowns, face painters, magic and puppet shows." },
  { slug: "lifestyle", label: "Lifestyle Companion", emoji: "🥂", blurb: "Event companions, social hosts & hostesses and dinner companions." },
];

// Subcategories per main category. Used for the onboarding select and browse filters.
export const SUBCATEGORIES: Record<string, string[]> = {
  singers: ["Male Vocalists", "Female Vocalists", "Arabic Singers", "Bollywood Singers", "Western Pop Singers", "Jazz Singers", "Classical Singers", "Sufi/Qawwali Singers", "Opera Singers", "Wedding Singers", "Lounge Singers", "Acoustic Singers", "Solo Vocalists", "Duo Vocalists", "Kids Singers"],
  "djs-bands": ["Wedding DJs", "Club DJs", "Corporate Event DJs", "Private Party DJs", "Arabic DJs", "Bollywood DJs", "EDM DJs", "House DJs", "Lounge DJs", "Cover Bands", "Live Wedding Bands", "Rock Bands", "Jazz Bands", "Arabic Bands", "Bollywood Bands", "Fusion Bands", "Corporate Bands", "Acoustic Bands", "Party Bands"],
  musicians: ["Guitarists", "Pianists", "Keyboardists", "Violinists", "Saxophonists", "Trumpeters", "Drummers", "Percussionists", "Flutists", "Cellists", "Harpists", "Oud Players", "Tabla Players"],
  dancers: ["Bollywood Dancers", "Contemporary Dancers", "Hip-Hop Dancers", "Ballet Dancers", "Salsa Dancers", "Latin Dancers", "Belly Dancers", "Arabic Dancers", "Kathak Dancers", "Classical Indian Dancers", "Fusion Dancers", "LED Dancers", "Wedding Dance Groups", "Kids Dance Groups"],
  "mcs-hosts": ["Wedding MCs", "Corporate Hosts", "Event Presenters", "Arabic Hosts", "English Hosts", "Bilingual Hosts", "Luxury Event Hosts", "Award Ceremony Hosts", "Product Launch Hosts", "Game Hosts", "Auction Hosts", "Celebrity Hosts"],
  comedians: ["Stand-up Comedians", "Improv Comedians", "Corporate Comedians", "Arabic Comedians", "Comedy Magicians", "Roast Comedians", "Kids Comedians"],
  magicians: ["Close-up Magicians", "Stage Magicians", "Corporate Magicians", "Wedding Magicians", "Kids Magicians", "Mentalists", "Illusionists", "Escape Artists", "Comedy Magicians"],
  photographers: ["Wedding Photographers", "Event Photographers", "Corporate Photographers", "Fashion Photographers", "Product Photographers", "Food Photographers", "Luxury Event Photographers", "Drone Photographers", "Portrait Photographers", "Lifestyle Photographers"],
  videographers: ["Wedding Videographers", "Event Videographers", "Corporate Videographers", "Drone Videographers", "Cinematic Videographers", "Social Media Content Videographers", "Music Video Creators", "Short-form/Reels Creators", "Live Streaming Specialists"],
  "wedding-performers": ["Wedding Singers", "Wedding DJs", "Wedding Bands", "Bridal Entry Performers", "Dance Performers", "Arabic Wedding Performers", "Indian Wedding Performers", "Pakistani Wedding Performers", "Traditional Wedding Artists", "Henna Artists", "Wedding MCs"],
  entertainers: ["Stilt Walkers", "Mascot Performers", "Balloon Artists", "Juggling Artists", "Puppeteers", "Street Performers", "Mime Artists", "Living Statues", "Bubble Artists"],
  kids: ["Clowns", "Face Painters", "Balloon Artists", "Magic Shows", "Puppet Shows", "Character Performers", "Mascot Shows", "Kids DJs", "Storytellers", "Science Shows"],
  lifestyle: ["Event Companions", "Social Companions", "Companion Services", "Hosts & Hostesses", "Dinner Companions", "Personal Assistants", "Tour Companions"],
};

// New categories have no bespoke stock imagery yet — reuse the closest set.
const IMAGE_ALIAS: Record<string, string> = {
  musicians: "singers", comedians: "mcs-hosts", magicians: "entertainers",
  videographers: "photographers", "wedding-performers": "singers", kids: "entertainers",
  lifestyle: "mcs-hosts",
};

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
  subcategory: string | null;
  tags: string[];
  gender: string | null;
  nationality: string | null;
  likesCount: number;
};

// All nationalities (demonyms). Popular-in-UAE ones first, then the full A–Z list.
export const NATIONALITIES = [
  "Emirati", "Indian", "Pakistani", "Filipino", "Egyptian", "Lebanese", "British", "American",
  "Afghan", "Albanian", "Algerian", "Angolan", "Argentine", "Armenian", "Australian", "Austrian",
  "Azerbaijani", "Bahraini", "Bangladeshi", "Belarusian", "Belgian", "Beninese", "Bolivian",
  "Bosnian", "Brazilian", "Bulgarian", "Burkinabé", "Burmese", "Burundian", "Cambodian",
  "Cameroonian", "Canadian", "Chadian", "Chilean", "Chinese", "Colombian", "Congolese", "Croatian",
  "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "Ecuadorian",
  "Emirati (UAE)", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Finnish", "French", "Gabonese",
  "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Guatemalan", "Guinean", "Haitian",
  "Honduran", "Hungarian", "Icelandic", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli",
  "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kuwaiti",
  "Kyrgyz", "Lao", "Latvian", "Liberian", "Libyan", "Lithuanian", "Luxembourgish", "Macedonian",
  "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Mauritanian", "Mauritian",
  "Mexican", "Moldovan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nepali",
  "New Zealander", "Nicaraguan", "Nigerien", "Nigerian", "North Korean", "Norwegian", "Omani",
  "Palestinian", "Panamanian", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari",
  "Romanian", "Russian", "Rwandan", "Salvadoran", "Saudi", "Senegalese", "Serbian", "Sierra Leonean",
  "Singaporean", "Slovak", "Slovenian", "Somali", "South African", "South Korean", "South Sudanese",
  "Spanish", "Sri Lankan", "Sudanese", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik",
  "Tanzanian", "Thai", "Togolese", "Tunisian", "Turkish", "Turkmen", "Ugandan", "Ukrainian",
  "Uruguayan", "Uzbek", "Venezuelan", "Vietnamese", "Yemeni", "Zambian", "Zimbabwean", "Other",
];

export const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "group", label: "Group / Duo" },
];

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
function imageKey(category: string): string {
  return IMAGE_ALIAS[category] ?? category;
}

export function artistImage(slug: string, category: string, photoPath?: string | null): string {
  if (photoPath) return publicPhotoUrl(photoPath);
  const variant = (hash(slug) % 2) + 1; // 1 or 2
  return `/creators/${imageKey(category)}-${variant}.jpg`;
}

export function artistHero(category: string, photoPath?: string | null): string {
  if (photoPath) return publicPhotoUrl(photoPath);
  return `/creators/${imageKey(category)}-wide.jpg`;
}
