"""Subset the two upstream display fonts with FontTools and Brotli."""
from pathlib import Path
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
main = (root / "src/main.tsx").read_text(encoding="utf-8")
data = (root / "src/data.ts").read_text(encoding="utf-8")
cover = re.findall(r'<h1 className="hero-word type-cover" aria-label="([^"]+)"', main)
chapters = re.findall(r"<Heading>([^<]+)</Heading>", main)
chapters += re.findall(r'<h[23] className="type-chapter"[^>]*>([^<]+)</h[23]>', main)
events = re.findall(r"title:'([^']+)'", data.split("export const stops")[1].split("export const themes")[0])
themes = re.findall(r"\['([^']+)','([^']+)'", data.split("export const themes")[1].split("export const people")[0])
assert (len(cover), len(chapters), len(events), len(themes)) == (1, 4, 10, 6)

for source, stem, text in (
    (sys.argv[1], "march-cursive", cover[0][1:]),
    (sys.argv[2], "march-running", cover[0][0] + "".join(chapters + events + ["、".join(pair) for pair in themes])),
):
    font = TTFont(source)
    codepoints = {ord(char) for char in text}
    missing = codepoints - font.getBestCmap().keys()
    if missing:
        raise ValueError(f"{source}: missing {''.join(map(chr, sorted(missing)))}")
    options = subset.Options()
    options.name_IDs = ["*"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    font.flavor = "woff2"
    target = root / "src/fonts" / (stem + ".woff2")
    font.save(target)
    assert set(TTFont(target).getBestCmap()) == codepoints
    print(f"{target.name}: {len(codepoints)} characters, {target.stat().st_size} bytes")
