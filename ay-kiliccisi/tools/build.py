#!/usr/bin/env python3
"""Ay Kılıççısı: src/ ve data/ parçalarını tek bir HTML dosyasında birleştirir.
Kullanım: python3 tools/build.py  ->  dist/ay-kiliccisi.html
Sıra: 00-head.html, 05-prelude.js, data/*.js, src/*.js (numara sırasıyla), 99-end.html"""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = sorted((root / 'src').glob('*'))
head = [p for p in src if p.name.startswith('00-')]
end = [p for p in src if p.name.startswith('99-')]
pre = [p for p in src if p.name.startswith('05-')]
body = [p for p in src if p not in head + end + pre and p.suffix == '.js']
data = sorted((root / 'data').glob('*.js'))
# guard: a "//" comment placed after code that is itself followed by more code on the same line silently disables that code
import re
bad = []
for fp in body:
    for n, l in enumerate(fp.read_text(encoding='utf-8').split('\n'), 1):
        i = l.find('//')
        while i >= 0:
            lead = l[:i]
            if lead.strip() and lead.count("'") % 2 == 0 and lead.count('"') % 2 == 0 and lead.count('`') % 2 == 0 and not lead.endswith(':'):
                rest = l[i + 2:]
                if re.search(r"[;{}]\s*\S", rest) and re.search(r"[\w\])]=[^=\s]|[\w$]\(", rest):
                    bad.append(f'{fp.name}:{n}: {l[i:i+90]}')
                break
            i = l.find('//', i + 2)
if bad:
    print('HATA: satır ortasındaki yorum kodu kapatıyor:\n' + '\n'.join(bad)); sys.exit(1)
parts = []
for p in head + pre:
    parts.append(p.read_text(encoding='utf-8'))
for p in data:
    parts.append(p.read_text(encoding='utf-8'))
for p in body:
    parts.append('// ---- ' + p.name + '\n' + p.read_text(encoding='utf-8'))
for p in end:
    parts.append(p.read_text(encoding='utf-8'))
out = root / 'dist' / 'ay-kiliccisi.html'
txt = '\n'.join(s.rstrip('\n') for s in parts) + '\n'
out.write_text(txt, encoding='utf-8')
print(f'{out} {len(txt.encode())/1e6:.2f} MB')
