"use client";

import { useState } from "react";
import Link from "next/link";
import { filterPosts, formatDate } from "@/lib/blog-view";
import type { Post } from "@/lib/blog";
import Reveal from "@/components/Reveal";

// Search box + result list for the blog index. The server hands over the whole
// published index, so filtering is instant and needs no round trip.
export default function BlogSearch({ posts }: { posts: Post[] }) {
  const [q, setQ] = useState("");
  const results = filterPosts(posts, q);

  return (
    <>
      <div className="relative mb-7">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] pointer-events-none"
          width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles — weddings, DJs, budgets…"
          aria-label="Search articles"
          className="w-full bg-white border border-[var(--line)] rounded-xl pl-11 pr-4 py-3 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all"
        />
      </div>

      {/* Screen readers get the count; sighted users see the list change. */}
      <p aria-live="polite" className={q ? "text-[13px] text-[var(--ink-faint)] mb-5" : "sr-only"}>
        {results.length === 0
          ? `No articles match “${q}”`
          : `${results.length} article${results.length === 1 ? "" : "s"} found`}
      </p>

      <div className="flex flex-col gap-5">
        {posts.length === 0 ? (
          <p className="text-[14px] text-[var(--ink-dim)] py-16 text-center">
            No articles published yet — check back soon.
          </p>
        ) : (
          results.map((p, i) => (
            <Reveal key={p.slug} delay={Math.min(i, 4) * 70}>
              <Link
                href={`/blog/${p.slug}`}
                className="block bg-white border border-[var(--line)] rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,26,38,0.08)] transition-all group"
              >
                {p.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full aspect-[16/9] object-cover border-b border-[var(--line)]" />
                )}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-3 text-[11.5px] text-[var(--ink-faint)] mb-2.5">
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
                </div>
              </Link>
            </Reveal>
          ))
        )}
      </div>
    </>
  );
}
