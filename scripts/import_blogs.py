#!/usr/bin/env python3
"""
Import + rewrite the FreezeAC blog corpus into UAESinger.

Reads blog_posts from the source Supabase (service_role, read-only), rewrites
each AC-repair article into a UAESinger (live-entertainment booking) article via
the Anthropic API, strips images, and loads the results into our `posts` table.

Idempotent: skips any slug already present in our DB. Safe to re-run.

Env required:
  ANTHROPIC_API_KEY   your Claude API key
  SRC_SUPABASE_KEY    source project service_role JWT
  PGURL               our Postgres connection string (postgresql://...)
Optional:
  LIMIT=3             only process N posts (use for a quality test first)
  MODEL=claude-haiku-4-5-20251001

Usage:
  ANTHROPIC_API_KEY=... SRC_SUPABASE_KEY=... PGURL=... LIMIT=3 python3 scripts/import_blogs.py
"""
import csv, json, os, re, subprocess, sys, urllib.request, tempfile

SRC_BASE = "https://ubnkqouxnzmpabncdtap.supabase.co/rest/v1/blog_posts"
MODEL = os.environ.get("MODEL", "claude-haiku-4-5-20251001")
LIMIT = int(os.environ.get("LIMIT", "0"))

def need(k):
    v = os.environ.get(k)
    if not v:
        sys.exit(f"Missing env {k}")
    return v

SRC_KEY = need("SRC_SUPABASE_KEY")
ANTHROPIC_KEY = need("ANTHROPIC_API_KEY")
PGURL = need("PGURL")

SYSTEM = (
    "You rewrite articles for UAESinger.com, a UAE marketplace to hire live "
    "entertainment: singers, DJs, bands, MCs/hosts, dancers, photographers and "
    "entertainers for weddings, corporate events and parties across Dubai, Abu "
    "Dhabi and the Emirates. You are given an article from an unrelated AC-repair "
    "site. Completely rewrite it into an original, genuinely useful, SEO-optimized "
    "UAESinger article on a matching event-entertainment topic — keep NOTHING about "
    "air conditioning. Preserve rich HTML structure (h2/h3/p/ul/li, a <h1> title), "
    "similar length and the UAE-local angle. No images. Natural, human, non-spammy prose."
)

def anthropic_rewrite(title, content):
    prompt = (
        f"Original title: {title}\n\nOriginal HTML article:\n{content[:12000]}\n\n"
        "Return ONLY minified JSON with keys: title, slug (kebab-case, singer topic), "
        "excerpt (<=155 chars), category (one of: Guides, Tips, Trends, Planning), "
        "read_mins (int), body_html (clean HTML, no <html>/<head>/<body>/<img>). "
        "The body_html must start with an <h1>."
    )
    payload = json.dumps({
        "model": MODEL,
        "max_tokens": 4096,
        "system": SYSTEM,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.load(r)
    text = "".join(b.get("text", "") for b in data.get("content", []))
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(text)

def fetch_source():
    out, step = [], 200
    for start in range(0, 2000, step):
        req = urllib.request.Request(
            f"{SRC_BASE}?select=title,slug,content,published&order=created_at.asc&limit={step}&offset={start}",
            headers={"apikey": SRC_KEY, "Authorization": f"Bearer {SRC_KEY}"},
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            rows = json.load(r)
        if not rows:
            break
        out.extend(rows)
    return out

def existing_slugs():
    res = subprocess.run(["psql", PGURL, "-tAc", "select slug from posts"], capture_output=True, text=True)
    return set(filter(None, (s.strip() for s in res.stdout.splitlines())))

def main():
    have = existing_slugs()
    src = fetch_source()
    print(f"source: {len(src)} posts · already imported: {len(have)}")
    todo = [p for p in src if p.get("content")]
    if LIMIT:
        todo = todo[:LIMIT]

    tmp = tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, newline="")
    w = csv.writer(tmp)
    n = 0
    for i, p in enumerate(todo, 1):
        try:
            out = anthropic_rewrite(p["title"], p["content"])
            # Never trust the LLM's slug verbatim — it emits titles with spaces/:/?.
            # Match the app's slugify (src/app/admin/actions.ts) so URLs never 404.
            slug = re.sub(r"[^a-z0-9]+", "-", (out.get("slug") or out["title"]).lower()).strip("-")[:70]
            if slug in have:
                continue
            have.add(slug)
            w.writerow([slug, out["title"], out.get("excerpt", ""), out.get("category", "Guides"),
                        out["body_html"], int(out.get("read_mins", 5)), "true"])
            n += 1
            print(f"[{i}/{len(todo)}] ok · {slug}")
        except Exception as e:
            print(f"[{i}/{len(todo)}] FAIL {p.get('slug')}: {e}", file=sys.stderr)
    tmp.close()

    if n:
        copy = (r"\copy posts(slug,title,excerpt,category,body,read_mins,published) "
                f"from '{tmp.name}' with (format csv)")
        subprocess.run(["psql", PGURL, "-c", copy], check=True)
    print(f"imported {n} new posts")

if __name__ == "__main__":
    main()
