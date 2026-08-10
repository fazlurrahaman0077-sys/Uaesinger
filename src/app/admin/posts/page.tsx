import type { Metadata } from "next";
import Link from "next/link";
import FilterRows from "@/components/FilterRows";
import Header from "@/components/Header";
import { requireAdmin, btn, btnDanger } from "@/lib/admin";
import { togglePost, deletePost } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Blog | UAESinger admin" };

// The blog list used to sit at the bottom of /admin, below users, messages,
// payments and artists — a long scroll to reach the thing you came to write.
export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { saved } = await searchParams;

  const { data: posts } = await supabase
    .from("posts")
    .select("id, slug, title, category, published, created_at")
    .order("created_at", { ascending: false });

  const live = (posts ?? []).filter((p) => p.published).length;

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[1100px] mx-auto px-5 py-10">
          <Link href="/admin" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">← Back to admin</Link>

          <div className="flex items-center justify-between gap-4 mt-4 mb-8">
            <div>
              <h1 className="font-display text-[30px] font-semibold text-[var(--ink)]">Blog</h1>
              <p className="text-[13px] text-[var(--ink-dim)] mt-1">
                {(posts ?? []).length} post{(posts ?? []).length === 1 ? "" : "s"} · {live} live
              </p>
            </div>
            <Link href="/admin/posts/new" className="text-[13px] font-semibold px-4 py-2 rounded-lg bg-[var(--blue)] text-white hover:bg-[var(--blue-dark)] transition-all whitespace-nowrap">
              + New post
            </Link>
          </div>

          {saved && (
            <p className="mb-6 text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              {saved === "deleted" ? "Post deleted." : "Post saved."}
            </p>
          )}

          {(posts ?? []).length === 0 ? (
            <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden">
              <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">No posts yet. Write your first one.</p>
            </div>
          ) : (
            <FilterRows placeholder="Search posts by title, category or slug…">
              <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden divide-y divide-[var(--line)]">
                {posts!.map((p) => (
                  <div
                    key={p.id}
                    data-search={`${p.title} ${p.category ?? ""} ${p.slug} ${p.published ? "live" : "draft"}`.toLowerCase()}
                    className="flex items-center gap-3 px-5 py-3 text-[13px]"
                  >
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
            </FilterRows>
          )}
        </div>
      </main>
    </>
  );
}
