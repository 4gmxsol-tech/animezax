#!/usr/bin/env python3
"""Ensure generic article archive thumbnails do not announce misleading alt text."""
from html.parser import HTMLParser
from pathlib import Path


class ArticleArchiveParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.card_depth = 0
        self.heading_depth = 0
        self.cards = 0
        self.images = 0
        self.headings = 0
        self.linked_headings = 0
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()

        if tag == "article" and "article-card" in classes:
            self.card_depth += 1
            self.cards += 1
            return

        if not self.card_depth:
            return

        if tag == "img" and "article-thumb" in classes:
            self.images += 1
            if "alt" not in attrs:
                self.errors.append("Article thumbnail is missing its alt attribute.")
            elif attrs["alt"] != "":
                self.errors.append("Generic article thumbnail must use empty alt text.")
            if attrs.get("loading") != "lazy":
                self.errors.append("Article thumbnail must retain lazy loading.")

        if tag == "h2":
            self.heading_depth += 1
            self.headings += 1
        elif tag == "a" and self.heading_depth:
            if attrs.get("href"):
                self.linked_headings += 1

    def handle_endtag(self, tag):
        if tag == "h2" and self.heading_depth:
            self.heading_depth -= 1
        elif tag == "article" and self.card_depth:
            self.card_depth -= 1


def main():
    source = Path("articles/index.html").read_text(encoding="utf-8")
    parser = ArticleArchiveParser()
    parser.feed(source)

    assert parser.cards > 0, "Expected article cards in the archive."
    assert parser.images == parser.cards, (
        f"Expected one article thumbnail per card; found {parser.images} images "
        f"for {parser.cards} cards."
    )
    assert parser.headings == parser.cards, (
        f"Expected one heading per card; found {parser.headings} headings."
    )
    assert parser.linked_headings == parser.cards, (
        "Every article card must retain a linked heading so its content remains "
        "available when the thumbnail is treated as decorative."
    )
    assert not parser.errors, "\\n".join(parser.errors)

    print(
        f"PASS: {parser.cards} article cards retain linked headings; "
        f"{parser.images} generic thumbnails use empty alt text and lazy loading."
    )


if __name__ == "__main__":
    main()
