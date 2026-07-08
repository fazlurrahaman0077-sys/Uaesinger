import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, EMIRATES } from "@/lib/artists";
import { createClient } from "@/lib/supabase/server";
import { createArtist } from "./actions";

export const metadata: Metadata = {
  title: "Create your artist profile | UAESinger",
  description: "List yourself on UAESinger and get booked by clients across the UAE.",
};

const AVAILABILITY = ["Available now", "Booking 2 weeks out", "Limited dates"];

export default async function NewArtistPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/artists/new");

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[720px] mx-auto px-5 py-12">
          <Link href="/artists" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">
            ← Back to talent
          </Link>

          <div className="mt-5 mb-8">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--blue-dark)] mb-2">
              For artists
            </p>
            <h1 className="font-display text-[32px] sm:text-[38px] font-semibold text-[var(--ink)] mb-2">
              Create your profile
            </h1>
            <p className="text-[14px] text-[var(--ink-dim)]">
              Listing is free. Clients subscribe to reach you — your contact details stay private until then.
            </p>
          </div>

          {error && (
            <p className="mb-5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error === "missing"
                ? "Please fill in your name, city and category."
                : "Something went wrong saving your profile. Please try again."}
            </p>
          )}

          <form action={createArtist} className="flex flex-col gap-6">
            <Section title="Basics">
              <Field name="name" label="Stage / act name" required placeholder="e.g. Layla Hassan" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Select name="category" label="Category" required options={CATEGORIES.map((c) => ({ value: c.slug, label: `${c.emoji} ${c.label}` }))} />
                <Select name="city" label="Based in" required options={EMIRATES.map((e) => ({ value: e, label: e }))} />
              </div>
              <Field name="tagline" label="One-line tagline" placeholder="e.g. Wedding & jazz vocalist" />
              <Textarea name="bio" label="About you" placeholder="Tell clients about your experience, style and what you offer." />
            </Section>

            <Section title="Details">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="languages" label="Languages" placeholder="English, Arabic" hint="Comma separated" />
                <Field name="genres" label="Styles / genres" placeholder="Jazz, Arabic, Pop" hint="Comma separated" />
              </div>
              <Select name="availability" label="Availability" options={AVAILABILITY.map((a) => ({ value: a, label: a }))} />
              <div>
                <p className="text-[12.5px] font-semibold text-[var(--ink)] mb-1.5">
                  Price range <span className="text-[var(--ink-faint)] font-normal">(AED, shown on your profile)</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Field name="price_min" label="From" type="number" placeholder="3000" />
                  <Field name="price_max" label="To" type="number" placeholder="6000" />
                </div>
              </div>
            </Section>

            <Section title="Private contact — shown only to subscribed clients">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field name="phone" label="Phone" placeholder="+971 50 000 0000" />
                <Field name="whatsapp" label="WhatsApp" placeholder="+971 50 000 0000" />
              </div>
              <Field name="email" label="Email" type="email" placeholder="you@example.com" />
            </Section>

            <button
              type="submit"
              className="mt-2 py-3 rounded-lg bg-[var(--blue)] text-white text-[14.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
            >
              Publish my profile
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white border border-[var(--line)] rounded-2xl p-6 flex flex-col gap-4">
      <legend className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] px-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">
        {label} {required && <span className="text-[var(--blue)]">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all"
      />
      {hint && <span className="text-[11px] text-[var(--ink-faint)]">{hint}</span>}
    </label>
  );
}

function Textarea({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <textarea
        name={name}
        rows={4}
        placeholder={placeholder}
        className="px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all resize-y"
      />
    </label>
  );
}

function Select({
  name,
  label,
  required,
  options,
}: {
  name: string;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">
        {label} {required && <span className="text-[var(--blue)]">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all bg-white"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
