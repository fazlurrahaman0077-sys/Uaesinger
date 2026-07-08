import Link from "next/link";
import SoundBars from "@/components/SoundBars";

// Closing bookend — echoes the hero stage so the page opens and closes under
// the same spotlight.
export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--stage)] text-white px-5 py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 90% at 50% -20%, rgba(245,166,35,0.28), transparent 55%), radial-gradient(70% 60% at 50% 120%, rgba(90,46,134,0.6), transparent 60%)",
        }}
      />
      <div className="relative max-w-[620px] mx-auto text-center">
        <div className="flex justify-center mb-6">
          <SoundBars bars={7} height={28} size={3} gap={2.5} />
        </div>
        <h2 className="font-display text-[clamp(28px,4.4vw,46px)] font-semibold leading-[1.05] tracking-[-0.01em] mb-4">
          The stage is yours.
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/65 leading-relaxed mb-9 max-w-[440px] mx-auto">
          Book verified performers across every Emirate, or list your act and get discovered by the
          UAE&apos;s event planners, hotels and couples.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/artists"
            className="px-7 py-3.5 rounded-full bg-[var(--amber)] text-[var(--stage)] text-[14.5px] font-bold shadow-[0_16px_40px_rgba(245,166,35,0.35)] hover:shadow-[0_20px_50px_rgba(245,166,35,0.5)] hover:-translate-y-0.5 transition-all"
          >
            Browse talent →
          </Link>
          <Link
            href="/artists/new"
            className="px-7 py-3.5 rounded-full border border-white/25 text-white text-[14.5px] font-semibold hover:bg-white/10 hover:border-white/40 transition-all"
          >
            Join as artist
          </Link>
        </div>
      </div>
    </section>
  );
}
