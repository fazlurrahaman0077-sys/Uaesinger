import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { listPosts, formatDate } from "@/lib/blog";

export const revalidate = 300; // ISR — cached blog index.

export const metadata: Metadata = {
  title: "Blog — hiring guides & event tips | UAESinger",
  description:
    "Practical guides on hiring singers, DJs, bands, MCs and entertainers for weddings and corporate events across the UAE.",
};

export default async function BlogPage() {
  const posts = await listPosts();

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <section className="px-5 pt-14 pb-10">
          <div className="max-w-[900px] mx-auto">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--blue-dark)] mb-2">
              The UAESinger blog
            </p>
            <h1 className="font-display text-[34px] sm:text-[40px] font-semibold text-[var(--ink)] mb-3">
              Hire smarter. Plan better events.
            </h1>
            <p className="text-[15px] text-[var(--ink-dim)] max-w-[560px]">
              Guides and honest advice for booking entertainment across Dubai, Abu Dhabi and the Emirates.
            </p>
          </div>
        </section>

        <section className="px-5 pb-24">
          <div className="max-w-[900px] mx-auto flex flex-col gap-5">
            {posts.length === 0 ? (
              <p className="text-[14px] text-[var(--ink-dim)] py-16 text-center">
                No articles published yet — check back soon.
              </p>
            ) : (
              posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-7 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,26,38,0.08)] transition-all group"
                >
                  <div className="flex items-center gap-3 text-[11.5px] text-[var(--ink-faint)] mb-2.5">
                    <span className="font-semibold text-[var(--blue-dark)] uppercase tracking-wider">{p.category}</span>
                    <span>·</span>
                    <span>{formatDate(p.created_at)}</span>
                    <span>·</span>
                    <span>{p.read_mins} min read</span>
                  </div>
                  <h2 className="font-display text-[22px] sm:text-[24px] font-semibold text-[var(--ink)] mb-2 group-hover:text-[var(--blue-dark)] transition-colors">
                    {p.title}
                  </h2>
                  {p.excerpt && <p className="text-[14px] text-[var(--ink-dim)] leading-relaxed">{p.excerpt}</p>}
                  <span className="inline-block mt-3 text-[13px] font-semibold text-[var(--blue-dark)] group-hover:underline">
                    Read article →
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
