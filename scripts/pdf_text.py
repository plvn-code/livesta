import fitz,sys,json
d=fitz.open(sys.argv[1])
out=[]
for i,p in enumerate(d):
    out.append({"page":i+1,"size":[round(p.rect.width),round(p.rect.height)],"imgs":len(p.get_images()),"text":p.get_text()})
json.dump(out,open(sys.argv[2],"w"),ensure_ascii=False,indent=1)
for o in out[:12]: print("=== p",o["page"],o["size"],"imgs",o["imgs"]); print(o["text"][:900])
