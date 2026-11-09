"""Build the local masthead faces from the two official Google Fonts sources.

Usage: python scripts/subset-masthead-fonts.py NotoSerifSC.ttf ZhiMangXing-Regular.ttf
Keep the upstream OFL files in public/fonts alongside these subsets.
Upstream: https://github.com/google/fonts/tree/main/ofl/notoserifsc
          https://github.com/google/fonts/tree/main/ofl/zhimangxing
The first input can also be a static 600-weight subset from fonts.googleapis.com.
"""
from pathlib import Path
import re
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
main = (root / "src/main.tsx").read_text(encoding="utf-8")
navigation = re.search(r"const nav=\[(.*?)\] as const", main).group(1)
labels = re.findall(r"\['[^']+','([^']+)'\]", navigation)
brand = re.search(r'<span className="brand-title">([^<]+)</span>', main).group(1)
assert len(labels) >= 5

for source, name, text, weight in (
    (sys.argv[1], "march-navigation", "".join(labels), 600),
    (sys.argv[2], "march-brand", brand, None),
):
    font = TTFont(source)
    # Zhi Mang Xing has no middle dot; punctuation uses the normal serif fallback.
    codepoints = {ord(char) for char in text if char != "·"}
    missing = codepoints - font.getBestCmap().keys()
    if missing:
        raise ValueError(f"Missing characters: {''.join(map(chr, missing))}")
    if weight is not None and "fvar" in font:
        instantiateVariableFont(font, {"wght": weight}, inplace=True)
    options = subset.Options()
    options.name_IDs = ["*"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    font.flavor = "woff2"
    target = root / "src/fonts" / f"{name}.woff2"
    font.save(target)
    assert set(TTFont(target).getBestCmap()) == codepoints
    print(f"{target.name}: {len(codepoints)} glyphs, {target.stat().st_size} bytes")
