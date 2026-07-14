import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/artists";
import { SITE_URL as BASE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = await createClient();

  const [{ data: artists }, { data: posts }] = await Promise.all([
    supabase.from("artists").select("slug, created_at").eq("is_published", true),
    supabase.from("posts").select("slug, created_at").eq("published", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0, lastModified: now },
    { url: `${BASE}/artists`, changeFrequency: "daily", priority: 0.9, lastModified: now },
    { url: `${BASE}/blog`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE}/artists/new`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
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
