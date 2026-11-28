#!/usr/bin/env python3
"""Check ad loading: no consent gate, no raw ad code in HTML, accurate privacy disclosure."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DIRECT_AD = re.compile(
    r"<(?:script|iframe)\b[^>]*\bsrc\s*=\s*[\"']https?://(?:www\.)?(?:bicea\.org|bauval\.org|highrevenueformat\.com)/",
    re.IGNORECASE,
)
INLINE_OPTIONS = re.compile(r"\batOptions\s*=", re.IGNORECASE)
NO_AD_PAGES = ("privacy.html", "404.html", "verify-payment.html")

errors = []
manual_slot_pages = []
for page in ROOT.rglob("*.html"):
    if ".git" in page.parts or "node_modules" in page.parts:
        continue
    source = page.read_text(encoding="utf-8", errors="replace")
    rel = page.relative_to(ROOT).as_posix()
    if DIRECT_AD.search(source) or INLINE_OPTIONS.search(source):
        errors.append(f"Ad code must be injected by the loader, not embedded in HTML: {rel}")
    if "data-adsterra-manual-slot=" in source:
        manual_slot_pages.append(page)
        if "adsterra-ads.js" not in source:
            errors.append(f"Manual ad placeholder must load the ad loader: {rel}")
    if rel in NO_AD_PAGES and ("data-adsterra-manual-slot=" in source or "adsterra-ads" in source):
        errors.append(f"Ads must not be loaded on: {rel}")

homepage = (ROOT / "index.html").read_text(encoding="utf-8")
article = (ROOT / "articles/one-piece-watch-order.html").read_text(encoding="utf-8")
privacy = (ROOT / "privacy.html").read_text(encoding="utf-8")
loader = (ROOT / "assets/js/adsterra-ads.js").read_text(encoding="utf-8")
engine = ROOT / "assets/js/adsterra-ads-engine.js"

if homepage.count("data-adsterra-manual-slot=") != 2:
    errors.append("Homepage must retain both ad placements.")
if article.count("data-adsterra-manual-slot=") != 1:
    errors.append("One Piece guide must retain its ad placement.")
for page_name, source in (("homepage", homepage), ("One Piece guide", article)):
    if "adsterra-ads.js" not in source:
        errors.append(f"{page_name} must load the ad loader.")

for phrase in ("Advertising and third-party services", "Adsterra", "cookies"):
    if phrase.lower() not in privacy.lower():
        errors.append(f"Privacy notice is missing advertising disclosure: {phrase}")
for stale in ("Accept advertising", "Reject advertising", "change-ad-preferences"):
    if stale.lower() in (privacy + loader).lower():
        errors.append(f"Leftover consent UI text found: {stale}")
for stale in ("showConsent", "readChoice", "writeChoice", "CONSENT_KEY ="):
    if stale in loader:
        errors.append(f"Leftover consent code in loader: {stale}")
for phrase in ("adsterra-ads-engine.js", "IS_PRIVACY_PAGE", 'loading = "lazy"', "min-height"):
    if phrase not in loader:
        errors.append(f"Loader is missing expected behavior: {phrase}")
if not engine.is_file():
    errors.append("The ad engine file is missing.")

if errors:
    print("\n".join(f"FAIL: {item}" for item in errors))
    sys.exit(1)
print(f"PASS: no consent gate; {len(manual_slot_pages)} pages use manual ad slots; privacy notice matches.")
