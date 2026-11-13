"""Extract large embedded images from the catalogue PDF -> research/pdfimg/p<page>_<xref>.jpg (for editorial blocks)."""
import fitz, sys, pathlib
pdf, out = sys.argv[1], pathlib.Path(sys.argv[2]); out.mkdir(exist_ok=True)
d = fitz.open(pdf); seen = set(); n = 0
for pno, page in enumerate(d):
    for info in page.get_images(full=True):
        xref, smask, w, h = info[0], info[1], info[2], info[3]
        if xref in seen or w * h < 900_000: continue
        seen.add(xref)
        pix = fitz.Pixmap(d, xref)
        if pix.n - pix.alpha >= 4: pix = fitz.Pixmap(fitz.csRGB, pix)
        if pix.alpha: pix = fitz.Pixmap(pix, 0)
        pix.save(str(out / f"p{pno+1:03}_{xref}_{w}x{h}.jpg"), jpg_quality=90); n += 1
print(n)
