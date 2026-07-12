import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, categoryLabel, artistHero, priceRange } from "@/lib/artists";
import { getAccess, isArtistUnlocked, maskedNumber } from "@/lib/subscription";
import { getArtistBySlug, getContact } from "@/lib/talent";
import { listArtistVideos } from "@/lib/videos";
import { listArtistPhotos } from "@/lib/photos";
import ShareButton from "@/components/ShareButton";
import JsonLd from "@/components/JsonLd";
import { getPlan, FREE_MODE } from "@/lib/plans";
import { revealContact, requestBooking } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Artist not found | UAESinger" };
  const label = categoryLabel(artist.category);
  const title = `${artist.name} — ${artist.tagline || label} in ${artist.city} | UAESinger`;
  const description =
    (artist.bio || `Book ${artist.name}, a ${label.toLowerCase()} available in ${artist.city}. See reviews, rates and performance videos on UAESinger.`).slice(0, 160);
  const url = `/artists/${artist.slug}`;
  return {
    title,
    description,
    keywords: [`hire ${label} ${artist.city}`, `${artist.name}`, `book ${label} UAE`, ...artist.genres.map((g) => `${g} ${artist.city}`)],
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "profile", siteName: "UAESinger" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ limit?: string; enquiry?: string }>;
}) {
  const { slug } = await params;
  const { limit, enquiry } = await searchParams;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const emoji = CATEGORIES.find((c) => c.slug === artist.category)?.emoji ?? "★";

  // Profile content is public. Contact reveal spends a plan credit; RLS returns
  // the row only for artists the hirer has unlocked.
  const { user, plan, quota, unlocksUsed } = await getAccess();
  // FREE_MODE: any signed-in user can reveal for free. Otherwise a plan is needed.
  const canReveal = FREE_MODE ? !!user : !!plan;
  const unlocked = canReveal ? await isArtistUnlocked(artist.id) : false;
  const contact = unlocked ? await getContact(artist.id) : null;
  const videos = await listArtistVideos(artist.id);
  const photos = await listArtistPhotos(artist.id);
  const remaining = quota === null ? null : Math.max(0, quota - unlocksUsed);
  const planInfo = getPlan(plan);
  const limitReached = !FREE_MODE && !unlocked && quota !== null && remaining === 0;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const coverAbs = artist.photoPath
    ? artistHero(artist.category, artist.photoPath)
    : `${base}${artistHero(artist.category)}`;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "PerformingGroup",
    name: artist.name,
    description: artist.bio || artist.tagline,
    image: coverAbs,
    url: `${base}/artists/${artist.slug}`,
    address: { "@type": "PostalAddress", addressRegion: artist.city, addressCountry: "AE" },
    ...(artist.reviews > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: artist.rating, reviewCount: artist.reviews },
    }),
    ...(artist.priceMin && {
      makesOffer: { "@type": "Offer", priceCurrency: "AED", price: artist.priceMin, availability: "https://schema.org/InStock" },
    }),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--blue-soft)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artistHero(artist.category, artist.photoPath)}
                  alt={`${artist.name} performing`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {artist.featuredTag && (
                  <span className="absolute top-4 left-4 text-[11px] font-bold tracking-wider uppercase text-white bg-[var(--blue)] px-3 py-1 rounded-md">
                    {artist.featuredTag}
                  </span>
                )}
                <span className="absolute bottom-4 left-4 text-[12px] font-semibold text-white bg-black/35 backdrop-blur-sm px-3 py-1.5 rounded-md">
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
                  {artist.tags.length > 0 && <TagRow title="Good for" items={artist.tags} />}
                </div>

                {photos.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-display text-[22px] font-semibold text-[var(--ink)] mb-3">Gallery</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((p) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p.id} src={p.url} alt={`${artist.name}`} loading="lazy" className="w-full aspect-square object-cover rounded-xl border border-[var(--line)]" />
                      ))}
                    </div>
                  </div>
                )}

                {videos.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-display text-[22px] font-semibold text-[var(--ink)] mb-3">Watch {artist.name.split(" ")[0]}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {videos.map((v) => (
                        <figure key={v.id} className="rounded-xl overflow-hidden border border-[var(--line)] bg-black">
                          <video src={v.src} controls preload="metadata" playsInline className="w-full aspect-video bg-black" />
                          {v.title && <figcaption className="text-[12px] text-[var(--ink-dim)] px-3 py-2 bg-white">{v.title}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: booking panel (sticky) */}
            <aside className="lg:sticky lg:top-[80px] bg-white border border-[var(--line)] rounded-2xl p-6 shadow-[0_16px_40px_rgba(16,26,38,0.06)]">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-display text-[24px] font-semibold text-[var(--ink)]">{artist.name}</h1>
                <span className="text-[13px] text-[var(--gold)] font-bold">★ {artist.rating}</span>
              </div>
              <p className="text-[13.5px] text-[var(--ink-dim)] mb-1">{artist.tagline}</p>
              <p className="text-[12.5px] text-[var(--ink-faint)] mb-2">
                {categoryLabel(artist.category)} · {artist.city}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {artist.subcategory && (
                  <span className="text-[11px] font-semibold text-[var(--blue-dark)] bg-[var(--blue-soft)] border border-[var(--blue-mid)] px-2.5 py-1 rounded-full">
                    {artist.subcategory}
                  </span>
                )}
                {artist.gender && (
                  <span className="text-[11px] font-medium text-[var(--ink-dim)] bg-white border border-[var(--line)] px-2.5 py-1 rounded-full capitalize">
                    {artist.gender}
                  </span>
                )}
                {artist.nationality && (
                  <span className="text-[11px] font-medium text-[var(--ink-dim)] bg-white border border-[var(--line)] px-2.5 py-1 rounded-full">
                    🌍 {artist.nationality}
                  </span>
                )}
              </div>

              <ShareButton
                path={`/artists/${artist.slug}`}
                title={`${artist.name} on UAESinger`}
                className="w-full mb-4 py-2 rounded-lg border border-[var(--line)] text-[13px] font-semibold text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all"
              />

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
                  {enquiry === "sent" ? (
                    <p className="w-full mt-3 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[12.5px] font-semibold text-center">
                      Enquiry sent — {artist.name.split(" ")[0]} will be in touch.
                    </p>
                  ) : (
                    <details className="mt-3 group">
                      <summary className="w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm text-center cursor-pointer list-none">
                        Request booking
                      </summary>
                      <form action={requestBooking} className="mt-3 flex flex-col gap-2.5 text-left">
                        <input type="hidden" name="slug" value={artist.slug} />
                        <input type="hidden" name="artistId" value={artist.id} />
                        <input name="hirer_name" required placeholder="Your name" className={enquiryInput} />
                        <input name="hirer_phone" placeholder="Your phone (optional)" className={enquiryInput} />
                        <input name="event_date" type="date" className={enquiryInput} />
                        <textarea name="message" rows={3} placeholder="Event details — date, venue, what you need." className={`${enquiryInput} resize-y`} />
                        <button type="submit" className="py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13px] font-semibold hover:bg-[var(--blue-dark)] transition-all">
                          Send enquiry
                        </button>
                      </form>
                    </details>
                  )}
                  <p className="text-[11px] text-[var(--ink-faint)] text-center mt-2">
                    {FREE_MODE ? "Contact revealed — free during launch." : `Unlocked with your ${planInfo?.label ?? "plan"}.`}
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

                  {canReveal && !limitReached ? (
                    // Signed in (FREE_MODE) or active plan with credits — reveal.
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
                        {FREE_MODE
                          ? "Free during launch — no subscription needed"
                          : remaining === null
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
                  ) : FREE_MODE ? (
                    // Free during launch — just sign in to reveal.
                    <>
                      <p className="text-[12.5px] text-[var(--ink-dim)] mb-3">
                        Sign in to reveal this artist&apos;s direct contact — free during launch.
                      </p>
                      <Link
                        href={`/signin?next=/artists/${artist.slug}`}
                        className="block w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
                      >
                        Sign in to reveal
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

const enquiryInput =
  "px-3 py-2 rounded-lg border border-[var(--line)] text-[13px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

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
