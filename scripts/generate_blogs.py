#!/usr/bin/env python3
"""Generate high-quality SEO blog articles for UAESinger and load into `posts`.
Composes real advice blocks across topic × category × city → distinct articles.
Idempotent (skips existing slugs). Run: PGURL=postgresql://... python3 scripts/generate_blogs.py"""
import csv, os, re, subprocess, sys, tempfile

# psql connection via discrete flags + PGPASSWORD (URL-encoded passwords break psql).
# Default to the IPv4 pooler (the direct db host is IPv6-only and can be unroutable).
PG = ["psql", "-h", os.environ.get("PGHOST", "aws-0-ap-northeast-1.pooler.supabase.com"),
      "-p", os.environ.get("PGPORT", "6543"), "-U", os.environ.get("PGUSER", "postgres.orukmxxvjlqqyychqwhh"),
      "-d", "postgres"]
if not os.environ.get("PGPASSWORD"):
    sys.exit("Missing PGPASSWORD")
CITIES = ["Dubai", "Abu Dhabi", "Sharjah"]
CATS = {
    "singer": ("singer", "Singers"), "band": ("live band", "DJs & Bands"),
    "DJ": ("DJ", "DJs & Bands"), "MC": ("MC & host", "MCs & Hosts"),
    "dance act": ("dance act", "Dancers"), "photographer": ("event photographer", "Photographers"),
}

def slugify(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:70]

def li(items): return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

def cta():
    return ('<h2>Book verified talent on UAESinger</h2><p>Browse profiles and real '
            'performance videos, compare prices, and reveal direct contacts once you subscribe. '
            '<a href="/artists">Browse talent</a> or <a href="/pricing">see plans</a>.</p>')

def article_hire(kind, cat_label, city):
    title = f"How to Hire a {kind.title()} in {city} (2026 Guide)"
    body = (
        f"<h1>{title}</h1>"
        f"<p>Hiring the right {kind} sets the tone for any event in {city}. This guide covers what to "
        f"look for, what it costs, and how to book with confidence.</p>"
        f"<h2>What to check before you book</h2>" + li([
            "Watch recent performance videos, not just photos",
            f"Confirm they perform regularly in {city} and know local venues",
            "Read reviews and ask for references from similar events",
            "Agree the set length, song list and breaks in writing",
            "Confirm equipment, sound, and whether a technician is included",
        ]) +
        f"<h2>How much does a {kind} cost in {city}?</h2>"
        f"<p>Rates depend on experience, event type and hours. Wedding and corporate bookings sit at the "
        f"higher end; smaller private parties cost less. On UAESinger each {kind} lists an indicative price "
        f"range, so you can shortlist within budget before you reach out.</p>"
        f"<h2>Questions to ask</h2>" + li([
            "Are you available on my date, and how long will you perform?",
            "What do you need from the venue (space, power, sound)?",
            "Can you tailor the set to our theme or culture?",
            "What is your deposit and cancellation policy?",
        ]) + cta()
    )
    return title, slugify(title), f"Everything you need to hire a {kind} in {city}: what to check, real costs, and the right questions to ask before you book.", "Guides", body, 5

def article_cost(kind, cat_label, city):
    title = f"Cost to Hire a {kind.title()} in {city}: 2026 Price Guide"
    body = (
        f"<h1>{title}</h1>"
        f"<p>One of the first questions event planners in {city} ask is what a {kind} will cost. Prices vary, "
        f"but a few factors drive most of the difference.</p>"
        f"<h2>What affects the price</h2>" + li([
            "Experience and demand — established acts command more",
            "Event type — weddings and corporate events price higher than house parties",
            "Duration and number of sets",
            "Equipment, travel, and additional performers",
        ]) +
        f"<h2>How to get the best value</h2>"
        f"<p>Compare several {kind}s side by side, book early for peak wedding season, and be clear about your "
        f"budget up front. UAESinger shows an indicative range on every profile so you can shortlist fast.</p>"
        + cta()
    )
    return title, slugify(title), f"A clear 2026 price guide for hiring a {kind} in {city}, plus how to get the best value for your event.", "Planning", body, 4

TOPICS = [article_hire, article_cost]

def existing():
    r = subprocess.run(PG + ["-tAc", "select slug from posts"], capture_output=True, text=True)
    return set(s.strip() for s in r.stdout.splitlines() if s.strip())

def main():
    have = existing()
    tmp = tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, newline="")
    w = csv.writer(tmp); n = 0
    for city in CITIES:
        for kind, cat_label in CATS.values():
            for topic in TOPICS:
                title, slug, excerpt, cat, body, mins = topic(kind, cat_label, city)
                if slug in have:
                    continue
                have.add(slug)
                w.writerow([slug, title, excerpt, cat, body, mins, "true"]); n += 1
    tmp.close()
    if n:
        subprocess.run(PG + ["-c",
            rf"\copy posts(slug,title,excerpt,category,body,read_mins,published) from '{tmp.name}' with (format csv)"], check=True)
    print(f"inserted {n} articles")

if __name__ == "__main__":
    main()
