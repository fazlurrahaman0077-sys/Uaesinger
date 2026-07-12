import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";
import { requireAdmin } from "@/lib/admin";
import { createPost } from "@/app/admin/actions";

export const metadata: Metadata = { title: "New post | UAESinger admin" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <>
      <Header />
      <main className="bg-[var(--bg2)] min-h-screen">
        <div className="max-w-[820px] mx-auto px-5 py-10">
          <Link href="/admin" className="text-[13px] text-[var(--blue-dark)] font-semibold hover:underline">← Back to admin</Link>
          <h1 className="font-display text-[28px] font-semibold text-[var(--ink)] mt-4 mb-6">Write a post</h1>
          <div className="bg-white border border-[var(--line)] rounded-2xl p-6 sm:p-8">
            <PostForm action={createPost} error={error} />
          </div>
        </div>
      </main>
    </>
  );
}
