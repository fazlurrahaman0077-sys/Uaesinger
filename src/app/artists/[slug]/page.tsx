import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, categoryLabel, artistHero, priceRange } from "@/lib/artists";
import { getAccess, isArtistLiked } from "@/lib/subscription";
import LikeButton from "@/components/LikeButton";
import { getArtistBySlug } from "@/lib/talent";
import { listArtistVideos } from "@/lib/videos";
import { listArtistPhotos } from "@/lib/photos";
import ShareButton from "@/components/ShareButton";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import EnquiryForm from "@/components/EnquiryForm";

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const emoji = CATEGORIES.find((c) => c.slug === artist.category)?.emoji ?? "★";

  // Contacts are confidential: the hirer sends an enquiry, the artist chooses to
  // share their card back (seen in the hirer's dashboard). No phone on the page.
  // Fan these out in parallel — they're independent, so the page renders faster.
  const [{ user }, liked, videos, photos] = await Promise.all([
    getAccess(),
    isArtistLiked(artist.id),
    listArtistVideos(artist.id),
    listArtistPhotos(artist.id),
  ]);

  const base = SITE_URL;
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

              <div className="flex items-center gap-2 mb-4">
                <ShareButton
                  path={`/artists/${artist.slug}`}
                  title={`${artist.name} on UAESinger`}
                  className="flex-1 py-2 rounded-lg border border-[var(--line)] text-[13px] font-semibold text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all"
                />
                <LikeButton artistId={artist.id} initialCount={artist.likesCount} initialLiked={liked} size="lg" />
              </div>

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
                Book {artist.name.split(" ")[0]}
              </p>

              <div className="border border-[var(--line)] rounded-lg p-4 bg-[var(--bg2)]">
                {user ? (
                  <EnquiryForm artistId={artist.id} firstName={artist.name.split(" ")[0]} />
                ) : (
                  <>
                    <p className="text-[12.5px] text-[var(--ink-dim)] mb-3">
                      Sign in to send {artist.name.split(" ")[0]} a booking enquiry — free during launch.
                    </p>
                    <Link
                      href={`/signin?next=/artists/${artist.slug}`}
                      className="block w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm text-center"
                    >
                      Sign in to book
                    </Link>
                  </>
                )}
                <p className="text-[11px] text-[var(--ink-faint)] text-center mt-2">
                  Contacts stay confidential — shared only when the artist agrees.
                </p>
              </div>
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
