import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { requireAdmin } from "@/lib/admin";
import { getPostById } from "@/lib/blog";
import { updatePost } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Edit post | UAESinger admin" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[820px] mx-auto px-5 py-10">
          <Link href="/admin" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">← Back to admin</Link>
          <div className="flex items-center gap-3 mt-4 mb-6">
            <h1 className="font-display text-[28px] font-semibold text-[var(--ink)]">Edit post</h1>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${post.published ? "bg-green-50 text-green-700" : "bg-[var(--bg3)] text-[var(--ink-faint)]"}`}>
              {post.published ? "Live" : "Draft"}
            </span>
          </div>
          <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8">
            <PostForm action={updatePost} post={post} error={error} />
          </div>
        </div>
      </main>
    </>
  );
}
