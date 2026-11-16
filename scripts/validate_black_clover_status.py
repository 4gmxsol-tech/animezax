#!/usr/bin/env python3
"""Regression checks for Black Clover Season 2 status and official-source accuracy."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "anime" / "black-clover.html"
SITEMAP = ROOT / "sitemap.xml"
URL = "https://animezax.com/anime/black-clover.html"
OFFICIAL_ON_AIR = "https://www.bclover.jp/onair/"
STALE_ANSWER = "Check official announcements for any newer continuation news"

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.in_title = False
        self.meta = {}
        self.canonical = ""
        self.scripts = []
        self.current_script = None
        self.text_parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key:
                self.meta[key.lower()] = attrs.get("content", "")
        elif tag == "link" and attrs.get("rel", "").lower() == "canonical":
            self.canonical = attrs.get("href", "")
        elif tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self.current_script = []

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.current_script is not None:
            self.scripts.append("".join(self.current_script))
            self.current_script = None

    def handle_data(self, data):
        self.text_parts.append(data)
        if self.in_title:
            self.title_parts.append(data)
        if self.current_script is not None:
            self.current_script.append(data)

def main():
    html = PAGE.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(html)
    title = " ".join("".join(parser.title_parts).split())
    description = parser.meta.get("description", "").strip()
    visible_text = " ".join(" ".join(parser.text_parts).split())
    errors = []

    if not 45 <= len(title) <= 65:
        errors.append(f"title length must be 45-65 characters (got {len(title)})")
    if not 120 <= len(description) <= 160:
        errors.append(f"description length must be 120-160 characters (got {len(description)})")
    if parser.meta.get("og:title") != title or parser.meta.get("twitter:title") != title:
        errors.append("Open Graph and Twitter titles must match the document title")
    if parser.meta.get("og:description") != description or parser.meta.get("twitter:description") != description:
        errors.append("Open Graph and Twitter descriptions must match the meta description")
    if parser.canonical != URL:
        errors.append("canonical URL must remain the preferred HTTPS page")
    if "Black Clover Season 2" not in title:
        errors.append("title must identify Black Clover Season 2")
    if "October 2026 Japan premiere" not in description:
        errors.append("description must reflect the verified 2026 Japan premiere")
    if STALE_ANSWER in html:
        errors.append("outdated FAQ answer must not return")
    if "October 3, 2026" not in visible_text or OFFICIAL_ON_AIR not in html:
        errors.append("visible page must include the verified premiere date and official on-air source")

    faq_pages = []
    for raw in parser.scripts:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if data.get("@type") == "FAQPage":
            faq_pages.append(data)
    questions = [q for faq in faq_pages for q in faq.get("mainEntity", [])]
    finished = next((q for q in questions if q.get("name") == "Is Black Clover finished?"), None)
    answer = finished.get("acceptedAnswer", {}).get("text", "") if finished else ""
    if not finished or "Season 2" not in answer or "October 3, 2026" not in answer:
        errors.append("FAQPage structured data must describe the current Season 2 status")

    sitemap = SITEMAP.read_text(encoding="utf-8")
    match = re.search(r"<url>\s*<loc>" + re.escape(URL) + r"</loc>\s*<lastmod>([^<]+)</lastmod>", sitemap)
    if not match or match.group(1) != "2026-11-09":
        errors.append("Black Clover sitemap lastmod must match the 2026-11-09 content update")

    # Release-calendar entries must reflect elapsed and upcoming weekly episodes.
    calendar = (ROOT / "release-calendar.html").read_text(encoding="utf-8")
    calendar_events = re.findall(
        r'<article class="calendar-event"[^>]*>[\s\S]*?</article>', calendar
    )
    event_by_date = {}
    for event in calendar_events:
        date_match = re.search(r'data-date="([^"]+)"', event)
        if date_match:
            event_by_date[date_match.group(1)] = event

    expected_events = {
        "2026-10-24": ("Black Clover Season 2 — Episode 4", "SCHEDULED DATE PASSED"),
        "2026-10-31": ("Black Clover Season 2 — Episode 5", "AIRED · OCTOBER 31"),
        "2026-11-07": ("Black Clover Season 2 — Episode 6", "AIRED · NOVEMBER 7"),
        "2026-11-14": ("Black Clover Season 2 — Episode 7", "AIRED · NOVEMBER 14"),
        "2026-11-21": ("Black Clover Season 2 — Episode 8", "UPCOMING · NOVEMBER 21"),
    }
    for event_date, (event_title, event_status) in expected_events.items():
        event = event_by_date.get(event_date, "")
        if event_title not in event or event_status not in event:
            errors.append(f"release calendar must show {event_title} as {event_status}")

    episode8 = event_by_date.get("2026-11-21", "")
    if "23:00 JST" not in episode8 or OFFICIAL_ON_AIR not in episode8:
        errors.append("Episode 8 calendar entry must show the weekly Japan broadcast slot and official source")

    for stale_date in ("2026-10-20", "2026-10-23"):
        if "UPCOMING" in event_by_date.get(stale_date, ""):
            errors.append(f"past calendar date {stale_date} must not remain marked upcoming")

    calendar_descriptions = [
        re.search(pattern, calendar)
        for pattern in (
            r'<meta name="description" content="([^"]+)"',
            r'<meta property="og:description" content="([^"]+)"',
            r'<meta name="twitter:description" content="([^"]+)"',
        )
    ]
    if any(match is None for match in calendar_descriptions):
        errors.append("release calendar must retain search and social descriptions")
    else:
        descriptions = [match.group(1) for match in calendar_descriptions]
        if not (descriptions[0] == descriptions[1] == descriptions[2]
                and "November 21" in descriptions[0]):
            errors.append("release calendar descriptions must match and mention the current episode schedule")

    episode4_html = (ROOT / "articles" / "black-clover-season-2-episode-4-release-date.html").read_text(encoding="utf-8")
    episode4_title = re.search(r"<title>(.*?)</title>", episode4_html, re.I | re.S)
    episode4_descriptions = [
        re.search(pattern, episode4_html)
        for pattern in (
            r'<meta name="description" content="([^"]+)"',
            r'<meta property="og:description" content="([^"]+)"',
            r'<meta name="twitter:description" content="([^"]+)"',
        )
    ]
    if not episode4_title or "Expected" in episode4_title.group(1):
        errors.append("Episode 4 title must no longer describe its past date as expected")
    if any(match is None for match in episode4_descriptions):
        errors.append("Episode 4 page must retain search and social descriptions")
    else:
        descriptions = [match.group(1) for match in episode4_descriptions]
        if not (descriptions[0] == descriptions[1] == descriptions[2]
                and "date has passed" in descriptions[0]):
            errors.append("Episode 4 search and social descriptions must reflect the passed date")

    episode4_schema = re.search(
        r'<script type="application/ld\+json">(.*?)</script>', episode4_html, re.S
    )
    if not episode4_schema:
        errors.append("Episode 4 page must retain Article structured data")
    else:
        try:
            schema = json.loads(episode4_schema.group(1))
            if schema.get("dateModified") != "2026-11-16":
                errors.append("Episode 4 Article dateModified must be November 16, 2026")
        except json.JSONDecodeError:
            errors.append("Episode 4 Article structured data must remain valid JSON")

    archive = (ROOT / "articles" / "index.html").read_text(encoding="utf-8")
    if "Black Clover Season 2 Episode 4: release date and broadcast schedule" not in archive:
        errors.append("article archive card must reflect the updated Episode 4 status")

    for page_url in (
        "https://animezax.com/articles/",
        "https://animezax.com/release-calendar.html",
        "https://animezax.com/articles/black-clover-season-2-episode-4-release-date.html",
    ):
        lastmod_match = re.search(
            r"<url>\s*<loc>" + re.escape(page_url) + r"</loc>\s*<lastmod>([^<]+)</lastmod>",
            sitemap,
        )
        if not lastmod_match or lastmod_match.group(1) != "2026-11-16":
            errors.append(f"Sitemap lastmod must reflect the November 16 update for {page_url}")

    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors))
        return 1
    print(f"PASS: Black Clover status, official references, metadata, FAQ schema and sitemap are consistent (title={len(title)}, description={len(description)} characters).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
