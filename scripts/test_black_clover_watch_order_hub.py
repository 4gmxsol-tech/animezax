#!/usr/bin/env python3
"""Regression checks for Black Clover watch-order hub discovery."""
import json
import pathlib
import re
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
HUB_URL = "https://animezax.com/watch-order/"
ARTICLE_URL = "https://animezax.com/articles/black-clover-watch-order.html"
description = "Find spoiler-light anime watch orders for One Piece, Black Clover, Naruto, Dragon Ball, Attack on Titan, Demon Slayer and Jujutsu Kaisen."
hub = (ROOT / "watch-order" / "index.html").read_text(encoding="utf-8")
article = (ROOT / "articles" / "black-clover-watch-order.html").read_text(encoding="utf-8")
assert hub.count('href="../articles/black-clover-watch-order.html"') == 1, "Watch-order hub must expose one Black Clover guide card"
assert "TV episodes, the Sword of the Wizard King movie, and Season 2 viewing notes." in hub
assert f'<link rel="canonical" href="{HUB_URL}">' in hub
assert f'<meta name="description" content="{description}">' in hub
for key in ("og:type", "og:site_name", "og:title", "og:description", "og:url"):
    assert hub.count(f'property="{key}"') == 1, f"Expected one {key} tag"
assert hub.count('name="twitter:description"') == 1
schemas = re.findall(r'<script type="application/ld\+json">(.*?)</script>', hub, re.S)
assert len(schemas) == 1, "Watch-order hub must contain one JSON-LD block"
schema = json.loads(schemas[0])
assert schema.get("@type") == "CollectionPage"
assert schema.get("description") == description
assert schema.get("url") == HUB_URL
assert f'<link rel="canonical" href="{ARTICLE_URL}">' in article
assert "Black Clover watch order" in article
assert "Sword of the Wizard King" in article
assert 'name="robots" content="noindex' not in article.lower()
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
for url in (HUB_URL, ARTICLE_URL):
    entries = [node for node in sitemap.findall("sm:url", ns)
               if node.findtext("sm:loc", default="", namespaces=ns) == url]
    assert len(entries) == 1, f"Expected one sitemap entry for {url}"
hub_entry = next(node for node in sitemap.findall("sm:url", ns)
                 if node.findtext("sm:loc", default="", namespaces=ns) == HUB_URL)
assert hub_entry.findtext("sm:lastmod", default="", namespaces=ns) == "2026-11-15"
print("Black Clover watch-order discovery, canonical metadata, Open Graph, CollectionPage schema and sitemap are valid.")
