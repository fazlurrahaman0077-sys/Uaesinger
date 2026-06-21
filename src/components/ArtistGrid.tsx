"use client";

import { useState } from "react";

const CATEGORIES = ["🎤 Singers", "🎵 DJs & bands", "💃 Dancers", "✨ MCs & hosts", "📷 Photographers", "🎭 Entertainers"];

const ARTISTS = [
  { name: "Layla Hassan", role: "Wedding vocalist, Dubai", rating: 4.9, gigs: 142, tag: "Top rated" },
  { name: "The Sandstorm Trio", role: "Live band, Abu Dhabi", rating: 4.8, gigs: 96, tag: "Available now" },
  { name: "Karim Aziz", role: "Wedding & corporate MC, Sharjah", rating: 5.0, gigs: 211, tag: "Top rated" },
  { name: "Nadia Rivera", role: "Contemporary dancer, Dubai", rating: 4.7, gigs: 64, tag: "New this month" },
  { name: "Omar Faris", role: "Event photographer, Dubai", rating: 4.9, gigs: 188, tag: "Top rated" },
  { name: "Yasmin Khoury", role: "Oud & vocal duo, Ras Al Khaimah", rating: 4.8, gigs: 73, tag: "Available now" },
];

export default function ArtistGrid() {
  const [active, setActive] = useState(0);

  return (
    <div id="talent">
      {/* Category tabs */}
      <div className="py-12 px-5 flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActive(i)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium border transition-all cursor-pointer ${
              active === i
                ? "border-[var(--blue)] bg-[var(--blue)] text-white shadow-[0_4px_12px_rgba(43,127,214,0.25)]"
                : "border-[var(--line)] bg-white text-[var(--ink-dim)] hover:border-[var(--blue-mid)] hover:text-[var(--ink)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <section className="px-5 pb-20">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-start justify-between mb-7 gap-4">
            <div>
              <h2 className="font-display text-[26px] font-semibold text-[var(--ink)] mb-1">
                Featured talent this week
              </h2>
              <p className="text-[13.5px] text-[var(--ink-dim)]">
                Hand-picked profiles with strong recent reviews and high response rates.
              </p>
            </div>
            <button className="text-[13px] text-[var(--blue-dark)] font-semibold whitespace-nowrap hover:underline bg-transparent border-none cursor-pointer flex-shrink-0 mt-1">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
            {ARTISTS.map((a) => (
              <div
                key={a.name}
                className="bg-white border border-[var(--line)] rounded-xl overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,26,38,0.10)] transition-all duration-200"
              >
                {/* Media */}
                <div className="relative aspect-[4/5] bg-gradient-to-br from-[var(--blue-soft)] to-[var(--blue-mid)] flex items-center justify-center">
                  <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase text-white bg-[var(--blue)] px-2.5 py-1 rounded-md">
                    {a.tag}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(43,127,214,0.22)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#2B7FD6">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 pt-10 pb-2 px-3 bg-gradient-to-t from-[rgba(207,227,247,0.9)] to-transparent">
                    <span className="text-[10.5px] font-semibold text-[var(--blue-deep)]">60-second reel</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 border-t border-[var(--line)]">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-display text-[16px] font-semibold text-[var(--ink)]">{a.name}</span>
                    <span className="text-[12px] text-[var(--gold)] font-bold ml-2 flex-shrink-0">★ {a.rating}</span>
                  </div>
                  <p className="text-[12.5px] text-[var(--ink-dim)] mb-2">{a.role}</p>
                  <p className="text-[11.5px] text-[var(--ink-faint)]">{a.gigs} gigs completed</p>
                  <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center gap-1.5 text-[11.5px] text-[var(--ink-faint)] font-medium">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Contact unlocks with a subscription
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
