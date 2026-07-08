import Link from "next/link";
import Logo from "@/components/Logo";
import { CATEGORIES } from "@/lib/artists";

const PLATFORM = [
  { label: "Browse talent", href: "/artists" },
  { label: "Pricing", href: "/pricing" },
  { label: "For artists", href: "/artists/new" },
  { label: "Blog", href: "/blog" },
  { label: "Sign in", href: "/signin" },
];

const CITIES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg2)] border-t border-[var(--line)] pt-14 pb-8 px-5">
      <div className="max-w-[1180px] mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <Logo size={30} />
            </div>
            <p className="text-[12.5px] text-[var(--ink-dim)] leading-relaxed max-w-[240px]">
              The UAE&apos;s directory for booking verified singers, DJs, bands, MCs, photographers and entertainers — for events and full-time roles.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-4">Platform</h4>
            {PLATFORM.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block text-[13px] text-[var(--ink-dim)] mb-2.5 hover:text-[var(--blue-dark)] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-4">Categories</h4>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/artists?category=${c.slug}`}
                className="block text-[13px] text-[var(--ink-dim)] mb-2.5 hover:text-[var(--blue-dark)] transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-4">Cities</h4>
            {CITIES.map((l) => (
              <Link key={l} href="/artists" className="block text-[13px] text-[var(--ink-dim)] mb-2.5 hover:text-[var(--blue-dark)] transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* SEO text */}
        <div className="border-t border-[var(--line)] pt-6 mb-5 text-[11.5px] text-[var(--ink-faint)] leading-relaxed">
          UAESinger.com is the UAE&apos;s directory for hiring{" "}
          {["singers", "DJs", "bands", "MCs", "event hosts", "photographers", "entertainers"].map((w, i, arr) => (
            <span key={w}>
              <strong className="text-[var(--ink-dim)]">{w}</strong>
              {i < arr.length - 1 ? ", " : " "}
            </span>
          ))}
          in{" "}
          {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map((c, i, arr) => (
            <span key={c}>
              <strong className="text-[var(--ink-dim)]">{c}</strong>
              {i < arr.length - 1 ? ", " : " "}
            </span>
          ))}
          for weddings, corporate events, and permanent hiring.
        </div>

        {/* Bottom */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-[var(--ink-faint)]">
          <span>© 2026 UAESinger. Booking talent across the Emirates.</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-[var(--ink-dim)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--ink-dim)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--ink-dim)] transition-colors">Contact</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
