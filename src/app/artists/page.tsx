import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtistCard from "@/components/ArtistCard";
import { CATEGORIES, getCategory } from "@/lib/artists";
import { listArtists } from "@/lib/talent";

export const metadata: Metadata = {
  title: "Browse talent | UAESinger",
  description:
    "Browse verified singers, DJs, bands, dancers, MCs, photographers and entertainers for hire across Dubai, Abu Dhabi, Sharjah and the UAE.",
};

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && getCategory(category) ? category : "all";
  const list = await listArtists(active);

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <section className="px-5 pt-14 pb-8">
          <div className="max-w-[1180px] mx-auto">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--blue-dark)] mb-2">
              Browse talent
            </p>
            <h1 className="font-display text-[32px] sm:text-[38px] font-semibold text-[var(--ink)] mb-2">
              Book verified performers across the UAE
            </h1>
            <p className="text-[14px] text-[var(--ink-dim)] max-w-[560px]">
              {list.length} {list.length === 1 ? "act" : "acts"}
              {active !== "all" ? ` in ${getCategory(active)!.label}` : " across every category"} —
              verified profiles, ratings and direct booking.
            </p>
          </div>
        </section>

        {/* Category filter — real links so URLs are shareable & SEO-friendly */}
        <section className="px-5 pb-8">
          <div className="max-w-[1180px] mx-auto flex flex-wrap gap-2">
            <CategoryPill href="/artists" label="All" emoji="✦" activeState={active === "all"} />
            {CATEGORIES.map((c) => (
              <CategoryPill
                key={c.slug}
                href={`/artists?category=${c.slug}`}
                label={c.label}
                emoji={c.emoji}
                activeState={active === c.slug}
              />
            ))}
          </div>
        </section>

        <section className="px-5 pb-24">
          <div className="max-w-[1180px] mx-auto">
            {list.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-[22px] font-semibold text-[var(--ink)] mb-2">
                  {active === "all" ? "No artists have joined yet" : "No talent in this category yet"}
                </p>
                <p className="text-[14px] text-[var(--ink-dim)] mb-6">
                  Be the first — create your artist profile and start getting booked.
                </p>
                <Link
                  href="/artists/new"
                  className="inline-block py-2.5 px-6 rounded-lg bg-[var(--blue)] text-white text-[14px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
                >
                  Join as artist →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map((a) => (
                  <ArtistCard key={a.slug} artist={a} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CategoryPill({
  href,
  label,
  emoji,
  activeState,
}: {
  href: string;
  label: string;
  emoji: string;
  activeState: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border transition-all ${
        activeState
          ? "border-[var(--blue)] bg-[var(--blue)] text-white shadow-[0_4px_12px_rgba(43,127,214,0.25)]"
          : "border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)] hover:text-[var(--ink)]"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </Link>
  );
}
