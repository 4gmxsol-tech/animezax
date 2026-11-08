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

    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors))
        return 1
    print(f"PASS: Black Clover status, official references, metadata, FAQ schema and sitemap are consistent (title={len(title)}, description={len(description)} characters).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
