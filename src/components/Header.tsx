"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

const NAV = [
  { label: "Browse talent", href: "/artists" },
  { label: "Pricing", href: "/pricing" },
  { label: "For artists", href: "/artists/new" },
  { label: "Blog", href: "/blog" },
];

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--line)]">
        <div className="max-w-[1180px] mx-auto px-5 flex items-center justify-between h-[60px] gap-4">
          <Logo size={32} />

          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="text-[13.5px] text-[var(--ink-dim)] font-medium hover:text-[var(--ink)] transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {email ? (
              <>
                <span
                  title={email}
                  className="w-8 h-8 rounded-full bg-[var(--blue-soft)] border border-[var(--blue-mid)] flex items-center justify-center text-[12px] font-bold text-[var(--blue-dark)] uppercase"
                >
                  {email[0]}
                </span>
                <button
                  onClick={signOut}
                  className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] hover:bg-[var(--blue-soft)] transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/artists/new"
                  className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)] transition-all shadow-sm"
                >
                  Join as artist
                </Link>
              </>
            )}
          </div>

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

      {open && (
        <div className="md:hidden fixed top-[60px] left-0 right-0 z-40 bg-white border-b border-[var(--line)] shadow-lg px-5 py-4 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              onClick={() => setOpen(false)}
              className="text-left text-[15px] text-[var(--ink-dim)] font-medium py-3 border-b border-[var(--line)] last:border-0 hover:text-[var(--ink)]"
            >
              {n.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3">
            {email ? (
              <button
                onClick={signOut}
                className="flex-1 py-2.5 rounded-lg border border-[var(--line)] text-[13.5px] font-semibold text-[var(--ink)] text-center hover:border-[var(--blue)] transition-all"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--line)] text-[13.5px] font-semibold text-[var(--ink)] text-center hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/artists/new"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold text-center hover:bg-[var(--blue-dark)] transition-all"
                >
                  Join as artist
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
