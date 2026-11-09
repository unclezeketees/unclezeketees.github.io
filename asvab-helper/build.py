#!/usr/bin/env python3
"""Pack src/app.html + data/*.json + banks/*.json into dist/index.html.
Usage: python3 build.py [banks_dir]   (default: banks)
"""
import json, os, sys, re

HERE = os.path.dirname(os.path.abspath(__file__))
banks_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'banks')
SUBS = ['GS','AR','WK','PC','MK','EI','AI','SI','MC','AO']

def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)

banks = {}
problems = []
for k in SUBS:
    p = os.path.join(banks_dir, k + '.json')
    if not os.path.exists(p):
        problems.append(f'missing bank {k}')
        continue
    b = load(p)
    items = b.get('items', [])
    if len(items) < 15:
        problems.append(f'{k}: only {len(items)} items')
    for it in items:
        ch = it.get('choices', [])
        if len(ch) != 4 or len(set(ch)) != 4:
            problems.append(f'{k} {it.get("id")}: choices not 4 distinct')
        if not isinstance(it.get('answer'), int) or not 0 <= it['answer'] <= 3:
            problems.append(f'{k} {it.get("id")}: bad answer index')
        for fld in ('stem', 'explanation'):
            if not it.get(fld):
                problems.append(f'{k} {it.get("id")}: missing {fld}')
        txt = ' '.join([it.get('stem',''), it.get('explanation',''), it.get('passage') or ''] + ch)
        if re.search(r'[—–]', txt):
            problems.append(f'{k} {it.get("id")}: em or en dash')
        if it.get('svg') and ('<script' in it['svg'].lower() or re.search(r'#[0-9a-fA-F]{3,6}\b', it['svg'])):
            problems.append(f'{k} {it.get("id")}: svg has script or hex color')
        it.setdefault('passage', None); it.setdefault('svg', None)
        if it.get('difficulty') not in ('easy','medium','hard'):
            it['difficulty'] = 'medium'
    banks[k] = {'name': b.get('name', k), 'items': items}

data = {
    'banks': banks,
    'afqt': load(os.path.join(HERE, 'data', 'afqt.json')),
    'ratings': load(os.path.join(HERE, 'data', 'ratings.json')),
}
src = open(os.path.join(HERE, 'src', 'app.html'), encoding='utf-8').read()
blob = json.dumps(data, ensure_ascii=True, separators=(',', ':')).replace('</', '<\\/')
out = src.replace('/*__DATA__*/', 'window.DATA=' + blob + ';')
os.makedirs(os.path.join(HERE, 'dist'), exist_ok=True)
with open(os.path.join(HERE, 'dist', 'index.html'), 'w', encoding='utf-8') as f:
    f.write(out)
print(f'built dist/index.html: {len(out)/1024:.0f} KB, banks: ' + ', '.join(f'{k}={len(banks[k]["items"])}' for k in banks))
for p in problems:
    print('WARN', p)
