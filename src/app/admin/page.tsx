import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { requireAdmin } from "@/lib/admin";
import { toggleArtist, deleteArtist, createPost, deletePost } from "./actions";

export const metadata: Metadata = { title: "Admin | UAESinger" };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const [{ data: artists }, { data: posts }, subs, profiles] = await Promise.all([
    supabase.from("artists").select("id, slug, name, category_slug, city, is_published, created_at").order("created_at", { ascending: false }),
    supabase.from("posts").select("id, slug, title, category, published, created_at").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Artists", value: artists?.length ?? 0 },
    { label: "Published", value: artists?.filter((a) => a.is_published).length ?? 0 },
    { label: "Active subs", value: subs.count ?? 0 },
    { label: "Users", value: profiles.count ?? 0 },
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[var(--line)] rounded-xl px-4 py-3">
                <p className="font-display text-[26px] font-bold text-[var(--ink)]">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)] font-bold">{s.label}</p>
              </div>
            ))}
          </div>

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
          <section className="grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
            {/* New post */}
            <div>
              <h2 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-4">Write a post</h2>
              <form action={createPost} className="bg-white border border-[var(--line)] rounded-2xl p-5 flex flex-col gap-3">
                <input name="title" required placeholder="Title" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="category" placeholder="Category (e.g. Guides)" className={inputCls} />
                  <input name="read_mins" type="number" min={1} placeholder="Read mins" className={inputCls} />
                </div>
                <input name="excerpt" placeholder="One-line excerpt" className={inputCls} />
                <textarea
                  name="body"
                  rows={7}
                  placeholder="Write the article. Separate paragraphs with a blank line."
                  className={`${inputCls} resize-y`}
                />
                <button className="py-2.5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all">
                  Publish post
                </button>
              </form>
            </div>

            {/* Existing posts */}
            <div>
              <h2 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-4">Posts</h2>
              <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
                {(posts ?? []).length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">No posts yet.</p>
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
                        <form action={deletePost}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="text-[12px] font-semibold text-[var(--coral)] hover:underline">Delete</button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const inputCls =
  "px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full";
