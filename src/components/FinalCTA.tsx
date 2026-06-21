"use client";

export default function FinalCTA() {
  return (
    <section className="py-20 px-5 text-center">
      <h2 className="font-display text-[clamp(24px,3.2vw,36px)] font-bold text-[var(--ink)] mb-3">
        Your next booking starts with one reel.
      </h2>
      <p className="text-[15px] text-[var(--ink-dim)] max-w-[420px] mx-auto mb-8">
        Join thousands of clients who book with confidence across the UAE.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => document.getElementById("talent")?.scrollIntoView({ behavior: "smooth" })}
          className="px-7 py-3.5 rounded-xl bg-[var(--blue)] text-white text-[14.5px] font-semibold shadow-[0_12px_32px_rgba(43,127,214,0.22)] hover:bg-[var(--blue-dark)] hover:-translate-y-0.5 transition-all cursor-pointer border-none"
        >
          Browse talent →
        </button>
        <button
          onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
          className="px-7 py-3.5 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-[14.5px] font-semibold hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all cursor-pointer"
        >
          View pricing
        </button>
      </div>
    </section>
  );
}
