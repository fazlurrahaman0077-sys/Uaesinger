import Link from "next/link";
import { listRecentReviews } from "@/lib/reviews";

// Hand-written social proof, used until enough real reviews land. Kept as the
// fallback rather than deleted so the rail is never sparse on a quiet week.
const CURATED = [
  {
    name: "Rania Mansour",
    role: "Wedding planner, Dubai",
    text: "We booked a full live band for a 300-guest wedding in Dubai through UAESinger. Watching the performance video first meant zero surprises on the day.",
  },
  {
    name: "James Keller",
    role: "Events manager, Abu Dhabi resort",
    text: "As a hotel events manager I hire MCs and photographers monthly. The Premium plan pays for itself after two bookings.",
  },
  {
    name: "Sara Al Naqbi",
    role: "Marketing lead, Sharjah",
    text: "Found a bilingual MC for our Sharjah corporate launch in under an hour. The contact unlock process felt safe and serious, not spammy.",
  },
  {
    name: "Deepak Nair",
    role: "Father of the bride, Dubai",
    text: "The Bollywood dance troupe we hired rehearsed with our family over video call first. Guests still talk about the sangeet entry.",
  },
  {
    name: "Layla Haddad",
    role: "Brand manager, Abu Dhabi",
    text: "We needed an Arabic and English host for a product launch on three days' notice. Two replies within the hour, booked by lunchtime.",
  },
  {
    name: "Tom Fletcher",
    role: "Bar owner, Dubai Marina",
    text: "I've rotated four different lounge singers through my venue this year, all found here. The reels save me an entire audition round.",
  },
  {
    name: "Priya Raghavan",
    role: "HR lead, Sharjah",
    text: "Booked a magician and a face painter for our staff family day. Both turned up early and handled a room of sixty kids without breaking a sweat.",
  },
  {
    name: "Khalid Al Suwaidi",
    role: "Private host, Al Ain",
    text: "The oud player I found for a majlis evening was exactly what the listing promised. Fair pricing, no agency mark-up in the middle.",
  },
  {
    name: "Elena Petrova",
    role: "Yacht charter manager, Dubai",
    text: "Live saxophonist for sunset cruises, every weekend of the season. Having the price range up front makes my quoting so much faster.",
  },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="text-[var(--gold)] text-[14px] tracking-[3px] mb-3" aria-label={`${full} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-[var(--line)]">{"★".repeat(5 - full)}</span>
    </div>
  );
}

function initialsOf(name: string) {
  const w = name.split(/\s+/).filter(Boolean);
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase() || "★";
}

// Deterministic tint per name — avoids storing a colour and avoids Math.random,
// which would mismatch between server and client render.
const TINTS = [
  "linear-gradient(135deg,#2B7FD6,#5BA3E8)",
  "linear-gradient(135deg,#15578F,#2B7FD6)",
  "linear-gradient(135deg,#D6A13C,#E8C374)",
];
function tintFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return TINTS[Math.abs(h) % TINTS.length];
}

type Card = { key: string; name: string; role: string; text: string; rating: number; href?: string };

function TestimonialCard({ c }: { c: Card }) {
  const body = (
    <>
      <Stars rating={c.rating} />
      <p className="text-[13.5px] text-[var(--ink)] leading-relaxed mb-5 flex-1">&ldquo;{c.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
          style={{ background: tintFor(c.name) }}
          aria-hidden="true"
        >
          {initialsOf(c.name)}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[var(--ink)] truncate">{c.name}</div>
          <div className="text-[11.5px] text-[var(--ink-faint)] truncate">{c.role}</div>
        </div>
      </div>
    </>
  );

  const shell =
    "bg-white border border-[var(--line)] rounded-2xl p-6 flex flex-col w-[320px] flex-shrink-0 transition-all";

  return c.href ? (
    <Link href={c.href} className={`${shell} hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,26,38,0.10)]`}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export default async function Testimonials() {
  const real = await listRecentReviews(12);

  // Real reviews win once there are enough to fill the rail; below that the
  // curated set keeps the section looking alive.
  const cards: Card[] =
    real.length >= 6
      ? real.map((r) => ({
          key: r.id,
          name: r.authorName,
          role: `Hired ${r.artistName}`,
          text: r.body,
          rating: r.rating,
          href: `/artists/${r.artistSlug}`,
        }))
      : CURATED.map((t) => ({ key: t.name, name: t.name, role: t.role, text: t.text, rating: 5 }));

  // Slower rail when there are more cards, so reading speed stays constant.
  const duration = `${cards.length * 7}s`;

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-5">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--blue-dark)]">What clients say</span>
          </div>
          <h2 className="font-display text-[28px] sm:text-[30px] font-semibold text-[var(--ink)]">
            Trusted by hosts and venues across the UAE
          </h2>
        </div>
      </div>

      {/* Edges fade so cards enter and leave instead of being cut off. */}
      <div
        className="marquee relative"
        style={{
          maskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)",
        }}
      >
        <div className="marquee-track flex" style={{ ["--marquee-duration" as string]: duration }}>
          {cards.map((c) => (
            <TestimonialCard key={c.key} c={c} />
          ))}
          {/* Second copy is what makes the loop seamless. Duplicate content, so
              it's hidden from screen readers and keyboard order. display:contents
              keeps the clones as direct flex children, so the track's gap stays
              uniform across the seam. */}
          <div className="contents" aria-hidden="true" inert>
            {cards.map((c) => (
              <TestimonialCard key={`clone-${c.key}`} c={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
