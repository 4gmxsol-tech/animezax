#!/usr/bin/env python3
"""Regression checks for the Jujutsu Kaisen organic-search landing page."""
from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "anime" / "jujutsu-kaisen.html"
SITEMAP = ROOT / "sitemap.xml"
URL = "https://animezax.com/anime/jujutsu-kaisen.html"

class MetadataParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.in_title = False
        self.meta = {}
        self.h1_parts = []
        self.in_h1 = False
        self.canonical = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
        elif tag == "meta":
            key = attrs.get("name") or attrs.get("property")
            if key:
                self.meta[key.lower()] = attrs.get("content", "")
        elif tag == "link" and attrs.get("rel", "").lower() == "canonical":
            self.canonical = attrs.get("href", "")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self.in_h1:
            self.h1_parts.append(data)

def main():
    html = PAGE.read_text(encoding="utf-8")
    parser = MetadataParser()
    parser.feed(html)
    title = " ".join("".join(parser.title_parts).split())
    description = parser.meta.get("description", "").strip()
    sitemap = SITEMAP.read_text(encoding="utf-8")
    errors = []

    if not 45 <= len(title) <= 65:
        errors.append(f"title length must be 45-65 characters (got {len(title)})")
    if not 120 <= len(description) <= 160:
        errors.append(f"description length must be 120-160 characters (got {len(description)})")
    if parser.meta.get("og:title") != title:
        errors.append("og:title must match the document title")
    if parser.meta.get("twitter:title") != title:
        errors.append("twitter:title must match the document title")
    if parser.meta.get("og:description") != description:
        errors.append("og:description must match the meta description")
    if parser.meta.get("twitter:description") != description:
        errors.append("twitter:description must match the meta description")
    if "Jujutsu Kaisen" not in " ".join(parser.h1_parts):
        errors.append("H1 must identify Jujutsu Kaisen")
    for phrase in ("plot summary", "cursed energy", "power system", "watch order"):
        if phrase not in description.lower():
            errors.append(f"meta description must include '{phrase}'")
    if parser.canonical != URL:
        errors.append("canonical URL must point to the preferred HTTPS page")
    if URL not in sitemap:
        errors.append("Jujutsu Kaisen page must remain in sitemap.xml")
    if f"<loc>{URL}</loc><lastmod>2026-11-09</lastmod>" not in sitemap:
        errors.append("Jujutsu Kaisen sitemap lastmod must match the refreshed page date")

    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors))
        return 1
    print(f"PASS: Jujutsu Kaisen snippet metadata is consistent (title={len(title)}, description={len(description)} characters).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
