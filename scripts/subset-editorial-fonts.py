"""Extend the existing Zhi Mang Xing subset for all editorial headings.

Input: official ofl/zhimangxing/ZhiMangXing-Regular.ttf from google/fonts.
OFL terms remain in public/fonts/OFL-ZhiMangXing.txt.
"""
from pathlib import Path
import base64, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[1]
text=''
for name in ('main.tsx','home-route.tsx','people.tsx','spirit-film.tsx','editorial.tsx'):
 source=(root/'src'/name).read_text(encoding='utf-8')
 text+=''.join(re.findall(r'<Heading>(.*?)</Heading>',source,re.S))
 text+=''.join(re.findall(r'<h[234][^>]+className="type-(?:chapter|event|detail|spirit)"[^>]*>(.*?)</h[234]>',source,re.S))
for name in ('data.ts','exhibit-notes.ts','crossings.ts','people-stories.ts','exhibit-interactions.ts','spirit-film-data.ts','narrative-data.ts','route-context.ts'):
 source=(root/'src'/name).read_text(encoding='utf-8')
 text+=''.join(re.findall(r'(?:heading|title|name|quality|question)\s*:\s*[\"\x27]([^\"\x27]+)',source))
 source=source.split('export const themes')[-1].split('export const people')[0] if name=='data.ts' else ''
 pairs=re.findall(r"\[\s*'([^']+)'\s*,\s*'([^']+)'",source)
 text+=''.join(first+second for first,second in pairs)
text+='历史背景重要历史征途路线长征精神长征不朽征途红军不怕远征难，万水千山只等闲。'
target=root/'src/fonts/march-running.woff2'
font=TTFont(sys.argv[1])
points=set(TTFont(target).getBestCmap())|{ord(c) for c in text if '\u3400'<=c<='\u9fff' or c in '，。！？、'}
missing=points-font.getBestCmap().keys()
if missing:raise ValueError('Missing heading glyphs: '+''.join(map(chr,missing)))
options=subset.Options();options.name_IDs=['*']
subsetter=subset.Subsetter(options);subsetter.populate(unicodes=points);subsetter.subset(font)
font.flavor='woff2';font.save(target)
assert points==set(TTFont(target).getBestCmap())
p=root/'public/intro.css';css=p.read_text(encoding='utf-8')
encoded=base64.b64encode(target.read_bytes()).decode()
css,count=re.subn(r'(@font-face\{font-family:"March Running";src:url\("data:font/woff2;base64,)[^\"]+',lambda m:m.group(1)+encoded,css)
assert count==1
css=css.replace('font:400 clamp(13px,1.15vw,17px)/1.8 "Songti SC","SimSun",serif;letter-spacing:.24em','font:400 clamp(16px,1.3vw,20px)/1.8 "March Running",serif;letter-spacing:.08em')
p.write_text(css,encoding='utf-8')
print(f'Existing display face extended: {len(points)} glyphs, {target.stat().st_size} bytes; opening font synchronized.')
