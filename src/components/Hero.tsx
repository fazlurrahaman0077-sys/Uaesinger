import Link from "next/link";
import SoundBars from "@/components/SoundBars";

// Signature hero: a darkened stage with an amber spotlight bloom behind a
// Fraunces marquee headline, and a live equalizer as the "on air" indicator.
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--stage)] text-white">
      {/* Spotlight bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 22% -10%, rgba(245,166,35,0.30), transparent 55%), radial-gradient(90% 70% at 90% 0%, rgba(90,46,134,0.55), transparent 60%)",
        }}
      />
      <div className="relative max-w-[1180px] mx-auto px-5 pt-16 sm:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-14 items-center">
        {/* Copy */}
        <div className="bloom">
          <div className="flex items-center gap-2.5 mb-6">
            <SoundBars bars={5} height={16} size={3} gap={2} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--amber)]">
              Live entertainment · every Emirate
            </span>
          </div>

          <h1 className="font-display text-[clamp(34px,5.4vw,64px)] font-semibold leading-[1.02] tracking-[-0.01em] text-white mb-6">
            Hire the UAE&apos;s most{" "}
            <span className="italic font-medium text-[var(--amber)]">unforgettable</span>{" "}
            live performers
          </h1>

          <p className="text-[15px] sm:text-[17px] text-white/70 leading-relaxed mb-8 max-w-[480px]">
            Singers, DJs, live bands, drum &amp; lyre corps and entertainers — verified, reviewed and
            ready to book for weddings, launches and national days across Dubai, Abu Dhabi, Sharjah and beyond.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link
              href="/artists"
              className="px-6 py-3.5 rounded-full bg-[var(--amber)] text-[var(--stage)] text-[14.5px] font-bold shadow-[0_16px_40px_rgba(245,166,35,0.35)] hover:shadow-[0_20px_50px_rgba(245,166,35,0.5)] hover:-translate-y-0.5 transition-all"
            >
              Browse talent →
            </Link>
            <Link
              href="/artists/new"
              className="px-6 py-3.5 rounded-full border border-white/25 text-white text-[14.5px] font-semibold hover:bg-white/10 hover:border-white/40 transition-all"
            >
              List your act
            </Link>
          </div>

          <p className="text-[12.5px] text-white/45">
            Popular:{" "}
            <Link href="/artists?category=singers" className="text-white/75 font-medium hover:text-[var(--amber)] transition-colors">wedding singers Dubai</Link>
            {" · "}
            <Link href="/artists?category=djs-bands" className="text-white/75 font-medium hover:text-[var(--amber)] transition-colors">DJs Abu Dhabi</Link>
            {" · "}
            <Link href="/artists?category=drum-lyre" className="text-white/75 font-medium hover:text-[var(--amber)] transition-colors">drum &amp; lyre corps</Link>
          </p>
        </div>

        {/* Preview card — lit against the dark stage */}
        <div className="relative max-w-[440px] mx-auto lg:mx-0 w-full">
          <div className="bg-white text-[var(--ink)] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 overflow-hidden">
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-[var(--line)]">
              <span className="w-2 h-2 rounded-full bg-[var(--line)]" />
              <span className="w-2 h-2 rounded-full bg-[var(--line)]" />
              <span className="w-2 h-2 rounded-full bg-[var(--line)]" />
              <span className="ml-2 text-[10.5px] text-[var(--ink-faint)]">uaesinger.com/layla-hassan</span>
            </div>

            <div className="aspect-[16/10] bg-[var(--blue-deep)] relative flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/creators/singers-1.jpg" alt="Live performer reel" className="absolute inset-0 w-full h-full object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "radial-gradient(80% 60% at 50% 0%, rgba(245,166,35,0.25), transparent 60%)" }}
              />
              <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[var(--stage)] bg-[var(--amber)] px-2.5 py-1 rounded-full">
                <SoundBars bars={3} height={9} size={2} gap={1.5} color="var(--stage)" /> Live reel
              </span>
              <div className="relative w-14 h-14 rounded-full bg-white shadow-[0_6px_24px_rgba(0,0,0,0.35)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--blue)">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="font-display text-[18px] font-semibold text-[var(--ink)]">Layla Hassan</span>
                <span className="text-[13px] text-[var(--gold)] font-bold">★ 4.9</span>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                {["Wedding vocalist", "Dubai", "142 gigs"].map((t) => (
                  <span key={t} className="text-[11px] text-[var(--blue-dark)] bg-[var(--blue-soft)] px-2.5 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between bg-[var(--bg2)] border border-[var(--line)] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 text-[12px] text-[var(--ink-dim)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Contact locked
                </div>
                <Link
                  href="/artists"
                  className="text-[11px] font-bold text-white bg-[var(--blue)] px-3 py-1.5 rounded-md hover:bg-[var(--blue-dark)] transition-colors"
                >
                  Unlock
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
