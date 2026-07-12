import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPost, bodyParagraphs, formatDate, isHtml } from "@/lib/blog";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | UAESinger" };
  const title = `${post.title} | UAESinger`;
  const url = `/blog/${post.slug}`;
  return {
    title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description: post.excerpt ?? undefined, url, siteName: "UAESinger" },
    twitter: { card: "summary_large_image", title, description: post.excerpt ?? undefined },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = isHtml(post.body);
  const paragraphs = html ? [] : bodyParagraphs(post.body);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: { "@type": "Organization", name: "UAESinger" },
    publisher: { "@type": "Organization", name: "UAESinger", url: base },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main className="bg-white min-h-screen">
        <article className="max-w-[720px] mx-auto px-5 pt-12 pb-24">
          <Link href="/blog" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">
            ← All articles
          </Link>

          <div className="flex items-center gap-3 text-[11.5px] text-[var(--ink-faint)] mt-6 mb-3">
            <span className="font-semibold text-[var(--blue-dark)] uppercase tracking-wider">{post.category}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>{post.read_mins} min read</span>
          </div>

          <h1 className="font-display text-[32px] sm:text-[40px] font-semibold text-[var(--ink)] leading-tight mb-8">
            {post.title}
          </h1>

          {html ? (
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.body ?? "" }} />
          ) : (
            <div className="flex flex-col gap-5">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-[16px] text-[var(--ink-dim)] leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-[var(--line)] bg-[var(--blue-soft)] -mx-5 px-5 py-8 sm:rounded-2xl sm:mx-0 sm:px-8">
            <h3 className="font-display text-[20px] font-semibold text-[var(--ink)] mb-2">Ready to book talent?</h3>
            <p className="text-[14px] text-[var(--ink-dim)] mb-4">
              Browse verified performers across the UAE and reveal their contacts.
            </p>
            <Link
              href="/artists"
              className="inline-block py-2.5 px-5 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all shadow-sm"
            >
              Browse talent →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
