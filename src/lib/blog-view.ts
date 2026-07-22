// Pure presentation helpers for blog posts, safe in client components.
// Separate from blog.ts on purpose: that module imports the Supabase server
// client (next/headers), which can't be pulled into a client bundle. The type
// import below is erased at build time, so nothing server-side follows it.
import type { Post } from "./blog";

// Filter the loaded index by a typed term — title, excerpt and category.
// ponytail: filters the ~60 posts listPosts already fetched, so typing costs no
// round trip. Move to a ?q= param + supabase ilike once the index outgrows that
// limit (article body isn't searchable this way either).
export function filterPosts(posts: Post[], query: string): Post[] {
  const term = query.trim().toLowerCase();
  if (!term) return posts;
  return posts.filter((p) =>
    [p.title, p.excerpt, p.category].some((f) => f?.toLowerCase().includes(term)),
  );
}

export function formatDate(iso: string): string {
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
}
