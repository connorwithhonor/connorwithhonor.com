#!/usr/bin/env python3
"""Builds index.html from scripts/home-template.html. Keeps the JSON-LD blocks of the
previous homepage verbatim (pass the old file), and bakes the 3 newest blog cards
and the current latest video IDs in as no-JS fallbacks. Run: python3 scripts/build-home.py OLD_INDEX EPID SHID"""
import re,sys,html
old=open(sys.argv[1]).read(); ep,sh=sys.argv[2],sys.argv[3]
ld='\n'.join(m.group(0) for m in re.finditer(r'<script type="application/ld\+json">.*?</script>',old,re.S))
ld=ld.replace('(20 years sworn, 23 years total law enforcement)','(20 years LAPD, honorably retired with no pension; 23 years total in law enforcement)')  # bio canon 2026-11-25
b=open('blog/index.html').read()
posts=''
for m in list(re.finditer(r'<a class="ep-card" href="([^"]+)">(.*?)</a>',b,re.S))[:3]:
    g=m.group(2)
    meta=re.search(r'class="ep-meta">(.*?)</span>',g,re.S); h=re.search(r'<h3>(.*?)</h3>',g,re.S); p=re.search(r'class="ep-excerpt">(.*?)</p>',g,re.S)
    posts+='<a class="post" href="%s"><span class="meta">%s</span><h3>%s</h3><p>%s</p></a>'%(m.group(1),(meta.group(1) if meta else '').replace('//','·'),h.group(1) if h else '',p.group(1) if p else '')
t=open('scripts/home-template.html').read().replace('{{LDJSON}}',ld).replace('{{POSTS}}',posts).replace('{{EPID}}',ep).replace('{{SHID}}',sh)
open('index.html','w').write(t); print('ok',len(t),'bytes, ld blocks:',ld.count('ld+json'),'posts:',posts.count('class="post"'))
