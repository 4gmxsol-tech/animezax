#!/usr/bin/env python3
"""Regression checks for the Jujutsu Kaisen organic-search landing page."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "anime" / "jujutsu-kaisen.html"
SITEMAP = ROOT / "sitemap.xml"
URL = "https://animezax.com/anime/jujutsu-kaisen.html"
ONE_PIECE_PAGE = ROOT / "articles" / "one-piece-watch-order.html"
ONE_PIECE_URL = "https://animezax.com/articles/one-piece-watch-order.html"

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

    html_lang = re.search(r'<html\\b[^>]*\\blang=["\\']([^"\\']+)', html, re.I)
    tv_series = None
    for block in re.findall(r'<script\\s+type=["\\']application/ld\\+json["\\']>(.*?)</script>', html, re.I | re.S):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        if data.get("@type") == "TVSeries":
            tv_series = data
            break
    if not html_lang:
        errors.append("HTML must declare its content language")
    elif not tv_series or tv_series.get("inLanguage") != html_lang.group(1):
        errors.append("TVSeries inLanguage must match the HTML document language")

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
    if "power system" not in title.lower():
        errors.append("title must reflect the verified power-system search intent")
    if "power system" not in " ".join(parser.h1_parts).lower():
        errors.append("H1 must identify the power-system section")
    for phrase in ("synopsis", "plot summary", "cursed energy", "power system", "watch order"):
        if phrase not in description.lower():
            errors.append(f"meta description must include '{phrase}'")
    if parser.canonical != URL:
        errors.append("canonical URL must point to the preferred HTTPS page")
    if URL not in sitemap:
        errors.append("Jujutsu Kaisen page must remain in sitemap.xml")
    if f"<loc>{URL}</loc><lastmod>2026-11-10</lastmod>" not in sitemap:
        errors.append("Jujutsu Kaisen sitemap lastmod must match the refreshed page date")


    one_piece_html = ONE_PIECE_PAGE.read_text(encoding="utf-8")
    one_piece_parser = MetadataParser()
    one_piece_parser.feed(one_piece_html)
    one_piece_title = " ".join("".join(one_piece_parser.title_parts).split())
    one_piece_description = one_piece_parser.meta.get("description", "").strip()

    if not 45 <= len(one_piece_title) <= 65:
        errors.append(f"One Piece title length must be 45-65 characters (got {len(one_piece_title)})")
    if not 120 <= len(one_piece_description) <= 160:
        errors.append(f"One Piece description length must be 120-160 characters (got {len(one_piece_description)})")
    if one_piece_parser.meta.get("og:title") != one_piece_title:
        errors.append("One Piece og:title must match the document title")
    if one_piece_parser.meta.get("twitter:title") != one_piece_title:
        errors.append("One Piece twitter:title must match the document title")
    if one_piece_parser.meta.get("og:description") != one_piece_description:
        errors.append("One Piece og:description must match the meta description")
    if one_piece_parser.meta.get("twitter:description") != one_piece_description:
        errors.append("One Piece twitter:description must match the meta description")
    if "One Piece" not in " ".join(one_piece_parser.h1_parts):
        errors.append("One Piece H1 must identify the series")
    for phrase in ("one piece watch guide", "episode 1", "filler", "movies", "specials", "without spoilers"):
        if phrase not in one_piece_description.lower():
            errors.append(f"One Piece description must include '{phrase}'")
    if one_piece_parser.canonical != ONE_PIECE_URL:
        errors.append("One Piece canonical URL must point to the preferred HTTPS page")
    if ONE_PIECE_URL not in sitemap:
        errors.append("One Piece watch guide must remain in sitemap.xml")
    if f"<loc>{ONE_PIECE_URL}</loc><lastmod>2026-11-10</lastmod>" not in sitemap:
        errors.append("One Piece sitemap lastmod must match the refreshed page date")
    if '"dateModified":"2026-11-10"' not in one_piece_html:
        errors.append("One Piece Article dateModified must match the refreshed page date")

    if errors:
        print("\n".join(f"FAIL: {error}" for error in errors))
        return 1
    print(f"PASS: Jujutsu Kaisen snippet metadata is consistent (title={len(title)}, description={len(description)} characters).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
