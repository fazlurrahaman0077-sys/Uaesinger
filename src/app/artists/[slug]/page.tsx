import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, categoryLabel, initials, priceRange } from "@/lib/artists";
import { getAccess, isArtistUnlocked, maskedNumber } from "@/lib/subscription";
import { getArtistBySlug, getContact } from "@/lib/talent";
import { getPlan } from "@/lib/plans";
import { revealContact } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Artist not found | UAESinger" };
  return {
    title: `${artist.name} — ${artist.tagline} in ${artist.city} | UAESinger`,
    description: (artist.bio || artist.tagline).slice(0, 155),
  };
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ limit?: string }>;
}) {
  const { slug } = await params;
  const { limit } = await searchParams;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const emoji = CATEGORIES.find((c) => c.slug === artist.category)?.emoji ?? "★";

  // Profile content is public. Contact reveal spends a plan credit; RLS returns
  // the row only for artists the hirer has unlocked.
  const { user, plan, quota, unlocksUsed } = await getAccess();
  const unlocked = plan ? await isArtistUnlocked(artist.id) : false;
  const contact = unlocked ? await getContact(artist.id) : null;
  const remaining = quota === null ? null : Math.max(0, quota - unlocksUsed);
  const planInfo = getPlan(plan);
  const limitReached = !unlocked && quota !== null && remaining === 0;

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[1180px] mx-auto px-5 py-8">
          {/* Breadcrumb */}
          <nav className="text-[12.5px] text-[var(--ink-faint)] mb-6 flex items-center gap-1.5">
            <Link href="/artists" className="hover:text-[var(--blue-dark)]">Talent</Link>
            <span>/</span>
            <Link href={`/artists?category=${artist.category}`} className="hover:text-[var(--blue-dark)]">
              {categoryLabel(artist.category)}
            </Link>
            <span>/</span>
            <span className="text-[var(--ink-dim)]">{artist.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* Left: hero + bio */}
            <div>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--line)] bg-gradient-to-br from-[var(--blue-soft)] via-[var(--blue-mid)] to-[var(--blue-soft)] flex items-center justify-center">
                <span className="font-display text-[96px] font-bold text-[var(--blue-deep)]/35 select-none">
                  {initials(artist.name)}
                </span>
                <span className="absolute top-4 left-4 text-[11px] font-bold tracking-wider uppercase text-white bg-[var(--blue)] px-3 py-1 rounded-md">
                  {artist.featuredTag}
                </span>
                <span className="absolute bottom-4 left-4 text-[12px] font-semibold text-[var(--blue-deep)] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md">
                  {emoji} {categoryLabel(artist.category)} · {artist.city}
                </span>
              </div>

              <div className="mt-8">
                <h2 className="font-display text-[22px] font-semibold text-[var(--ink)] mb-3">
                  About {artist.name.split(" ")[0]}
                </h2>
                <p className="text-[14.5px] text-[var(--ink-dim)] leading-relaxed">{artist.bio}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                  <Fact label="Rating" value={`★ ${artist.rating}`} />
                  <Fact label="Reviews" value={String(artist.reviews)} />
                  <Fact label="Gigs completed" value={String(artist.gigs)} />
                  <Fact label="Response rate" value={`${artist.responseRate}%`} />
                  <Fact label="Based in" value={artist.city} />
                  <Fact label="Availability" value={artist.availability} />
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <TagRow title="Languages" items={artist.languages} />
                  <TagRow title="Styles" items={artist.genres} />
                </div>
              </div>
            </div>

            {/* Right: booking panel (sticky) */}
            <aside className="lg:sticky lg:top-[80px] bg-white border border-[var(--line)] rounded-2xl p-6 shadow-[0_16px_40px_rgba(16,26,38,0.06)]">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-display text-[24px] font-semibold text-[var(--ink)]">{artist.name}</h1>
                <span className="text-[13px] text-[var(--gold)] font-bold">★ {artist.rating}</span>
              </div>
              <p className="text-[13.5px] text-[var(--ink-dim)] mb-1">{artist.tagline}</p>
              <p className="text-[12.5px] text-[var(--ink-faint)] mb-4">
                {categoryLabel(artist.category)} · {artist.city}
              </p>

              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--blue-dark)] bg-[var(--blue-soft)] border border-[var(--blue-mid)] rounded-lg px-3 py-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {artist.availability}
              </div>

              {priceRange(artist.priceMin, artist.priceMax) && (
                <div className="mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-1">
                    Price range
                  </p>
                  <p className="font-display text-[20px] font-semibold text-[var(--ink)]">
                    {priceRange(artist.priceMin, artist.priceMax)}
                  </p>
                  <p className="text-[11px] text-[var(--ink-faint)]">Indicative — final quote agreed with the artist.</p>
                </div>
              )}

              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-2">
                Direct contact
              </p>

              {unlocked ? (
                // Unlocked — this artist's contact spent (or is) a credit.
                <div className="border border-[var(--line)] rounded-lg p-4 bg-[var(--bg2)]">
                  {contact?.phone ? (
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="block text-[18px] font-bold text-[var(--ink)] tracking-wide mb-1 hover:text-[var(--blue-dark)]"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    <p className="text-[13.5px] text-[var(--ink-dim)] mb-1">
                      This artist hasn&apos;t added a phone number yet.
                    </p>
                  )}
                  {contact?.email && (
                    <a href={`mailto:${contact.email}`} className="block text-[12.5px] text-[var(--blue-dark)] mb-1 hover:underline">
                      {contact.email}
                    </a>
                  )}
                  {contact?.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
                      className="block text-[12.5px] text-[var(--blue-dark)] mb-1 hover:underline"
                    >
                      WhatsApp: {contact.whatsapp}
                    </a>
                  )}
                  <button className="w-full mt-3 py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm">
                    Request booking
                  </button>
                  <p className="text-[11px] text-[var(--ink-faint)] text-center mt-2">
                    Unlocked with your {planInfo?.label ?? "plan"}.
                  </p>
                </div>
              ) : (
                <div className="border border-dashed border-[var(--blue-mid)] rounded-lg p-4 bg-[var(--blue-soft)] text-center">
                  <div className="flex items-center justify-center gap-2 mb-3 text-[var(--ink-faint)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <span className="text-[16px] font-bold tracking-wide blur-[1px] select-none">
                      {maskedNumber()}
                    </span>
                  </div>

                  {plan && !limitReached ? (
                    // Active plan with credits left — spend one to reveal.
                    <form action={revealContact}>
                      <input type="hidden" name="slug" value={artist.slug} />
                      <input type="hidden" name="artistId" value={artist.id} />
                      <p className="text-[12.5px] text-[var(--ink-dim)] mb-3">
                        Reveal this artist&apos;s direct contact details.
                      </p>
                      <button
                        type="submit"
                        className="block w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
                      >
                        Reveal contact
                      </button>
                      <p className="text-[11px] text-[var(--ink-faint)] mt-2">
                        {remaining === null
                          ? "Unlimited contacts on Premium"
                          : `${remaining} of ${quota} contacts left this month`}
                      </p>
                    </form>
                  ) : limitReached ? (
                    // Plan exhausted — upgrade.
                    <>
                      <p className="text-[12.5px] text-[var(--ink-dim)] mb-3">
                        You&apos;ve used all {quota} contacts on your {planInfo?.label ?? "plan"}. Upgrade for more.
                      </p>
                      <Link
                        href="/pricing"
                        className="block w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
                      >
                        Upgrade plan
                      </Link>
                    </>
                  ) : (
                    // No plan — subscribe.
                    <>
                      <p className="text-[12.5px] text-[var(--ink-dim)] mb-3">
                        {user
                          ? "Subscribe to a plan to reveal direct contact details."
                          : "Sign in and subscribe to reveal direct contact details."}
                      </p>
                      <Link
                        href={user ? "/pricing" : "/signin?next=/pricing"}
                        className="block w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
                      >
                        View plans
                      </Link>
                    </>
                  )}

                  {limit && (
                    <p className="text-[11px] text-[var(--coral)] mt-2 font-semibold">
                      Contact limit reached on your current plan.
                    </p>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-lg px-3 py-2.5">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">{label}</p>
      <p className="text-[15px] font-semibold text-[var(--ink)] mt-0.5">{value}</p>
    </div>
  );
}

function TagRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <span key={t} className="text-[12px] text-[var(--ink-dim)] bg-white border border-[var(--line)] rounded-full px-3 py-1">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
