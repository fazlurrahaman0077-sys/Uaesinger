import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { requireAdmin } from "@/lib/admin";
import { toggleArtist, deleteArtist, togglePost, deletePost } from "./actions";

export const metadata: Metadata = { title: "Admin | UAESinger" };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);

  const [
    { data: artists },
    { data: posts },
    activeSubs,
    users,
    creators,
    visitorsToday,
    weekVisits,
    { data: payments },
    { data: completedPay },
    { data: messages },
  ] = await Promise.all([
    supabase.from("artists").select("id, slug, name, category_slug, city, is_published, created_at").order("created_at", { ascending: false }),
    supabase.from("posts").select("id, slug, title, category, published, created_at").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "artist"),
    supabase.from("visits").select("visitor_id", { count: "exact", head: true }).eq("day", today),
    supabase.from("visits").select("visitor_id", { count: "exact", head: true }).gte("day", weekAgo),
    supabase.from("payments").select("id, user_email, plan, amount_aed, status, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("payments").select("amount_aed").eq("status", "completed"),
    supabase.from("contact_messages").select("id, name, email, subject, message, created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  // visitor_id is SHA-256(ip:day:...) — salted with the day, so the same IP gets a
  // different id every day and cannot be deduped across days. This is visit-days
  // (one per IP per day), NOT unique people; labelled "Visits 7d" to say so. A real
  // 7-day unique count needs a day-independent id, which is a privacy trade-off.
  const visits7d = weekVisits.count ?? 0;
  const revenue = (completedPay ?? []).reduce((sum, p) => sum + (p.amount_aed ?? 0), 0);

  const stats = [
    { label: "Total users", value: users.count ?? 0 },
    { label: "Content creators", value: creators.count ?? 0 },
    { label: "Active subs", value: activeSubs.count ?? 0 },
    { label: "Visitors today", value: visitorsToday.count ?? 0 },
    { label: "Visits 7d", value: visits7d },
    { label: "Artists live", value: artists?.filter((a) => a.is_published).length ?? 0 },
    { label: "Revenue AED", value: revenue.toLocaleString() },
    { label: "Support msgs", value: messages?.length ?? 0 },
  ];

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[1100px] mx-auto px-5 py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-[30px] font-semibold text-[var(--ink)]">Admin</h1>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white bg-[var(--blue)] px-3 py-1 rounded-full">
              Staff only
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[var(--line)] rounded-xl px-4 py-3">
                <p className="font-display text-[26px] font-bold text-[var(--ink)]">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)] font-bold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Support messages — new-message notification */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-[20px] font-semibold text-[var(--ink)]">Support messages</h2>
              {(messages ?? []).length > 0 && (
                <span className="text-[11px] font-bold text-white bg-[var(--coral)] px-2.5 py-0.5 rounded-full">
                  {messages!.length} new
                </span>
              )}
            </div>
            <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
              {(messages ?? []).length === 0 ? (
                <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">No messages yet.</p>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {messages!.map((m) => (
                    <div key={m.id} className="px-5 py-3.5 text-[13px]">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-[var(--ink)]">{m.name}</span>
                        <a href={`mailto:${m.email}`} className="text-[12px] text-[var(--blue-dark)] hover:underline">{m.email}</a>
                        {m.subject && <span className="text-[11px] text-[var(--ink-faint)]">· {m.subject}</span>}
                        <span className="text-[11px] text-[var(--ink-faint)] ml-auto">{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-[13px] text-[var(--ink-dim)]">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Payments */}
          <section className="mb-12">
            <h2 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-4">Payments</h2>
            <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
              {(payments ?? []).length === 0 ? (
                <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">No payments yet.</p>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {payments!.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 text-[13px]">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-[var(--ink)]">{p.user_email ?? "—"}</span>
                        <span className="text-[var(--ink-faint)]"> · {p.plan}</span>
                      </div>
                      <span className="text-[var(--ink-dim)] tabular-nums">AED {p.amount_aed?.toLocaleString()}</span>
                      <span className="text-[11px] text-[var(--ink-faint)] hidden sm:inline">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : p.status === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-[var(--bg3)] text-[var(--ink-faint)]"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Artists */}
          <section className="mb-12">
            <h2 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-4">Artists</h2>
            <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
              {(artists ?? []).length === 0 ? (
                <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">No artists yet.</p>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {artists!.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-[13px]">
                      <div className="flex-1 min-w-0">
                        <Link href={`/artists/${a.slug}`} className="font-semibold text-[var(--ink)] hover:text-[var(--blue-dark)]">
                          {a.name}
                        </Link>
                        <span className="text-[var(--ink-faint)]"> · {a.category_slug} · {a.city}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          a.is_published ? "bg-green-50 text-green-700" : "bg-[var(--bg3)] text-[var(--ink-faint)]"
                        }`}
                      >
                        {a.is_published ? "Live" : "Hidden"}
                      </span>
                      <Link href={`/artists/${a.slug}`} className={btn}>View</Link>
                      <form action={toggleArtist}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="publish" value={(!a.is_published).toString()} />
                        <button className={btn}>{a.is_published ? "Hide" : "Publish"}</button>
                      </form>
                      <form action={deleteArtist}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className={btnDanger}>Delete</button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Blog */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[20px] font-semibold text-[var(--ink)]">Blog</h2>
              <Link href="/admin/posts/new" className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)] transition-all">
                + New post
              </Link>
            </div>
            <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
              {(posts ?? []).length === 0 ? (
                <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">No posts yet. Write your first one.</p>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {posts!.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 text-[13px]">
                      <div className="flex-1 min-w-0">
                        <Link href={`/blog/${p.slug}`} className="font-semibold text-[var(--ink)] hover:text-[var(--blue-dark)]">
                          {p.title}
                        </Link>
                        <span className="text-[var(--ink-faint)]"> · {p.category}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.published ? "bg-green-50 text-green-700" : "bg-[var(--bg3)] text-[var(--ink-faint)]"
                        }`}
                      >
                        {p.published ? "Live" : "Draft"}
                      </span>
                      <Link href={`/admin/posts/${p.id}/edit`} className={btn}>Edit</Link>
                      <form action={togglePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="publish" value={(!p.published).toString()} />
                        <button className={btn}>{p.published ? "Unpublish" : "Publish"}</button>
                      </form>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className={btnDanger}>Delete</button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

// Shared small action buttons for the admin lists.
const btn =
  "text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-dim)] hover:border-[var(--blue)] hover:text-[var(--blue-dark)] transition-all whitespace-nowrap";
const btnDanger =
  "text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-[var(--coral)] hover:bg-red-50 transition-all whitespace-nowrap";
