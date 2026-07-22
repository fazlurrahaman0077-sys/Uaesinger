import Link from "next/link";
import ArtistCard from "@/components/ArtistCard";
import Reveal from "@/components/Reveal";
import SoundBars from "@/components/SoundBars";
import { CATEGORIES } from "@/lib/artists";
import { listArtists } from "@/lib/talent";

export default async function ArtistGrid() {
  const all = await listArtists();
  const featured = all.slice(0, 6);

  return (
    <div id="talent">
      {/* Category tabs — link into the real directory */}
      <div className="max-w-[980px] mx-auto py-12 px-5 flex flex-wrap gap-2 justify-center">
        <Link
          href="/artists"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border border-[var(--blue)] bg-[var(--blue)] text-white shadow-[0_4px_12px_rgba(90,46,134,0.25)] transition-all"
        >
          ✦ All talent
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/artists?category=${cat.slug}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)] hover:text-[var(--ink)] transition-all"
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <section className="px-5 pb-20">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-start justify-between mb-7 gap-4">
            <div>
              <h2 className="font-display text-[26px] font-semibold text-[var(--ink)] mb-1">
                Featured talent
              </h2>
              <p className="text-[13.5px] text-[var(--ink-dim)]">
                Verified profiles with strong recent reviews and high response rates.
              </p>
            </div>
            <Link
              href="/artists"
              className="text-[13px] text-[var(--blue-dark)] font-semibold whitespace-nowrap hover:underline flex-shrink-0 mt-1"
            >
              View all →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="border border-dashed border-[var(--blue-mid)] rounded-2xl py-16 text-center bg-[var(--bg2)]">
              <div className="flex justify-center mb-4">
                <SoundBars bars={7} height={26} size={3} gap={2.5} color="var(--blue)" />
              </div>
              <p className="font-display text-[20px] font-semibold text-[var(--ink)] mb-2">
                The stage is empty — for now
              </p>
              <p className="text-[13.5px] text-[var(--ink-dim)] mb-5">
                Verified artists across the UAE are joining. Be one of the first.
              </p>
              <Link
                href="/artists/new"
                className="inline-block py-2.5 px-6 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
              >
                Create your profile →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((a, i) => (
                <Reveal key={a.slug} delay={i * 80}>
                  <ArtistCard artist={a} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
