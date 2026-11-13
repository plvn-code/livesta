"""Look up every catalogue code on livesta.ua (search JSON) -> research/search/<code>.json"""
import json, sys, time, urllib.request, urllib.parse, concurrent.futures as cf, pathlib
root = pathlib.Path(sys.argv[1])
codes = json.load(open(root / "research/codes.json"))
out = root / "research/search"; out.mkdir(exist_ok=True)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36"
def get(code):
    f = out / f"{code}.json"
    if f.exists(): return
    data = urllib.parse.urlencode({"search_text": code, "search_location": "global", "search_patch": ""}).encode()
    for attempt in range(3):
        try:
            req = urllib.request.Request("https://livesta.ua/index.php?route=common/search/results", data=data, headers={"User-Agent": UA, "X-Requested-With": "XMLHttpRequest"})
            raw = urllib.request.urlopen(req, timeout=30).read().decode()
            raw = raw[raw.index("{"):]
            f.write_text(raw); time.sleep(0.15); return
        except Exception as e:
            time.sleep(2 + attempt * 3)
    print("fail", code, flush=True)
with cf.ThreadPoolExecutor(4) as ex: list(ex.map(get, codes))
print("done", len(list(out.glob("*.json"))))
