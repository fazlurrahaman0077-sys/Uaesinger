import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtistCard from "@/components/ArtistCard";
import { CATEGORIES, SUBCATEGORIES, getCategory } from "@/lib/artists";
import { listArtists } from "@/lib/talent";
import FilterBar from "@/components/FilterBar";

export const metadata: Metadata = {
  title: "Browse & search talent | UAESinger",
  description:
    "Search verified singers, DJs, bands, dancers, MCs, magicians, comedians, photographers and entertainers for hire across Dubai, Abu Dhabi, Sharjah and the UAE.",
};

type SP = { category?: string; subcategory?: string; city?: string; gender?: string; q?: string; tag?: string };

function buildHref(base: SP, patch: Partial<SP>): string {
  const merged = { ...base, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
  const s = params.toString();
  return s ? `/artists?${s}` : "/artists";
}

export default async function ArtistsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const active = sp.category && getCategory(sp.category) ? sp.category : "all";
  const subs = active !== "all" ? SUBCATEGORIES[active] ?? [] : [];
  const list = await listArtists({
    category: active,
    subcategory: sp.subcategory,
    city: sp.city,
    gender: sp.gender,
    tag: sp.tag,
    q: sp.q,
  });

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <section className="px-5 pt-12 pb-6">
          <div className="max-w-[1180px] mx-auto">
            <h1 className="font-display text-[30px] sm:text-[38px] font-semibold text-[var(--ink)] mb-4">
              Find the perfect act for your event
            </h1>

            <FilterBar
              category={sp.category}
              subcategory={sp.subcategory}
              defaultQ={sp.q ?? ""}
              defaultCity={sp.city ?? ""}
              defaultGender={sp.gender ?? ""}
            />

            <p className="text-[13px] text-[var(--ink-dim)] mt-3">
              {list.length} {list.length === 1 ? "act" : "acts"}
              {active !== "all" ? ` in ${getCategory(active)!.label}` : ""}
              {sp.city ? ` · ${sp.city}` : ""}{sp.gender ? ` · ${sp.gender}` : ""}{sp.q ? ` · “${sp.q}”` : ""}
            </p>
          </div>
        </section>

        {/* Category pills */}
        <section className="px-5 pb-3">
          <div className="max-w-[1180px] mx-auto flex flex-wrap gap-2">
            <CategoryPill href="/artists" label="All" emoji="✦" active={active === "all"} />
            {CATEGORIES.map((c) => (
              <CategoryPill key={c.slug} href={buildHref({}, { category: c.slug })} label={c.label} emoji={c.emoji} active={active === c.slug} />
            ))}
          </div>
        </section>

        {/* Subcategory pills (when a category is active) */}
        {subs.length > 0 && (
          <section className="px-5 pb-6">
            <div className="max-w-[1180px] mx-auto flex flex-wrap gap-1.5">
              <Link href={buildHref({ category: active }, { subcategory: undefined })} className={`text-[12px] px-3 py-1.5 rounded-full border ${!sp.subcategory ? "border-[var(--blue)] bg-[var(--blue-soft)] text-[var(--blue-dark)] font-semibold" : "border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)]"}`}>All {getCategory(active)!.label}</Link>
              {subs.map((s) => (
                <Link key={s} href={buildHref({ category: active }, { subcategory: s })} className={`text-[12px] px-3 py-1.5 rounded-full border ${sp.subcategory === s ? "border-[var(--blue)] bg-[var(--blue-soft)] text-[var(--blue-dark)] font-semibold" : "border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)]"}`}>{s}</Link>
              ))}
            </div>
          </section>
        )}

        <section className="px-5 pb-24">
          <div className="max-w-[1180px] mx-auto">
            {list.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-[22px] font-semibold text-[var(--ink)] mb-2">No acts match your search</p>
                <p className="text-[14px] text-[var(--ink-dim)] mb-6">Try a broader search or clear the filters.</p>
                <Link href="/artists" className="inline-block py-2.5 px-6 rounded-lg bg-[var(--blue)] text-white text-[14px] font-semibold hover:bg-[var(--blue-dark)] transition-all">Clear filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map((a) => <ArtistCard key={a.slug} artist={a} />)}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CategoryPill({ href, label, emoji, active }: { href: string; label: string; emoji: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border transition-all ${
        active
          ? "border-[var(--blue)] bg-[var(--blue)] text-white shadow-[0_4px_12px_rgba(90,46,134,0.25)]"
          : "border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)] hover:text-[var(--ink)]"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </Link>
  );
}
