// Canonical public origin for SEO (sitemap, robots, canonical, OG). Override
// with NEXT_PUBLIC_SITE_URL in the environment; falls back to the live domain
// so production never emits localhost even if the env var is unset.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://uaesinger.com";
