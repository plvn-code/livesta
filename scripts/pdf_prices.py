"""Read code -> (price, old price, points) from the catalogue PDF by geometry. Writes research/pdf_prices.json"""
import fitz, re, json, sys, math
TR = {0x349 + i: str(i) for i in range(10)}
d = fitz.open(sys.argv[1]); out = {}
NUM = re.compile(r"^\d[\dΒ ]*$")
for pno, page in enumerate(d):
    W = page.rect.width
    words = [(x0, y0, x1, y1, t.translate(TR).replace("Β", "").replace("Β", "")) for x0, y0, x1, y1, t, *_ in page.get_text("words")]
    codes = [(w, w[4]) for w in words if re.fullmatch(r"\d{6}", w[4])]
    # prices: number immediately followed (same line) by ₴, or number glued to ₴
    prices = []
    for i, w in enumerate(words):
        t = w[4]
        m = re.fullmatch(r"(\d{2,5})₴", t)
        if m: prices.append((w, int(m.group(1)))); continue
        if t == "₴":
            # nearest number to the left on the same line
            cands = [v for v in words if abs((v[1] + v[3]) / 2 - (w[1] + w[3]) / 2) < 6 and v[2] <= w[0] + 2 and w[0] - v[2] < 25 and re.fullmatch(r"\d{2,5}", v[4])]
            if cands:
                v = max(cands, key=lambda v: v[2]); prices.append((v, int(v[4])))
    for cw, code in codes:
        cx, cy = (cw[0] + cw[2]) / 2, (cw[1] + cw[3]) / 2
        half = 0 if cx < W / 2 else 1
        best = None
        for pw, val in prices:
            px, py = (pw[0] + pw[2]) / 2, (pw[1] + pw[3]) / 2
            if (0 if px < W / 2 else 1) != half: continue
            dy = py - cy
            if dy < -40: continue  # price is normally below (or beside) the code
            dist = math.hypot((px - cx) * 1.0, dy * 1.4 if dy > 0 else -dy * 4)
            if best is None or dist < best[0]: best = (dist, val)
        # old (crossed) price: a bare 2-5 digit number just below the code
        old = None
        for v in words:
            if re.fullmatch(r"\d{3,5}", v[4]) and 0 < v[1] - cw[3] < 16 and abs(v[0] - cw[0]) < 12: old = int(v[4]); break
        rec = {"page": pno + 1, "price": best[1] if best else None, "dist": round(best[0]) if best else None, "old": old}
        out.setdefault(code, rec)
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
print(len(out), sum(1 for v in out.values() if v["price"]))
