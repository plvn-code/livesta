"""For every code found on livesta.ua: cache the product page (research/html/<sku>.html) and original photos (originals/<sku>-<n>.jpg)."""
import json, sys, time, re, urllib.request, concurrent.futures as cf, pathlib
root = pathlib.Path(sys.argv[1])
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36"
html_dir = root / "research/html"; html_dir.mkdir(exist_ok=True)
orig = root / "originals"; orig.mkdir(exist_ok=True)

def fetch(url, timeout=40):
    for a in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout).read()
        except Exception as e:
            err = e; time.sleep(2 + 3 * a)
    raise err

items = []
for f in sorted((root / "research/search").glob("*.json")):
    d = json.loads(f.read_text())
    for p in d.get("products") or []:
        if p.get("sku") == f.stem: items.append(p); break

def one(p):
    sku = p["sku"]; h = html_dir / f"{sku}.html"
    try:
        if not h.exists():
            h.write_bytes(fetch(p["href"])); time.sleep(0.1)
        s = h.read_text(errors="ignore")
        srcs = re.findall(r'class="swiper-slide photo[^"]*"[^>]*data-src="([^"]+)"', s)
        if not srcs and p.get("image"): srcs = [p["image"]]
        for i, u in enumerate(srcs[:5]):
            o = orig / f"{sku}-{i}.jpg"
            if o.exists(): continue
            u2 = re.sub(r"/image/cache/(.+)-\d+x\d+(\.\w+)$", r"/image/\1\2", u)
            try: o.write_bytes(fetch(u2))
            except Exception:
                try: o.write_bytes(fetch(u))
                except Exception as e: print("img fail", sku, u, e, flush=True)
    except Exception as e:
        print("fail", sku, e, flush=True)

with cf.ThreadPoolExecutor(4) as ex: list(ex.map(one, items))
print("done", len(items), "products,", len(list(orig.glob("*.jpg"))), "photos")
