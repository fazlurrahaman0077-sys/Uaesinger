import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  body: string | null;
  read_mins: number;
  published: boolean;
  created_at: string;
  cover_url: string | null;
};

export async function listPosts(): Promise<Post[]> {
  const supabase = createPublicClient();
  // Index only needs metadata — never fetch the (large) body column here.
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, category, read_mins, published, created_at, cover_url")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(60);
  return (data as unknown as Post[]) ?? [];
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  return (data as unknown as Post) ?? null;
}

// Admin-only: fetch any post (incl. drafts) by id for the editor. RLS
// posts_admin_all lets admins read unpublished rows.
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  return (data as Post) ?? null;
}

// Imported posts store rich HTML; hand-written posts store blank-line paragraphs.
export function isHtml(body: string | null): boolean {
  return /<(p|h[1-6]|ul|ol|div|section|article)\b/i.test(body ?? "");
}

export function bodyParagraphs(body: string | null): string[] {
  return (body ?? "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatDate(iso: string): string {
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
}
