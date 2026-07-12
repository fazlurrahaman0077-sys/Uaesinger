import Link from "next/link";
import { type Artist, categoryLabel, artistImage, priceRange } from "@/lib/artists";
import { CATEGORIES } from "@/lib/artists";

function emojiFor(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.emoji ?? "★";
}

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="bg-white border border-[var(--line)] rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,26,38,0.10)] transition-all duration-200 flex flex-col"
    >
      {/* Creator image */}
      <div className="relative aspect-[4/5] bg-[var(--blue-soft)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artistImage(artist.slug, artist.category, artist.photoPath)}
          alt={`${artist.name} — ${categoryLabel(artist.category)}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        {artist.featuredTag && (
          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase text-white bg-[var(--blue)] px-2.5 py-1 rounded-md shadow-sm">
            {artist.featuredTag}
          </span>
        )}
        <span className="absolute bottom-3 left-3 text-[10.5px] font-semibold text-white bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-md">
          {emojiFor(artist.category)} {categoryLabel(artist.category)} · {artist.city}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 border-t border-[var(--line)] flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <span className="font-display text-[16px] font-semibold text-[var(--ink)]">{artist.name}</span>
          <span className="text-[12px] text-[var(--gold)] font-bold ml-2 flex-shrink-0">★ {artist.rating}</span>
        </div>
        <p className="text-[12.5px] text-[var(--ink-dim)] mb-2">
          {artist.subcategory || artist.tagline}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11.5px] text-[var(--ink-faint)]">{artist.gigs} gigs · {artist.reviews} reviews</p>
          {priceRange(artist.priceMin, artist.priceMax) && (
            <p className="text-[11.5px] font-semibold text-[var(--ink)] whitespace-nowrap">
              {priceRange(artist.priceMin, artist.priceMax)}
            </p>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between">
          <span className="text-[11.5px] font-medium text-[var(--ink-dim)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {artist.availability}
          </span>
          <span className="text-[11.5px] font-semibold text-[var(--blue-dark)] group-hover:underline">
            View profile →
          </span>
        </div>
      </div>
    </Link>
  );
}
