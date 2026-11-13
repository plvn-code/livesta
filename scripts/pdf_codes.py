import json,re,sys,collections
pages=json.load(open(sys.argv[1]))
tr={0x349+i:str(i) for i in range(10)}
codes=collections.OrderedDict()
for p in pages:
    t=p["text"].translate(tr)
    for m in re.finditer(r'(?<![\d,.])(\d{6})(?![\d,])',t):
        c=m.group(1)
        if c.startswith(('20','19')) and False: pass
        codes.setdefault(c,[]).append(p["page"])
json.dump(codes,open(sys.argv[2],"w"))
print(len(codes))
print(list(codes.items())[:40])
