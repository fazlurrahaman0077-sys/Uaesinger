import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogSearch from "@/components/BlogSearch";
import { listPosts } from "@/lib/blog";

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
          <div className="max-w-[900px] mx-auto">
            <BlogSearch posts={posts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
