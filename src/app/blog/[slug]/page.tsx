import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPost, bodyParagraphs, formatDate } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found | UAESinger" };
  return { title: `${post.title} | UAESinger`, description: post.excerpt ?? undefined };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const paragraphs = bodyParagraphs(post.body);

  return (
    <>
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

          <div className="flex flex-col gap-5">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[16px] text-[var(--ink-dim)] leading-relaxed">
                {para}
              </p>
            ))}
          </div>

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
