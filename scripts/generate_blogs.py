#!/usr/bin/env python3
"""Generate FULL long-form SEO blog articles for UAESinger and upsert into `posts`.
Composes substantial, genuinely useful content parameterized by topic × category ×
city. Idempotent: re-running updates existing slugs in place (ON CONFLICT).
Run: PGPASSWORD=... python3 scripts/generate_blogs.py"""
import csv, os, re, subprocess, sys, tempfile

# Session mode (port 5432) so the temp table survives across statements in the script.
PG = ["psql", "-h", os.environ.get("PGHOST", "aws-0-ap-northeast-1.pooler.supabase.com"),
      "-p", os.environ.get("PGPORT", "5432"), "-U", os.environ.get("PGUSER", "postgres.orukmxxvjlqqyychqwhh"),
      "-d", "postgres"]
if not os.environ.get("PGPASSWORD"):
    sys.exit("Missing PGPASSWORD")

CITIES = [
    "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
    "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay", "JBR", "DIFC",
    "Dubai Hills Estate", "Jumeirah", "Al Barsha", "Yas Island", "Saadiyat Island",
]
CATS = {
    "singer": ("singer", "Singers"), "band": ("live band", "DJs & Bands"),
    "DJ": ("DJ", "DJs & Bands"), "MC": ("MC & host", "MCs & Hosts"),
    "dance act": ("dance act", "Dancers"), "photographer": ("event photographer", "Photographers"),
}

def slugify(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:70]
def p(t): return f"<p>{t}</p>"
def h2(t): return f"<h2>{t}</h2>"
def ul(items): return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

def cta():
    return (h2("Book verified talent on UAESinger") +
            p('UAESinger lists verified performers across every Emirate with real performance videos, '
              'transparent price ranges and genuine reviews. Browse profiles free, shortlist your favourites, '
              'and unlock direct contact details with a subscription. '
              '<a href="/artists">Browse talent</a> · <a href="/pricing">See plans</a> · '
              '<a href="/artists/new">List your act</a>.'))

def faq(kind, city):
    q = [
        (f"How far in advance should I book a {kind} in {city}?",
         f"For weddings and peak-season events, book your {kind} 3–6 months ahead. Popular acts in {city} are "
         f"reserved early, especially around National Day, New Year and the winter wedding season."),
        (f"How much does a {kind} cost in {city}?",
         f"Rates depend on experience, event type, hours and production needs. Every {kind} on UAESinger lists an "
         f"indicative price range so you can shortlist within budget before you reach out."),
        (f"Do I need to provide sound equipment?",
         "Ask up front. Many performers bring their own PA and mics; larger venues may need a dedicated sound "
         "system or technician. Confirm what's included and what the venue must supply."),
        (f"Can the set be tailored to our theme or culture?",
         f"Yes. Most {kind}s in {city} tailor the repertoire, language mix and dress to your event — Arabic, "
         "English, Bollywood, jazz and more. Share your vision early so they can prepare."),
    ]
    return h2("Frequently asked questions") + "".join(f"<h3>{a}</h3>{p(b)}" for a, b in q)

def price_table(kind):
    rows = [
        ("House party / small private event", "Entry level", "1–2 hours"),
        ("Corporate event / brand launch", "Mid–high", "2–3 hours + sets"),
        ("Wedding / gala", "Premium", "Full evening, multiple sets"),
    ]
    body = "".join(f"<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>" for a, b, c in rows)
    return (h2(f"What drives a {kind}'s price") +
            "<table><thead><tr><th>Event type</th><th>Typical tier</th><th>Duration</th></tr></thead>"
            f"<tbody>{body}</tbody></table>" +
            p("Beyond event type, price scales with the performer's demand and reputation, the number of "
              "performers, travel across the Emirates, and extras like extended sets or custom song learning."))

def build(topic, kind, cat_label, city):
    """Return a full ~1000+ word article for the given angle."""
    if topic == "hire":
        title = f"How to Hire a {kind.title()} in {city}: The Complete 2026 Guide"
        excerpt = f"A complete guide to hiring a {kind} in {city} — where to look, what to check, real costs, contracts and the exact questions to ask."
        cat, mins = "Guides", 8
        body = (
            p(f"Booking the right {kind} is one of the highest-impact decisions you'll make for any event in {city}. "
              f"Great live entertainment sets the energy, fills the silences and gives guests a night they talk about "
              f"for months. Get it wrong and even a beautiful venue can fall flat. This complete guide walks you "
              f"through exactly how to find, vet and book the right {kind} in {city} — with no guesswork.") +
            p(f"Whether you're planning a wedding, a corporate launch, a private party or a National Day celebration, "
              f"the fundamentals are the same: define what you need, compare real options, and lock the details in writing.") +
            h2(f"1. Decide what kind of {kind} your event needs") +
            p(f"Start with the moment you want to create. An intimate wedding in {city} calls for a different {kind} than "
              f"a high-energy brand launch. Think about your guest count, the venue size and acoustics, the languages your "
              f"guests speak, and the point in the evening you want to lift.") +
            ul([f"Event type and formality — wedding, corporate, private, cultural",
                "Guest count and venue size (indoor ballroom vs outdoor terrace)",
                "Languages and musical styles your audience will love",
                "The key moments you want scored — entrance, dinner, dancefloor"]) +
            h2(f"2. Where to find a great {kind} in {city}") +
            p(f"The fastest way to find verified, reviewed {cat_label.lower()} in {city} is a dedicated marketplace like "
              f"UAESinger, where every profile carries real performance videos, an indicative price range and genuine "
              f"reviews. That beats scrolling social media, where it's hard to tell a polished promo from a live reality.") +
            h2(f"3. Vet before you book") +
            p(f"Never book on photos alone. A strong {kind} will happily share recent live footage and references from "
              f"similar events in {city}.") +
            ul(["Watch recent live videos — not just studio or promo clips",
                f"Confirm they perform regularly in {city} and know the venues",
                "Read reviews and ask for references from comparable events",
                "Check they carry professional sound, or clarify what the venue provides",
                "Agree the set length, song list, breaks and dress code in writing"]) +
            price_table(kind) +
            h2("4. Lock the details in a simple agreement") +
            p("Once you've chosen, put the essentials in writing: date and timings, exact fee and deposit, what's "
              "included (equipment, travel, extra performers), the cancellation policy and a backup plan. A clear "
              "agreement protects both sides and prevents day-of surprises.") +
            h2(f"5. Set your {kind} up to shine") +
            p(f"On the day, give your {kind} what they need to deliver: a clear performance area, power, a run sheet with "
              f"key timings, and a point of contact. The smoother the logistics, the better the show.") +
            faq(kind, city) +
            cta()
        )
    elif topic == "cost":
        title = f"How Much Does It Cost to Hire a {kind.title()} in {city}? (2026 Prices)"
        excerpt = f"A transparent 2026 price guide to hiring a {kind} in {city} — what drives the cost, typical tiers, and how to get the best value."
        cat, mins = "Planning", 7
        body = (
            p(f"\"How much will it cost?\" is the first question almost every event planner in {city} asks about a {kind}. "
              f"The honest answer is: it depends — but the factors are predictable. This guide breaks down exactly what "
              f"you're paying for, so you can budget with confidence and spot good value.") +
            price_table(kind) +
            h2("Factors that move the price up or down") +
            ul([f"Experience and demand — established {cat_label.lower()} command higher fees",
                "Event type — weddings and corporate events price above private parties",
                "Duration and number of sets or performers",
                "Production — sound, lighting, and whether a technician is included",
                f"Travel and timing — peak season and remote venues in {city} add cost"]) +
            h2("How to get the best value (without cutting quality)") +
            p(f"Value isn't the lowest price — it's the best performance for your budget. Compare several {kind}s side by "
              f"side on UAESinger, watch their reels, and read reviews. Book early for peak season, be upfront about your "
              f"budget, and be flexible on timing where you can.") +
            ul(["Shortlist 3–5 options and compare like-for-like",
                "Book early — the best acts sell out months ahead",
                "Be clear about your budget so quotes come back realistic",
                "Bundle where possible (e.g. a band that also DJs between sets)"]) +
            faq(kind, city) +
            cta()
        )
    else:  # best
        title = f"Best {kind.title()}s for Weddings & Events in {city} (2026)"
        excerpt = f"How to find and book the best {kind} for weddings and events in {city} — what separates the great from the average, and how to shortlist fast."
        cat, mins = "Tips", 7
        body = (
            p(f"The right {kind} turns a good event in {city} into one your guests remember for years. But with so many "
              f"options, how do you find the genuinely great ones? This guide covers what sets the best apart and how to "
              f"shortlist quickly and confidently.") +
            h2(f"What makes a great {kind}") +
            ul(["A polished, varied repertoire that reads the room and adapts",
                f"Proven experience at {city} weddings, launches and corporate nights",
                "Professional sound and a reliable, punctual, well-presented setup",
                "Strong reviews and genuine live performance videos"]) +
            h2("Match the act to your event") +
            p(f"Intimate weddings suit an acoustic {kind}; large launches call for a bigger production with full sound and "
              f"lighting. Think about your venue size, guest count and the feeling you want to create, then filter "
              f"{cat_label} on UAESinger by style, language and budget to build a shortlist.") +
            price_table(kind) +
            h2(f"Why book your {kind} early") +
            p(f"The best {cat_label.lower()} in {city} get reserved months in advance, especially for peak wedding season "
              f"and major holidays. Shortlist early, watch the reels, check availability for your date, and lock it in.") +
            faq(kind, city) +
            cta()
        )
    return title, slugify(title), excerpt, cat, body, mins

def main():
    rows = []
    for city in CITIES:
        for kind, cat_label in CATS.values():
            for topic in ("hire", "cost", "best"):
                rows.append(build(topic, kind, cat_label, city))
    # de-dup slugs (band/DJ share a category label but different kind → unique slugs)
    seen, uniq = set(), []
    for r in rows:
        if r[1] in seen:
            continue
        seen.add(r[1]); uniq.append(r)

    tmp = tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, newline="")
    w = csv.writer(tmp)
    for slug, title, excerpt, cat, body, mins in uniq:
        w.writerow([slug, title, excerpt, cat, body, mins, "true"])
    tmp.close()

    # Upsert via a temp table (session mode) so re-runs refresh content in place.
    sqlf = tempfile.NamedTemporaryFile("w", suffix=".sql", delete=False)
    sqlf.write(
        "create temp table _imp(slug text,title text,excerpt text,category text,body text,read_mins int,published bool);\n"
        f"\\copy _imp from '{tmp.name}' with (format csv)\n"
        "insert into posts(slug,title,excerpt,category,body,read_mins,published) "
        "select slug,title,excerpt,category,body,read_mins,published from _imp "
        "on conflict(slug) do update set title=excluded.title,excerpt=excluded.excerpt,"
        "category=excluded.category,body=excluded.body,read_mins=excluded.read_mins,published=excluded.published;\n"
    )
    sqlf.close()
    subprocess.run(PG + ["-v", "ON_ERROR_STOP=1", "-f", sqlf.name], check=True)
    print(f"upserted {len(uniq)} full-length articles")

if __name__ == "__main__":
    main()
