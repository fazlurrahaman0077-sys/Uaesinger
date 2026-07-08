"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

type Mode = "signin" | "signup";

// Magic-link flow: works with Supabase's built-in email (no SMTP / no template
// edits). The user gets a one-time sign-in link; clicking it hits /auth/callback
// which exchanges the code for a session.
export default function AuthForm({ mode }: { mode: Mode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const next = new URLSearchParams(window.location.search).get("next") || "/artists";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: isSignup ? { full_name: name } : undefined,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-16 bg-[var(--bg2)]">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Logo size={34} />
        </div>

        <div className="bg-white border border-[var(--line)] rounded-2xl p-7 shadow-[0_16px_40px_rgba(16,26,38,0.06)]">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--blue-soft)] border border-[var(--blue-mid)] flex items-center justify-center mx-auto mb-4 text-[var(--blue-dark)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 5L2 7" />
                </svg>
              </div>
              <h1 className="font-display text-[22px] font-semibold text-[var(--ink)] mb-2">Check your email</h1>
              <p className="text-[13.5px] text-[var(--ink-dim)] mb-1">
                We sent a one-time sign-in link to
              </p>
              <p className="text-[14px] font-semibold text-[var(--ink)] mb-5">{email}</p>
              <p className="text-[12.5px] text-[var(--ink-faint)] mb-5">
                Click the link in that email to finish signing in. It expires shortly, so use it soon.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-[12.5px] text-[var(--blue-dark)] font-semibold hover:underline"
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[24px] font-semibold text-[var(--ink)] mb-1">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-[13.5px] text-[var(--ink-dim)] mb-6">
                {isSignup
                  ? "Join UAESinger — no password, we'll email you a sign-in link."
                  : "Sign in with a one-time link sent to your email."}
              </p>

              <form onSubmit={sendLink} className="flex flex-col gap-3.5">
                {isSignup && (
                  <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Your name" required />
                )}
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  required
                />
                {error && (
                  <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full py-2.5 rounded-lg bg-[var(--blue)] text-white text-[14px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Email me a sign-in link"}
                </button>
              </form>

              <p className="text-[13px] text-[var(--ink-dim)] text-center mt-5">
                {isSignup ? "Already have an account? " : "New to UAESinger? "}
                <Link
                  href={isSignup ? "/signin" : "/signup"}
                  className="text-[var(--blue-dark)] font-semibold hover:underline"
                >
                  {isSignup ? "Sign in" : "Create one"}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all"
      />
    </label>
  );
}
