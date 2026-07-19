// Trust-boundary validation for creator-supplied text. Used by every write path
// that stores a contact number or public profile copy.

/**
 * Accept UAE numbers only, in any form a creator might type them
 * (+971 50 123 4567 / 00971… / 0501234567 / 501234567), and return them
 * normalised to E.164 so `tel:` links and stored values stay consistent.
 * Anything foreign returns null — this is a UAE-only marketplace.
 */
export function uaePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const n = digits.startsWith("00971")
    ? digits.slice(5)
    : digits.startsWith("971")
      ? digits.slice(3)
      : digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  // Mobile: 5X + 7 digits. Landline: area code (2,3,4,6,7,9) + 7 digits.
  return /^5\d{8}$/.test(n) || /^[234679]\d{7}$/.test(n) ? `+971${n}` : null;
}

// ponytail: heuristic, not a spam engine. Prose separates numbers with words, so a
// 9-digit near-contiguous run is a phone, not "500 shows since 2015". Tighten only
// if creators actually route around it.
const CONTACT_PATTERNS = [
  /https?:\/\//i, // links
  /\bwww\./i,
  /[a-z0-9-]{2,}\.(com|net|org|ae|io|me|co|link|bio|tv|fm)\b/i, // bare domains
  /@[a-z0-9._-]{2,}/i, // handles and emails
  /(?:\+?\d[ .()-]?){9,}/, // phone numbers
  /\b(insta|instagram|whats\s?app|snap|snapchat|tiktok|telegram|facebook|youtube|twitter|linktree|dm\s+me)\b/i,
];

/**
 * True if any of the given public-profile fields leaks a way to reach the creator
 * off-platform. Contact details are the paid product — letting them sit in a bio
 * hands them out for free.
 */
export function hasContactInfo(...parts: (string | null | undefined)[]): boolean {
  const text = parts.filter(Boolean).join(" ");
  return CONTACT_PATTERNS.some((re) => re.test(text));
}

export const CONTACT_IN_TEXT_MESSAGE =
  "Remove contact details from your profile text — no phone numbers, emails, links or social handles. Clients reach you through the enquiry form, and you share your card when you choose.";

export const PHONE_MESSAGE = "Enter a UAE number (e.g. +971 50 123 4567). We only accept UAE numbers.";
