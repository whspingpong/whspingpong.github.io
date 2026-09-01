"""
add-photos.py: shrinks big camera photos down to web size.

WHY YOU NEED THIS:
  Photos straight off a camera or phone are 5-8 MB each. A web page with 20 of
  those would take forever to load and would blow past GitHub Pages' size
  limits. This script makes two smaller copies of each photo automatically.

HOW TO USE IT:
  1. Copy your photos into the  tools/incoming  folder.
  2. Open a terminal in the website folder and run:

         python tools/add-photos.py

  3. It prints a ready-made line for each photo. Paste those lines into the
     PHOTOS list in assets/js/data.js, then set the correct "tournament" and
     write a real caption.
  4. Delete the originals out of tools/incoming once you're done.

REQUIREMENTS:  pip install pillow
"""

from PIL import Image, ImageOps
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

INCOMING = os.path.join(HERE, "incoming")
OUT_FULL = os.path.join(ROOT, "assets", "img", "photos")
OUT_THUMB = os.path.join(ROOT, "assets", "img", "thumbs")

FULL_WIDTH, FULL_QUALITY = 1600, 82
THUMB_WIDTH, THUMB_QUALITY = 700, 78

EXTS = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".tif", ".tiff")


def slugify(name):
    """Turn 'My Photo (1).JPG' into 'my-photo-1'."""
    base = os.path.splitext(name)[0].lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return base or "photo"


def save(img, path, max_w, quality):
    im = img.copy()
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return os.path.getsize(path)


def main():
    for d in (INCOMING, OUT_FULL, OUT_THUMB):
        os.makedirs(d, exist_ok=True)

    files = sorted(f for f in os.listdir(INCOMING) if f.lower().endswith(EXTS))

    if not files:
        print("Nothing to do. Put some photos in tools/incoming first.")
        print("Looked in:", INCOMING)
        return

    used = set()
    lines = []

    for name in files:
        slug = slugify(name)
        n = 2
        while slug in used or os.path.exists(os.path.join(OUT_FULL, slug + ".jpg")):
            slug = "%s-%d" % (slugify(name), n)
            n += 1
        used.add(slug)

        try:
            img = ImageOps.exif_transpose(Image.open(os.path.join(INCOMING, name)))
            img = img.convert("RGB")
        except Exception as e:
            print("  SKIPPED %s, could not read it (%s)" % (name, e))
            continue

        big = save(img, os.path.join(OUT_FULL, slug + ".jpg"), FULL_WIDTH, FULL_QUALITY)
        small = save(img, os.path.join(OUT_THUMB, slug + ".jpg"), THUMB_WIDTH, THUMB_QUALITY)

        print("  %-34s -> %s  (%d KB + %d KB)" % (name, slug, big // 1024, small // 1024))

        lines.append(
            '  { file: "%s", tournament: "CHANGE-ME", caption: "CHANGE ME" },' % slug
        )

    if not lines:
        return

    print("\n" + "=" * 74)
    print("Done. Paste these into the PHOTOS list in assets/js/data.js,")
    print("then fix the tournament id and caption on each line:")
    print("=" * 74 + "\n")
    print("\n".join(lines))
    print()


if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("Pillow is missing. Run:  pip install pillow")
        sys.exit(1)
