import json,math,re,sys
# Usage: python3 scripts/gen-osm.py overpass.json  (writes data/osm.ts). See CLAUDE.md for the Overpass query.

def area(p): return abs(sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p))))/2
def rdp(pts,eps):
    if len(pts)<3: return pts
    a,b=pts[0],pts[-1];dx,dy=b[0]-a[0],b[1]-a[1];L=math.hypot(dx,dy) or 1e-9
    m,i=0,0
    for k in range(1,len(pts)-1):
        d=abs(dy*pts[k][0]-dx*pts[k][1]+b[0]*a[1]-b[1]*a[0])/L
        if d>m:m,i=d,k
    if m>eps: return rdp(pts[:i+1],eps)[:-1]+rdp(pts[i:],eps)
    return [a,b]
X0,Y0,KX,KY=321.0,339.7,4.033,4.188   # metric, north-up: 1 cell = 2.64 m
def grid(lat,lng): return (X0+KX*(lng-99.7035)*1e4, Y0-KY*(lat-17.0185)*1e4)
B=(-130,-140,800,800)
inb=lambda p:B[0]<=p[0]<=B[2] and B[1]<=p[1]<=B[3]
d=json.load(open(sys.argv[1]))['elements']
G=lambda e:[grid(p['lat'],p['lon']) for p in e['geometry']]
cen=lambda g:(sum(p[0] for p in g)/len(g),sum(p[1] for p in g)/len(g))
R=lambda p:[round(p[0],1),round(p[1],1)]
def simp(g,eps=.9,closed=False):
    g=g[:-1] if closed and g[0]==g[-1] else g
    if closed:
        s=rdp(g+[g[0]],eps)[:-1]
        return s if len(s)>=3 else g
    return rdp(g,eps)
ponds=[];byid={e['id']:e for e in d}
def isl(g):
    c=cen(g);a=area(g);return {'c':R(c),'r':round(max(4,math.sqrt(a/math.pi)*1.1),1)}
for e in d:
    t=e.get('tags',{})
    if t.get('natural')!='water': continue
    if e['type']=='relation':
        outer=[G(m) for m in e['members'] if m['role']=='outer' and m.get('geometry')];inner=[G(m) for m in e['members'] if m['role']=='inner' and m.get('geometry')]
        if not outer: continue
        ponds.append({'id':'r'+str(e['id']),'name':t.get('name:en',''),'poly':[R(p) for p in simp(outer[0],1.2,True)],'islands':[isl(i) for i in inner]})
    else:
        g=G(e)
        if len(g)<4 or g[0]!=g[-1] or not inb(cen(g)): continue
        if 'waterway' in t: continue
        a=area(g)
        if a<150: continue
        ponds.append({'id':'w'+str(e['id']),'name':t.get('name:en',''),'poly':[R(p) for p in simp(g,1.0,True)],'islands':[]})
# drop ways that are rings of a relation (same area/cen)
rel=[(cen(p['poly']),area(p['poly'])) for p in ponds if p['id'][0]=='r']
ponds=[p for p in ponds if p['id'][0]=='r' or not any(math.hypot(cen(p['poly'])[0]-c[0],cen(p['poly'])[1]-c[1])<6 and abs(area(p['poly'])-a)/a<.25 for c,a in rel)]
# ways that are inner rings of relations are islands, not ponds: drop ponds lying inside a relation island
roads=[];gw=[];bridges=[];walls=[];ruins=[];builds=[]
W={'trunk':12,'primary':11,'tertiary':10,'secondary':10,'residential':7,'unclassified':7,'service':5,'track':4,'pedestrian':4,'footway':2.6,'path':2.6}
for e in d:
    t=e.get('tags',{})
    if e['type']!='way': continue
    h=t.get('highway')
    if h in W:
        g=G(e)
        if t.get('bridge'):
            if inb(g[0]) or inb(g[-1]): bridges.append({'a':R(g[0]),'b':R(g[-1]),'w':W[h]+1})
            continue
        ref=t.get('ref','') or ('12' if 'จรดวิถีถ่อง' in t.get('name','') else '')
        seg=[];
        for p in g:
            if inb(p): seg.append(p)
            else:
                if len(seg)>1: roads.append((h,seg,ref))
                seg=[]
        if len(seg)>1: roads.append((h,seg,ref))
    elif t.get('barrier') in('city_wall','wall','retaining_wall'):
        g=G(e)
        if inb(cen(g)): walls.append({'k':t['barrier'],'pts':[R(p) for p in simp(g,.8,g[0]==g[-1])],'closed':g[0]==g[-1]})
    elif t.get('building') or t.get('historic') in('ruins','monument'):
        g=G(e)
        if len(g)<4 or not inb(cen(g)) or a_small(g) if False else False: continue
        if len(g)<4: continue
        a=area(g)
        if not inb(cen(g)) or a<2: continue
        ob={'pts':[R(p) for p in simp(g,.4,True)],'a':round(a)}
        if t.get('historic')=='ruins' or t.get('building') in('ruins','temple'): ruins.append(ob)
        elif t.get('historic')=='monument': pass
        else: builds.append(ob)
rd=[{'id':f'o{i}','kind':'road' if h in('primary','tertiary','secondary','residential','unclassified','service') else 'path','width':W[h],'ref':ref,'pts':[R(p) for p in simp(s,.9)]} for i,(h,s,ref) in enumerate(roads)]
rd=[r for r in rd if len(r['pts'])>=2]
out="// GENERATED from OpenStreetMap (c) OpenStreetMap contributors, ODbL, fetched 2026-11-09 via Overpass.\n// Grid coords via lib/georef.ts. Do not edit by hand; regenerate from the Overpass query documented in CLAUDE.md.\nimport type { Pt } from '@/lib/geo';\n"
out+="export const osmPonds: { id: string; name: string; poly: Pt[]; islands: { c: Pt; r: number }[] }[] = "+json.dumps(ponds,ensure_ascii=False,separators=(',',':'))+";\n"
out+="export const osmRoads: { id: string; kind: 'road' | 'path'; width: number; ref: string; pts: Pt[] }[] = "+json.dumps(rd,separators=(',',':'))+";\n"
out+="export const osmBridges: { a: Pt; b: Pt; w: number }[] = "+json.dumps(bridges,separators=(',',':'))+";\n"
out+="export const osmWalls: { k: string; pts: Pt[]; closed: boolean }[] = "+json.dumps(walls,separators=(',',':'))+";\n"
out+="export const osmRuins: { pts: Pt[]; a: number }[] = "+json.dumps(ruins,separators=(',',':'))+";\n"
out+="export const osmBuildings: { pts: Pt[]; a: number }[] = "+json.dumps(builds,separators=(',',':'))+";\n"
open('data/osm.ts','w').write(out)
print(len(ponds),len(rd),len(bridges),len(walls),len(ruins),len(builds),len(out))
for p in ponds: print(p['id'],p['name'],round(area(p['poly'])),len(p['islands']))

