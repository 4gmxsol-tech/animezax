from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path


class HeadMetadataParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_head = False
        self.in_title = False
        self.title_parts = []
        self.meta = defaultdict(list)
        self.canonical = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "head":
            self.in_head = True
        elif tag == "title" and self.in_head:
            self.in_title = True
        elif tag == "meta" and self.in_head:
            key = attrs.get("property") or attrs.get("name")
            if key:
                self.meta[key].append(attrs.get("content", ""))
        elif tag == "link" and self.in_head:
            rel = attrs.get("rel", "").lower().split()
            if "canonical" in rel:
                self.canonical.append(attrs.get("href", ""))

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "head":
            self.in_head = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)


def main():
    path = Path("articles/index.html")
    parser = HeadMetadataParser()
    parser.feed(path.read_text(encoding="utf-8"))
    title = "".join(parser.title_parts).strip()

    required = ("og:type", "og:site_name", "og:title", "og:description", "og:url")
    for key in required:
        values = parser.meta.get(key, [])
        assert len(values) == 1, f"{key} must appear exactly once; found {len(values)}"

    assert parser.meta["og:type"][0] == "website", "Article archive must use the website Open Graph type"
    assert parser.meta["og:title"][0] == title, "Open Graph title must match the document title"
    assert parser.meta["twitter:title"] == [title], "Twitter title must match the document title"
    assert len(parser.canonical) == 1, f"Expected one canonical URL; found {len(parser.canonical)}"
    assert parser.meta["og:url"][0] == parser.canonical[0], "Open Graph URL must match the canonical URL"
    assert parser.meta["twitter:description"] == parser.meta["og:description"], "Twitter and Open Graph descriptions must match"
    assert len(parser.meta["og:image"]) == 1, "Expected exactly one Open Graph image"

    print("AnimeZax article archive social metadata: PASS")


if __name__ == "__main__":
    main()
