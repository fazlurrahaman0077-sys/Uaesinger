"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Browse talent", href: "#talent" },
  { label: "For artists", href: "#artists" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id.replace("#", ""));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--line)]">
        <div className="max-w-[1180px] mx-auto px-5 flex items-center justify-between h-[60px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--blue)] to-[var(--blue-deep)] flex items-center justify-center text-white text-[13px] font-bold font-sans">
              US
            </span>
            <span className="font-display text-[20px] font-bold text-[var(--ink)]">
              UAE<span className="text-[var(--blue)]">Singer</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => scrollTo(n.href)}
                className="text-[13.5px] text-[var(--ink-dim)] font-medium hover:text-[var(--ink)] transition-colors cursor-pointer bg-transparent border-none"
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <button className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] hover:bg-[var(--blue-soft)] transition-all">
              Sign in
            </button>
            <button className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)] transition-all shadow-sm">
              Join as artist
            </button>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col gap-[5px] p-1 rounded cursor-pointer bg-transparent border-none"
            aria-label="Toggle menu"
          >
            <span className={`block w-[22px] h-[2px] bg-[var(--ink)] rounded transition-all duration-200 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-[22px] h-[2px] bg-[var(--ink)] rounded transition-all duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block w-[22px] h-[2px] bg-[var(--ink)] rounded transition-all duration-200 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 bg-white border-b border-[var(--line)] shadow-lg px-5 py-4 flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => scrollTo(n.href)}
              className="text-left text-[15px] text-[var(--ink-dim)] font-medium py-3 border-b border-[var(--line)] last:border-0 hover:text-[var(--ink)] cursor-pointer bg-transparent border-x-0 border-t-0 w-full"
            >
              {n.label}
            </button>
          ))}
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2.5 rounded-lg border border-[var(--line)] text-[13.5px] font-semibold text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all">
              Sign in
            </button>
            <button className="flex-1 py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all">
              Join as artist
            </button>
          </div>
        </div>
      )}
    </>
  );
}
