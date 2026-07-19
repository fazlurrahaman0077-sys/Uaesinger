import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { requireAdmin } from "@/lib/admin";
import { CATEGORIES, EMIRATES } from "@/lib/artists";
import { adminUpdateArtist } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Edit listing | UAESinger admin" };

const AVAILABILITY = ["Available now", "Booking 2 weeks out", "Limited dates"];

export default async function AdminEditArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  // artists_admin_all / contacts_admin_all let an admin read any listing,
  // published or not, plus its private contact row.
  const [{ data: a }, { data: c }] = await Promise.all([
    supabase.from("artists").select("*").eq("id", id).maybeSingle(),
    supabase.from("artist_contacts").select("phone, whatsapp, email").eq("artist_id", id).maybeSingle(),
  ]);
  if (!a) notFound();

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[820px] mx-auto px-5 py-10">
          <Link href="/admin" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">← Back to admin</Link>
          <div className="flex items-center gap-3 mt-4 mb-2">
            <h1 className="font-display text-[28px] font-semibold text-[var(--ink)]">Edit {a.name}</h1>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${a.is_published ? "bg-green-50 text-green-700" : "bg-[var(--bg3)] text-[var(--ink-faint)]"}`}>
              {a.is_published ? "Live" : "Hidden"}
            </span>
          </div>
          <p className="text-[13px] text-[var(--ink-dim)] mb-6">
            Moderating as admin — edits apply to the creator&apos;s live listing. The contact-details rule is
            enforced here too, so you can clean copy but not paste contact info into it.
          </p>

          <form action={adminUpdateArtist} className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
            <input type="hidden" name="id" value={a.id} />
            {error && (
              <p className="text-[13px] text-[var(--coral)] bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                {error === "phone"
                  ? "Contact numbers must be UAE numbers (e.g. +971 50 123 4567)."
                  : error === "leak"
                    ? "Profile text can't contain phone numbers, emails, links or social handles."
                    : "Nothing was saved — a required field was missing."}
              </p>
            )}

            <Field name="name" label="Name" defaultValue={a.name} />
            <Field name="tagline" label="Tagline" defaultValue={a.tagline ?? ""} />
            <Textarea name="bio" label="Description / About" defaultValue={a.bio ?? ""} rows={6} />

            <div className="grid sm:grid-cols-2 gap-3">
              <Select name="category_slug" label="Category" defaultValue={a.category_slug} options={CATEGORIES.map((x) => x.slug)} />
              <Select name="city" label="City" defaultValue={a.city} options={[...EMIRATES]} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field name="subcategory" label="Subcategory" defaultValue={a.subcategory ?? ""} />
              <Select name="availability" label="Availability" defaultValue={a.availability} options={AVAILABILITY} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field name="languages" label="Languages" defaultValue={(a.languages ?? []).join(", ")} hint="Comma separated" />
              <Field name="genres" label="Styles" defaultValue={(a.genres ?? []).join(", ")} hint="Comma separated" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field name="skills" label="Skills" defaultValue={(a.skills ?? []).join(", ")} hint="Comma separated" />
              <Field name="tags" label="Good for" defaultValue={(a.tags ?? []).join(", ")} hint="Comma separated" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field name="price_min" label="Price from (AED)" type="number" defaultValue={a.price_min ?? ""} />
              <Field name="price_max" label="Price to (AED)" type="number" defaultValue={a.price_max ?? ""} />
              <Field name="experience_years" label="Experience (yrs)" type="number" defaultValue={a.experience_years ?? ""} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field name="gender" label="Gender" defaultValue={a.gender ?? ""} />
              <Field name="nationality" label="Nationality" defaultValue={a.nationality ?? ""} />
            </div>

            <div className="border-t border-[var(--line)] pt-4 flex flex-col gap-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">
                Private contact — never shown publicly
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field name="phone" label="Phone" defaultValue={c?.phone ?? ""} />
                <Field name="whatsapp" label="WhatsApp" defaultValue={c?.whatsapp ?? ""} />
              </div>
              <Field name="email" label="Email" type="email" defaultValue={c?.email ?? ""} />
            </div>

            <label className="flex items-center gap-2.5 text-[13px] font-semibold text-[var(--ink)]">
              <input type="checkbox" name="is_published" defaultChecked={a.is_published} className="w-4 h-4 accent-[var(--blue)]" />
              Listing is live (visible in search)
            </label>

            <button type="submit" className="py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all">
              Save changes
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

const input =
  "px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={input} />
      {hint && <span className="text-[11px] text-[var(--ink-faint)]">{hint}</span>}
    </label>
  );
}

// Native select — this form is server-rendered, so no client component needed
// (matches the dashboard's own editor).
function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <select name={name} defaultValue={defaultValue} className={input}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ name, label, defaultValue, rows = 4 }: { name: string; label: string; defaultValue?: string; rows?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue} className={`${input} resize-y`} />
    </label>
  );
}
