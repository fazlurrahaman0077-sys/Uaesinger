// Self-check: `node src/lib/blog.check.ts` (no test framework needed).
import assert from "node:assert";
import { filterPosts } from "./blog-view.ts";
import type { Post } from "./blog.ts"; // type-only — erased, so no supabase import

const post = (over: Partial<Post>): Post => ({
  id: "1", slug: "s", title: "", excerpt: null, category: null, body: null,
  read_mins: 3, published: true, created_at: "2026-01-01", cover_url: null, ...over,
});

const posts = [
  post({ id: "a", title: "How to hire a wedding singer in Dubai" }),
  post({ id: "b", title: "Corporate events", excerpt: "Booking a bilingual MC for a launch" }),
  post({ id: "c", title: "Ten party ideas", category: "Weddings" }),
];
const ids = (q: string) => filterPosts(posts, q).map((p) => p.id);

// --- matches each searchable field ---
assert.deepEqual(ids("singer"), ["a"]); // title
assert.deepEqual(ids("bilingual"), ["b"]); // excerpt
assert.deepEqual(ids("Weddings"), ["c"]); // category

// --- case and stray whitespace don't matter ---
assert.deepEqual(ids("DUBAI"), ["a"]);
assert.deepEqual(ids("  mc  "), ["b"]);

// --- "wedding" is in a's title and c's category, so both come back ---
assert.deepEqual(ids("wedding"), ["a", "c"]);

// --- empty query is not a filter; a miss returns nothing ---
assert.deepEqual(ids(""), ["a", "b", "c"]);
assert.deepEqual(ids("   "), ["a", "b", "c"]);
assert.deepEqual(ids("magician"), []);

// --- null excerpt/category must not throw ---
assert.deepEqual(filterPosts([post({ id: "d" })], "anything"), []);

console.log("blog.check.ts — all assertions passed");
