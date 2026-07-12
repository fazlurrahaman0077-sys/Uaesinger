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
    { data: weekVisits },
    { data: payments },
    { data: completedPay },
  ] = await Promise.all([
    supabase.from("artists").select("id, slug, name, category_slug, city, is_published, created_at").order("created_at", { ascending: false }),
    supabase.from("posts").select("id, slug, title, category, published, created_at").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "artist"),
    supabase.from("visits").select("visitor_id", { count: "exact", head: true }).eq("day", today),
    supabase.from("visits").select("visitor_id").gte("day", weekAgo),
    supabase.from("payments").select("id, user_email, plan, amount_aed, status, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("payments").select("amount_aed").eq("status", "completed"),
  ]);

  // Unique visitors over the last 7 days (distinct across the daily rows).
  const weekUnique = new Set((weekVisits ?? []).map((v) => v.visitor_id)).size;
  const revenue = (completedPay ?? []).reduce((sum, p) => sum + (p.amount_aed ?? 0), 0);

  const stats = [
    { label: "Total users", value: users.count ?? 0 },
    { label: "Content creators", value: creators.count ?? 0 },
    { label: "Active subs", value: activeSubs.count ?? 0 },
    { label: "Visitors today", value: visitorsToday.count ?? 0 },
    { label: "Visitors 7d", value: weekUnique },
    { label: "Artists live", value: artists?.filter((a) => a.is_published).length ?? 0 },
    { label: "Revenue AED", value: revenue.toLocaleString() },
    { label: "Posts", value: posts?.length ?? 0 },
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
                      <form action={toggleArtist}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="publish" value={(!a.is_published).toString()} />
                        <button className="text-[12px] font-semibold text-[var(--blue-dark)] hover:underline">
                          {a.is_published ? "Hide" : "Publish"}
                        </button>
                      </form>
                      <form action={deleteArtist}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="text-[12px] font-semibold text-[var(--coral)] hover:underline">Delete</button>
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
                      <Link href={`/admin/posts/${p.id}/edit`} className="text-[12px] font-semibold text-[var(--blue-dark)] hover:underline">
                        Edit
                      </Link>
                      <form action={togglePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="publish" value={(!p.published).toString()} />
                        <button className="text-[12px] font-semibold text-[var(--ink-dim)] hover:underline">
                          {p.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-[12px] font-semibold text-[var(--coral)] hover:underline">Delete</button>
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
