#!/usr/bin/env python3
"""Stamp local css/js/data URLs in the HTML with a hash of the file's contents.

GitHub Pages serves these with cache-control: max-age=600 and no way to change
that, so editing site.css without changing its URL leaves browsers showing the
old stylesheet — the same trap that made the photographs appear under the wrong
captions. A content hash in the query string means a changed file is a changed
URL, and the cache cannot serve a stale copy.

Run after editing anything under css/, js/ or data/, then commit:

    python3 tools/stamp-assets.py
"""

import hashlib
import os
import re
import sys

PAGES = ("index.html", "contact.html", "pin-editor.html")
ASSET = re.compile(r'(href|src)="((?:css|js|data)/[^"?]+)(?:\?v=[0-9a-f]+)?"')


def digest(path):
    with open(path, "rb") as fh:
        return hashlib.md5(fh.read()).hexdigest()[:8]


def main(root="."):
    touched = []
    for page in PAGES:
        page_path = os.path.join(root, page)
        if not os.path.exists(page_path):
            continue
        with open(page_path) as fh:
            before = fh.read()

        def stamp(match):
            attr, rel = match.group(1), match.group(2)
            target = os.path.join(root, rel)
            if not os.path.exists(target):
                print("  missing, left alone: %s" % rel)
                return match.group(0)
            return '%s="%s?v=%s"' % (attr, rel, digest(target))

        after = ASSET.sub(stamp, before)
        if after != before:
            with open(page_path, "w") as fh:
                fh.write(after)
            touched.append(page)

    print("stamped: %s" % (", ".join(touched) if touched else "nothing to do"))
    return 0


if __name__ == "__main__":
    sys.exit(main(os.path.join(os.path.dirname(__file__), "..")))
