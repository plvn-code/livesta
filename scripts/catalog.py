"""
Build the shop catalogue from the client's LIVESTA catalogue (PDF codes) + livesta.ua data.
Input:  research/codes.json (codes from the PDF, page numbers), research/search/<code>.json, research/html/<code>.html, originals/<code>-<n>.jpg
Output: src/data/catalog.json, public/images/p/<code>.webp (900, on white), <code>s.webp (420), <code>c.webp (cut-out, 700, alpha)
Images are cached: delete a file to rebuild it.
"""
import json, re, html, os, sys, glob, unicodedata, concurrent.futures as cf
from PIL import Image, ImageChops
sys.path.insert(0, os.path.dirname(__file__))
from cutout import cutout

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
R = lambda *p: os.path.join(ROOT, *p)
IMG = R('public/images/p'); os.makedirs(IMG, exist_ok=True)

# Site sections: livesta.ua top breadcrumb -> our section (id, name, lead). Order = menu order.
SECTIONS = [
    ('oblychchia', 'Обличчя', 'Очищення, сироватки, креми й маски — щоденний ритуал для сяйної шкіри.', ['Для обличчя']),
    ('volossia', 'Волосся', 'Шампуні, маски й олії, що повертають волоссю силу, блиск і м’якість.', ['Для волосся']),
    ('tilo', 'Тіло', 'Гелі, скраби, креми й олії — догляд, яким хочеться насолоджуватися.', ['Для тіла']),
    ('parfumeriia', 'Парфумерія', 'Аромати, що стають вашим підписом: жіночі, чоловічі та для дому.', ['Парфумерія', 'Аромати', 'Martin Lion']),
    ('makiiazh', 'Макіяж', 'Тональні засоби, туш, помади й тіні для образу на кожен день і на свято.', ['Декоративна косметика', 'Макіяж']),
    ('zdorovia', 'Здоров’я', 'Колаген, вітаміни й функціональне харчування для краси зсередини.', ['Для здоров\'я', 'Для здоров’я', 'Здоров\'я', 'Здоров’я', 'Функціональне харчування', 'БАДи', 'Харчування']),
    ('cholovikam', 'Для нього', 'Догляд і аромати, створені для чоловіків.', ['Для чоловіків']),
    ('dityam', 'Для дітей', 'Делікатні засоби для найменших і їхніх мам.', ['Для дітей', 'Для дітей та мам']),
    ('dim', 'Для дому', 'Засоби для прання, прибирання та затишку вдома.', ['Для оселі', 'Для дому', 'Товари для дому', 'Побутова хімія']),
    ('aksesuary', 'Аксесуари', 'Пензлі, спонжі та корисні дрібниці для краси.', ['Аксесуари']),
]
SEC_BY_CRUMB = {c: s[0] for s in SECTIONS for c in s[3]}
KEYWORDS = [  # fallback when the breadcrumb is missing or unknown
    ('parfumeriia', r'парфум|туалетна вода|аромат|дифузор'), ('makiiazh', r'помад|туш |туш\b|тіні|олівець|пудр|рум’ян|тональн|консилер|блиск для губ|лак для нігтів'),
    ('volossia', r'волосс|шампун'), ('oblychchia', r'облич|шкіри навколо очей|повік|міцеляр|тонік'), ('tilo', r'тіла|душу|рук|ніг|мило|дезодорант|зубн'),
    ('zdorovia', r'колаген|капсул|вітамін|протеїн|харчов|коктейл|чай'), ('dim', r'прання|посуд|прибиран|миюч|чищ'),
]

def slugify(s, n=72):
    tr = dict(zip('абвгґдеєжзиіїйклмнопрстуфхцчшщьюяыэё', ['a','b','v','h','g','d','e','ie','zh','z','y','i','i','i','k','l','m','n','o','p','r','s','t','u','f','kh','ts','ch','sh','shch','','iu','ia','y','e','e']))
    s = ''.join(tr.get(c, c) for c in s.lower())
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s)).strip('-')[:n].strip('-')

def num(s):
    s = re.sub(r'<.*', '', str(s or ''))
    s = re.sub(r'[^\d.,]', '', s).replace(',', '.')
    try: return float(s)
    except ValueError: return 0

VOL = re.compile(r',\s*((?:\d+\s*[х×x]\s*)?\d+(?:[.,]\d+)?\s*(?:мл|г|кг|л|шт\.?|капс\.?|табл\.?|пар|см|мг|саше|пакетиків|стіків)(?:\s*\+\s*\d+(?:[.,]\d+)?\s*(?:мл|г|шт\.?))*)\s*$', re.I)
def split_name(n):
    n = html.unescape(n).replace('&quot;', '"').strip()
    n = re.sub(r'"([^"]*)"', '«\\1»', n).replace("'", '’')
    n = re.sub(r'\s+', ' ', n)
    m = VOL.search(n)
    vol = None
    if m: vol = re.sub(r'\s+', ' ', m.group(1)).replace('х', '×').replace('x', '×'); n = n[:m.start()].strip(' ,')
    return n, vol

# Series / brand: a run of capitalised Latin words in the name (PANORAMA, MARTIN LION, THALIA, Life Beauty…)
STOP = {'SPF', 'UV', 'BB', 'CC', 'DD', 'PH', 'pH', 'XL', 'XXL', 'L', 'M', 'S', 'D3', 'C', 'B', 'K', 'A', 'E', 'HD', 'Q10', '3D', 'LED', 'MAX', 'PRO', 'II', 'III', 'NEW', 'MINI', 'MIX', 'NO', 'DUO', 'OK'}
def series(name):
    """The first run of Latin words in the name, without model codes: «Claraline», «MARTIN LION», «BARRIER BOOSTING THALIA»."""
    run = []
    for w in re.findall(r"\S+", name):
        w = w.strip("«»,.()")
        if re.fullmatch(r"[A-Za-z][A-Za-z&’'\-]*", w) and w.upper() not in STOP:
            run.append(w); continue
        if run: break
    return run or None

def resolve_series(products):
    """Canonical series per product: a frequent brand word anywhere in the run wins (THALIA in «BARRIER BOOSTING THALIA»),
    a frequent two-word brand stays two words (Martin Lion), case variants merge, the most common spelling is shown."""
    first = {}
    pair = {}
    for p in products:
        r = p['series']
        if not r: continue
        first[r[0].lower()] = first.get(r[0].lower(), 0) + 1
        if len(r) > 1:
            k = (r[0] + ' ' + r[1]).lower(); pair[k] = pair.get(k, 0) + 1
    forms = {}
    for p in products:
        r = p['series']
        if not r: p['series'] = None; continue
        key = None
        if len(r) > 1 and pair.get((r[0] + ' ' + r[1]).lower(), 0) >= 3 and pair[(r[0] + ' ' + r[1]).lower()] >= first[r[0].lower()] * 0.6:
            key = r[0] + ' ' + r[1]
        else:
            big = [w for w in r if first.get(w.lower(), 0) >= 10]
            key = big[0] if big else r[0]
        if len(key) <= 2: p['series'] = None; continue
        forms.setdefault(key.lower(), {}).setdefault(key, 0)
        forms[key.lower()][key] += 1
        p['series'] = key.lower()
    display = {k: max(v.items(), key=lambda kv: (kv[1], kv[0].isupper()))[0] for k, v in forms.items()}
    for p in products:
        if p['series']: p['series'] = display[p['series']]

def text(h):
    h = re.sub(r'(?is)<(script|style|head).*?</\1>', '', h)
    h = re.sub(r'(?i)<br\s*/?>', '\n', h)
    h = re.sub(r'(?i)</(p|li|div|h\d)>', '\n', h)
    h = re.sub(r'(?i)<li[^>]*>', '• ', h)
    t = html.unescape(re.sub(r'<[^>]+>', '', h)).replace('\xa0', ' ')
    lines = [re.sub(r'[ \t]+', ' ', l).strip() for l in t.split('\n')]
    return [l for l in lines if l and len(l) > 1]

def parse_page(code):
    f = R('research/html', f'{code}.html')
    if not os.path.exists(f): return {}
    s = open(f, encoding='utf-8', errors='ignore').read()
    out = {}
    m = re.search(r'"@type": "BreadcrumbList".*?\]', s, re.S)
    crumbs = [html.unescape(x) for x in re.findall(r'"name": "([^"]+)"', m.group(0))] if m else []
    out['crumbs'] = crumbs[1:]
    blocks = {}
    for m in re.finditer(r'<div class="accordion-header">\s*<span>([^<]+)</span>.*?</div>\s*(?:<div class="accordion-content">(.*?)</div>\s*(?:<div class="more">|</div>))?', s, re.S):
        if m.group(2): blocks[m.group(1).strip()] = text(m.group(2))
    out['desc'] = blocks.get('ОПИС ПРОДУКТУ', [])
    out['blocks'] = {k: v for k, v in blocks.items() if k != 'ОПИС ПРОДУКТУ'}
    return out

def white_square(im, size, fill=0.82):
    """Trim the white margin, then centre the product on a white square so every card has the same visual weight."""
    im = im.convert('RGB')
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v > 12 else 0)
    box = diff.getbbox() or (0, 0, *im.size)
    im = im.crop(box)
    w, h = im.size
    k = size * fill / max(w, h)
    im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    out = Image.new('RGB', (size, size), (255, 255, 255))
    out.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    return out

def make_images(code):
    srcs = sorted(glob.glob(R('originals', f'{code}-*.jpg')))
    res = {'n': 0, 'cut': False}
    for i, src in enumerate(srcs[:5]):
        suffix = '' if i == 0 else f'-{i}'
        big, small = f'{IMG}/{code}{suffix}.webp', f'{IMG}/{code}{suffix}s.webp'
        try:
            if not os.path.exists(big) or (i == 0 and not os.path.exists(small)):
                im = Image.open(src)
                white_square(im, 900).save(big, 'WEBP', quality=84, method=6)
                if i == 0: white_square(im, 420).save(small, 'WEBP', quality=80, method=6)
            res['n'] = i + 1
        except Exception as e:
            print('img fail', code, src, e)
    cut = f'{IMG}/{code}c.webp'
    if srcs:
        if not os.path.exists(cut) and not os.path.exists(cut + '.skip'):
            im = Image.open(srcs[0]); im.thumbnail((900, 900))
            r, ok = cutout(im)
            if r is not None and ok:
                r.thumbnail((700, 700)); r.save(cut, 'WEBP', quality=84, method=6, alpha_quality=90)
            else:
                open(cut + '.skip', 'w').close()
        res['cut'] = os.path.exists(cut)
    if res['n']:
        w, h = Image.open(srcs[0]).size
    return res

def main():
    codes = json.load(open(R('research/codes.json')))
    products, seen_slugs = [], set()
    for code, pages in codes.items():
        try: d = json.load(open(R('research/search', f'{code}.json')))
        except FileNotFoundError: continue
        hit = next((p for p in d.get('products') or [] if p['sku'] == code), None)
        if not hit: continue
        price = int(num(hit['price'])); old = int(num(hit['price_black']))
        if not price: continue
        name, vol = split_name(hit['name'])
        pg = parse_page(code)
        crumbs = pg.get('crumbs') or []
        sec = next((SEC_BY_CRUMB[c] for c in crumbs if c in SEC_BY_CRUMB), None)
        if not sec:
            low = name.lower()
            sec = next((s for s, rx in KEYWORDS if re.search(rx, low)), 'tilo')
        sub = None
        if len(crumbs) >= 2 and crumbs[1] not in SEC_BY_CRUMB: sub = crumbs[-1] if len(crumbs) >= 3 else crumbs[1]
        slug = re.sub(r'.*/', '', html.unescape(hit['href']))
        if 'route=' in slug or not slug: slug = slugify(f'{name} {vol or ""}')
        slug = slug[:80].strip('-')
        if slug in seen_slugs: slug = f'{slug}-{code}'
        seen_slugs.add(slug)
        products.append({
            'id': code, 'slug': slug, 'name': name, 'vol': vol, 'series': series(name),
            'price': price, 'old': old if old > price else None, 'bb': hit.get('price_bb') or None,
            'section': sec, 'sub': sub, 'page': pages[0],
            'desc': pg.get('desc') or [], 'more': pg.get('blocks') or {},
            'src': html.unescape(hit['href']),
        })

    with cf.ProcessPoolExecutor(8) as ex:
        imgs = dict(zip([p['id'] for p in products], ex.map(make_images, [p['id'] for p in products])))
    for p in products:
        p['imgs'] = imgs[p['id']]['n']; p['cut'] = imgs[p['id']]['cut']

    # Sub-categories in each section, by size.
    secs = []
    for sid, sname, lead, _ in SECTIONS:
        ps = [p for p in products if p['section'] == sid]
        if not ps: continue
        subs = {}
        for p in ps:
            if p['sub']: subs[p['sub']] = subs.get(p['sub'], 0) + 1
        sublist = [{'id': slugify(k, 40), 'name': k, 'count': v} for k, v in sorted(subs.items(), key=lambda kv: -kv[1])]
        for p in ps:
            if p['sub']: p['sub'] = slugify(p['sub'], 40)
        secs.append({'id': sid, 'name': sname, 'lead': lead, 'count': len(ps), 'subs': sublist})
    # Series with 3+ products become filterable "brands".
    resolve_series(products)
    cnt = {}
    for p in products:
        if p['series']: cnt[p['series']] = cnt.get(p['series'], 0) + 1
    series_list = [{'id': slugify(k, 40), 'name': k, 'count': v} for k, v in sorted(cnt.items(), key=lambda kv: -kv[1]) if v >= 3]
    ok = {s['name']: s['id'] for s in series_list}
    for p in products: p['series'] = ok.get(p['series'])

    json.dump({'products': products, 'sections': secs, 'series': series_list}, open(R('src/data/catalog.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print(len(products), 'products;', {s['id']: s['count'] for s in secs})
    print('no image:', sum(1 for p in products if not p['imgs']), '; cut-outs:', sum(1 for p in products if p['cut']))
    print('series:', [(s['name'], s['count']) for s in series_list[:40]])

if __name__ == '__main__':
    main()
