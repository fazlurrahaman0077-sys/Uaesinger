import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/artists";
import { SITE_URL as BASE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: artists }, { data: posts }] = await Promise.all([
    supabase.from("artists").select("slug, created_at").eq("is_published", true),
    supabase.from("posts").select("slug, created_at").eq("published", true),
  ]);

  // Newest published thing on the site. Stamping `new Date()` instead makes every URL
  // look modified on every crawl, and Google drops lastmod it can't trust.
  const dates = [...(artists ?? []), ...(posts ?? [])].map((r) => r.created_at).filter(Boolean) as string[];
  const now = dates.length ? new Date(dates.sort().at(-1)!) : new Date();

  // /artists/new is behind auth and 307s — a redirect in the sitemap is a Search Console error.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${BASE}/artists`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${BASE}/blog`, changeFrequency: "daily", priority: 0.8, lastModified: now },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/artists?category=${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
    lastModified: now,
  }));

  const artistPages: MetadataRoute.Sitemap = (artists ?? []).map((a) => ({
    url: `${BASE}/artists/${a.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: a.created_at ? new Date(a.created_at) : now,
  }));

  const postPages: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: p.created_at ? new Date(p.created_at) : now,
  }));

  return [...staticPages, ...categoryPages, ...artistPages, ...postPages];
}
