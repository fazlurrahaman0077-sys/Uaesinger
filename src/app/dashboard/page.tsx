import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/subscription";
import { getPlan } from "@/lib/plans";
import { categoryLabel, priceRange } from "@/lib/artists";
import { listMyEnquiries, listIncomingEnquiries, BOOKING_STATUSES, type Enquiry } from "@/lib/bookings";
import { publicVideoUrl } from "@/lib/videos";
import { updateBookingStatus, updateListing, deleteListing, shareCard } from "./actions";
import { removeVideo } from "./video-actions";
import VideoUploader from "@/components/VideoUploader";
import ShareButton from "@/components/ShareButton";

export const metadata: Metadata = { title: "Dashboard | UAESinger" };

const AVAILABILITY = ["Available now", "Booking 2 weeks out", "Limited dates"];

const statusStyle: Record<string, string> = {
  new: "bg-[var(--blue-soft)] text-[var(--blue-dark)]",
  contacted: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  declined: "bg-[var(--bg3)] text-[var(--ink-faint)]",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { user } = await getAccess();
  if (!user) redirect("/signin?next=/dashboard");

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "hirer";

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[1000px] mx-auto px-5 py-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Avatar seed={user.email ?? user.id} name={profile?.full_name ?? ""} size={52} />
              <div>
                <h1 className="font-display text-[30px] font-semibold text-[var(--ink)]">
                  {profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Dashboard"}
                </h1>
                <p className="text-[13px] text-[var(--ink-dim)] mt-1">
                  {role === "artist" ? "Your listing and incoming enquiries." : "Your plan, unlocked contacts and enquiries."}
                </p>
              </div>
            </div>
            {role === "admin" && (
              <Link href="/admin" className="text-[13px] font-semibold px-4 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--blue)] transition-all">
                Admin panel →
              </Link>
            )}
          </div>

          {saved && (
            <p className="mb-6 text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              Listing saved.
            </p>
          )}

          {role === "artist" ? <CreatorView userId={user.id} /> : <HirerView userId={user.id} />}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ---------------------------------------------------------------- Hirer view
async function HirerView({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { plan, quota, unlocksUsed } = await getAccess();
  const planInfo = getPlan(plan);
  const remaining = quota === null ? null : Math.max(0, quota - unlocksUsed);

  const { data: unlocks } = await supabase.from("contact_unlocks").select("artist_id").eq("user_id", userId);
  const ids = (unlocks ?? []).map((u) => u.artist_id);

  const [{ data: artists }, { data: contacts }, enquiries] = await Promise.all([
    ids.length ? supabase.from("artists").select("id, slug, name, city, category_slug").in("id", ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("artist_contacts").select("artist_id, phone, email, whatsapp").in("artist_id", ids) : Promise.resolve({ data: [] }),
    listMyEnquiries(),
  ]);
  const contactBy = new Map((contacts ?? []).map((c) => [c.artist_id, c]));

  return (
    <div className="flex flex-col gap-10">
      {/* Plan */}
      <section className="bg-white border border-[var(--line)] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-1">Current plan</p>
          <p className="font-display text-[22px] font-semibold text-[var(--ink)]">{planInfo?.label ?? "No plan"}</p>
          <p className="text-[13px] text-[var(--ink-dim)] mt-1">
            {plan
              ? remaining === null
                ? "Unlimited contacts"
                : `${remaining} of ${quota} contacts left this month`
              : "Subscribe to unlock artist contacts."}
          </p>
        </div>
        <Link href="/pricing" className="text-[13px] font-semibold px-5 py-2.5 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)] transition-all">
          {plan ? "Change plan" : "View plans"}
        </Link>
      </section>

      {/* Unlocked contacts */}
      <section>
        <h2 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-4">Unlocked contacts</h2>
        {(artists ?? []).length === 0 ? (
          <Empty>You haven&apos;t unlocked any artists yet. <Link href="/artists" className="text-[var(--blue-dark)] font-semibold hover:underline">Browse talent →</Link></Empty>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {artists!.map((a) => {
              const c = contactBy.get(a.id);
              return (
                <div key={a.id} className="bg-white border border-[var(--line)] rounded-xl p-4">
                  <Link href={`/artists/${a.slug}`} className="font-semibold text-[var(--ink)] hover:text-[var(--blue-dark)]">{a.name}</Link>
                  <p className="text-[12px] text-[var(--ink-faint)] mb-2">{categoryLabel(a.category_slug)} · {a.city}</p>
                  <div className="text-[13px] text-[var(--ink-dim)] flex flex-col gap-0.5">
                    {c?.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="font-semibold text-[var(--ink)] hover:text-[var(--blue-dark)]">{c.phone}</a>}
                    {c?.whatsapp && <a href={`https://wa.me/${c.whatsapp.replace(/[^\d]/g, "")}`} className="hover:underline">WhatsApp: {c.whatsapp}</a>}
                    {c?.email && <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>}
                    {!c?.phone && !c?.email && !c?.whatsapp && <span className="text-[var(--ink-faint)]">No contact details on file.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Enquiries sent */}
      <section>
        <h2 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-4">My enquiries</h2>
        {enquiries.length === 0 ? (
          <Empty>No enquiries sent yet.</Empty>
        ) : (
          <div className="bg-white border border-[var(--line)] rounded-2xl divide-y divide-[var(--line)]">
            {enquiries.map((e) => (
              <div key={e.id} className="px-5 py-3.5 text-[13px]">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/artists/${e.artistSlug}`} className="font-semibold text-[var(--ink)] hover:text-[var(--blue-dark)]">{e.artistName}</Link>
                    <p className="text-[12px] text-[var(--ink-faint)] truncate">
                      {e.eventDate ? `${e.eventDate} · ` : ""}{e.message || "No message"}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                {e.sharedCard && (e.sharedCard.phone || e.sharedCard.whatsapp || e.sharedCard.email) && (
                  <div className="mt-2 pt-2 border-t border-[var(--line)] flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 w-full">✓ {e.artistName.split(" ")[0]} shared their card</span>
                    {e.sharedCard.phone && <a href={`tel:${e.sharedCard.phone.replace(/\s/g, "")}`} className="font-semibold text-[var(--blue-dark)] hover:underline">{e.sharedCard.phone}</a>}
                    {e.sharedCard.whatsapp && <a href={`https://wa.me/${e.sharedCard.whatsapp.replace(/[^\d]/g, "")}`} className="font-semibold text-[var(--blue-dark)] hover:underline">WhatsApp</a>}
                    {e.sharedCard.email && <a href={`mailto:${e.sharedCard.email}`} className="font-semibold text-[var(--blue-dark)] hover:underline">{e.sharedCard.email}</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// -------------------------------------------------------------- Creator view
async function CreatorView({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: artists }, enquiries] = await Promise.all([
    supabase
      .from("artists")
      .select("id, slug, name, city, category_slug, tagline, bio, languages, genres, availability, price_min, price_max, is_published")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
    listIncomingEnquiries(),
  ]);
  const list = artists ?? [];
  const ids = list.map((a) => a.id);
  const { data: contacts } = ids.length
    ? await supabase.from("artist_contacts").select("artist_id, phone, email, whatsapp").in("artist_id", ids)
    : { data: [] };
  const contactBy = new Map((contacts ?? []).map((c) => [c.artist_id, c]));

  const { data: videos } = ids.length
    ? await supabase.from("artist_videos").select("id, artist_id, storage_path, url, title").in("artist_id", ids).order("created_at")
    : { data: [] };
  const videosBy = new Map<string, { id: string; artist_id: string; storage_path: string | null; url: string | null; title: string | null }[]>();
  for (const v of videos ?? []) {
    const arr = videosBy.get(v.artist_id) ?? [];
    arr.push(v);
    videosBy.set(v.artist_id, arr);
  }

  const enquiriesBy = new Map<string, Enquiry[]>();
  for (const e of enquiries) {
    const arr = enquiriesBy.get(e.artistId) ?? [];
    arr.push(e);
    enquiriesBy.set(e.artistId, arr);
  }

  if (list.length === 0) {
    return (
      <Empty>
        You don&apos;t have a listing yet.{" "}
        <Link href="/artists/new" className="text-[var(--blue-dark)] font-semibold hover:underline">Create your profile →</Link>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {list.map((a) => {
        const c = contactBy.get(a.id);
        const inbox = enquiriesBy.get(a.id) ?? [];
        const vids = videosBy.get(a.id) ?? [];
        return (
          <section key={a.id}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 className="font-display text-[20px] font-semibold text-[var(--ink)]">{a.name}</h2>
                <p className="text-[12px] text-[var(--ink-faint)]">{categoryLabel(a.category_slug)} · {a.city} · {priceRange(a.price_min, a.price_max) ?? "No price set"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${a.is_published ? "bg-green-50 text-green-700" : "bg-[var(--bg3)] text-[var(--ink-faint)]"}`}>
                  {a.is_published ? "Live" : "Hidden"}
                </span>
                <ShareButton path={`/artists/${a.slug}`} title={`${a.name} on UAESinger`} className="text-[12px] font-semibold text-[var(--blue-dark)] hover:underline" />
                <Link href={`/artists/${a.slug}`} className="text-[12px] font-semibold text-[var(--blue-dark)] hover:underline">View public page →</Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
              {/* Edit listing */}
              <form action={updateListing} className="bg-white border border-[var(--line)] rounded-2xl p-6 flex flex-col gap-4">
                <input type="hidden" name="artistId" value={a.id} />
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">Edit listing</p>
                <Field name="tagline" label="Tagline" defaultValue={a.tagline ?? ""} />
                <Textarea name="bio" label="About" defaultValue={a.bio ?? ""} />
                <div className="grid grid-cols-2 gap-3">
                  <Field name="languages" label="Languages" defaultValue={(a.languages ?? []).join(", ")} hint="Comma separated" />
                  <Field name="genres" label="Styles" defaultValue={(a.genres ?? []).join(", ")} hint="Comma separated" />
                </div>
                <Select name="availability" label="Availability" defaultValue={a.availability} options={AVAILABILITY} />
                <div className="grid grid-cols-2 gap-3">
                  <Field name="price_min" label="Price from (AED)" type="number" defaultValue={a.price_min ?? ""} />
                  <Field name="price_max" label="Price to (AED)" type="number" defaultValue={a.price_max ?? ""} />
                </div>
                <div className="border-t border-[var(--line)] pt-4 flex flex-col gap-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)]">Private contact — never public; shared only when you tap “Send my card” on an enquiry</p>
                  <div className="grid grid-cols-2 gap-3">
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
              {/* Danger zone — separate form so delete never submits the edit form */}
              <details className="mt-3">
                <summary className="text-[12px] text-[var(--ink-faint)] cursor-pointer hover:text-[var(--coral)] list-none">Delete this listing</summary>
                <div className="mt-2 p-3.5 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-[12px] text-[var(--ink-dim)] mb-3">Permanently removes this listing, its videos, photos and enquiries. This can&apos;t be undone.</p>
                  <form action={deleteListing}>
                    <input type="hidden" name="artistId" value={a.id} />
                    <button className="text-[12.5px] font-semibold text-white bg-[var(--coral)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                      Yes, delete listing
                    </button>
                  </form>
                </div>
              </details>

              {/* Enquiry inbox */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-3">
                  Enquiries {inbox.length > 0 && <span className="text-[var(--blue-dark)]">({inbox.length})</span>}
                  {inbox.filter((e) => e.status === "new").length > 0 && (
                    <span className="ml-1.5 text-[10px] font-bold text-white bg-[var(--coral)] px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                      {inbox.filter((e) => e.status === "new").length} new
                    </span>
                  )}
                </p>
                {inbox.length === 0 ? (
                  <Empty>No enquiries yet. They&apos;ll appear here when clients reach out.</Empty>
                ) : (
                  <div className="flex flex-col gap-3">
                    {inbox.map((e) => (
                      <div key={e.id} className="bg-white border border-[var(--line)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-[var(--ink)] text-[14px]">{e.hirerName || "A client"}</p>
                          <StatusBadge status={e.status} />
                        </div>
                        <p className="text-[12px] text-[var(--ink-faint)] mb-2">
                          {e.eventDate ? `Event: ${e.eventDate}` : "No date"}
                          {e.hirerPhone ? ` · ${e.hirerPhone}` : ""}
                        </p>
                        {e.message && <p className="text-[13px] text-[var(--ink-dim)] mb-3">{e.message}</p>}
                        <form action={updateBookingStatus} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={e.id} />
                          <select name="status" defaultValue={e.status} className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--line)] text-[12.5px] bg-white outline-none focus:border-[var(--blue)]">
                            {BOOKING_STATUSES.map((s) => (
                              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-[var(--blue)] text-white text-[12.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all">
                            Update
                          </button>
                        </form>
                        {e.sharedCard ? (
                          <p className="mt-2 text-[12px] font-semibold text-green-700">✓ Your card was shared with {e.hirerName || "this client"}</p>
                        ) : (
                          <form action={shareCard} className="mt-2">
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="artistId" value={e.artistId} />
                            <button type="submit" className="w-full px-3.5 py-1.5 rounded-lg border border-[var(--blue)] text-[var(--blue-dark)] text-[12.5px] font-semibold hover:bg-[var(--blue-soft)] transition-all">
                              Send my card
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Videos / reels */}
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-faint)] mb-3">
                Videos {vids.length > 0 && <span className="text-[var(--blue-dark)]">({vids.length})</span>}
              </p>
              <div className="grid sm:grid-cols-[1fr_1fr] gap-4 items-start">
                <VideoUploader artistId={a.id} />
                {vids.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {vids.map((v) => (
                      <div key={v.id} className="rounded-xl overflow-hidden border border-[var(--line)] bg-black">
                        <video src={v.url || (v.storage_path ? publicVideoUrl(v.storage_path) : "")} controls preload="metadata" className="w-full aspect-video object-cover bg-black" />
                        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white">
                          <span className="text-[11.5px] text-[var(--ink-dim)] truncate">{v.title || "Untitled"}</span>
                          <form action={removeVideo}>
                            <input type="hidden" name="id" value={v.id} />
                            <input type="hidden" name="storagePath" value={v.storage_path ?? ""} />
                            <button className="text-[11px] font-semibold text-[var(--coral)] hover:underline">Delete</button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- primitives
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyle[status] ?? statusStyle.new}`}>
      {status}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-dashed border-[var(--line)] rounded-2xl px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">
      {children}
    </div>
  );
}

const fieldCls =
  "px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Field({ name, label, type = "text", defaultValue, hint }: { name: string; label: string; type?: string; defaultValue?: string | number; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={fieldCls} />
      {hint && <span className="text-[11px] text-[var(--ink-faint)]">{hint}</span>}
    </label>
  );
}

function Textarea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <textarea name={name} rows={4} defaultValue={defaultValue} className={`${fieldCls} resize-y`} />
    </label>
  );
}

function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{label}</span>
      <select name={name} defaultValue={defaultValue} className={fieldCls}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
