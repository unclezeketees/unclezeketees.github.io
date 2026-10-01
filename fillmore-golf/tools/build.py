exec(open('frame.py').read())
import numpy as np, json, zlib, base64
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
cr=json.load(open('crop.json')); X0p,Y0p,X1p,Y1p=cr['X0p'],cr['Y0p'],cr['X1p'],cr['Y1p']
Gd=np.load('grids.npz'); dtm=Gd['dtm']; chm=Gd['chm']; void=Gd['void']; vcnt=Gd['vcnt']
HH,HW=dtm.shape
A=np.asarray(Image.open('nys2.jpg').convert('RGB')).astype(float)[Y0p:Y1p,X0p:X1p]
CH,CW=A.shape[:2]; CC=MPP
R_,G_,B_=A[...,0],A[...,1],A[...,2]; L=(R_+G_+B_)/3; SAT=A.max(-1)-A.min(-1)
def dropsmall(mk,minm2):
    lab,n=ndi.label(mk); sz=ndi.sum(mk,lab,range(1,n+1))*CC*CC; keep=np.zeros(n+1,bool); keep[1:]=sz>=minm2; return keep[lab]
def w(p): return [(p[0]-X0p)*MPP,(p[1]-Y0p)*MPP]
# resample 1 m grids to cover grid
cy,cx=np.mgrid[0:CH,0:CW]; wx=(cx+0.5)*CC; wy=(cy+0.5)*CC
def samp(g,order=1): return ndi.map_coordinates(g.astype(float),[wy-0.5,wx-0.5],order=order,mode='nearest')
chmC=samp(chm); voidC=samp(ndi.gaussian_filter(void.astype(float),1.0))>0.5
# ---- boundary / OB
osm=json.load(open('osm.json')); bd=[e for e in osm['elements'] if e['id']==213743599][0]['geometry']
bw=[w(px((g['lat'],g['lon']))) for g in bd]
m=Image.new('L',(CW,CH),0); ImageDraw.Draw(m).polygon([(p[0]/CC,p[1]/CC) for p in bw],fill=1); inside=np.array(m)>0
# ---- classes
ROUGH,FAIR,GREEN,FRINGE,TEE,SAND,WATER,WOODS,ROAD,PATH,BLDG,LONG,CREEK,GRAVEL=range(14)
cov=np.where(inside,ROUGH,LONG).astype(np.uint8)
canopy=ndi.gaussian_filter((chmC>3).astype(float),2.6/CC)
woods=canopy>0.55
cov[woods]=WOODS
# holes in world coords
par=[4,5,4,4,3,4,3,4,4,5,3,4,3,5,5,4,4,3]; hcp=[16,2,8,6,14,4,18,12,10,1,15,3,13,7,11,5,9,17]
H_=[]
for i,h in enumerate(holes):
    H_.append({k:w(h[k]) for k in ('tee','tt','gc','gf','gb')})
# tee pads traced from the lidar (pads.py); holes without a visible pad keep the GPS tee
PADS=json.load(open('tee_pads.json'))
def cells_mask(cells):
    q=np.array(cells); m=np.zeros((CH,CW),bool)
    for ox in (-0.25,0.25):
        for oy in (-0.25,0.25):
            ii=np.clip(((q[:,0]+ox)/CC).astype(int),0,CW-1); jj=np.clip(((q[:,1]+oy)/CC).astype(int),0,CH-1); m[jj,ii]=True
    return ndi.binary_closing(m,iterations=1)
for k,v in PADS['tees'].items(): H_[int(k)-1]['tee']=list(v['start'])
# fairways
def seg_dist(P,a,b):
    ax,ay=a; bx,by=b; dx,dy=bx-ax,by-ay; L2=dx*dx+dy*dy
    t=np.clip(((P[0]-ax)*dx+(P[1]-ay)*dy)/L2,0,1); return np.hypot(P[0]-ax-t*dx,P[1]-ay-t*dy), t
fair=np.zeros((CH,CW),bool); teem=np.zeros((CH,CW),bool)
rng=np.random.default_rng(7)
for i,h in enumerate(H_):
    tee,tt,gc,gf=h['tee'],h['tt'],h['gc'],h['gf']
    path=[tee,tt,gc] if math.dist(tee,tt)>20 and math.dist(tt,gc)>20 else [tee,gc]
    Ltot=sum(math.dist(path[k],path[k+1]) for k in range(len(path)-1))
    x0,x1=min(p[0] for p in path)-40,max(p[0] for p in path)+40; y0,y1=min(p[1] for p in path)-40,max(p[1] for p in path)+40
    i0,i1,j0,j1=int(x0/CC),int(x1/CC),int(y0/CC),int(y1/CC)
    i0,j0=max(i0,0),max(j0,0); i1,j1=min(i1,CW),min(j1,CH)
    P=(wx[j0:j1,i0:i1],wy[j0:j1,i0:i1])
    dmin=np.full(P[0].shape,1e9); s=np.zeros(P[0].shape); acc=0
    for k in range(len(path)-1):
        d,t=seg_dist(P,path[k],path[k+1]); Lk=math.dist(path[k],path[k+1])
        better=d<dmin; dmin=np.where(better,d,dmin); s=np.where(better,acc+t*Lk,s); acc+=Lk
    gfd=Ltot-math.dist(gf,gc)
    wob=ndi.gaussian_filter(rng.standard_normal(P[0].shape),int(12/CC))*int(12/CC)*1.2
    if par[i]>=4:
        s0=min(0.36*Ltot,125); width=(np.where(s<gfd-40,32,32-(s-(gfd-40))/40*6)+wob*6)*np.sqrt(np.clip((s-s0)/18,0,1))
        f=(dmin<width/2)&(s>s0)&(s<gfd+2)
    else:
        f=(dmin<9+wob*1.5)&(s>gfd-16)&(s<gfd+2)
    fair[j0:j1,i0:i1]|=f
    if str(i+1) in PADS['tees']:
        teem|=cells_mask(PADS['tees'][str(i+1)]['cells'])
    else:
        # no pad visible in the lidar: 7 m x 16 m box at the GPS tee pointing at the first target
        d0=np.array(path[1])-np.array(tee); d0/=np.linalg.norm(d0)
        rx,ry=P[0]-tee[0],P[1]-tee[1]; along=rx*d0[0]+ry*d0[1]; across=-rx*d0[1]+ry*d0[0]
        teem[j0:j1,i0:i1]|=(along>-2)&(along<14)&(np.abs(across)<3.5)
    h['path']=path; h['yds']=round(Ltot*1.09361)
fair&=~woods
# extend in-bounds only around tee boxes that the OSM outline clips (holes 4 and 6)
play=ndi.binary_dilation(teem,iterations=int(10/CC))
roadish=(SAT<16)&(L>55)&(L<140)&(chmC<1)&(G_-R_<4)&~inside
roadish=ndi.binary_dilation(dropsmall(ndi.binary_opening(roadish,iterations=1),12),iterations=int(2/CC))
inside|=play&~roadish
cov[play&(cov==LONG)&inside]=ROUGH
fair_all=fair.copy()
fair&=inside
cov[fair]=FAIR
# paths, roads, gravel from imagery (non-vegetated, no canopy)
# roads and the clubhouse lot come from OSM and hand tracing further down
# buildings from lidar: tall, smooth canopy surface
rough=ndi.generic_filter(chm,np.std,size=3) if False else np.sqrt(np.maximum(ndi.uniform_filter(chm**2,3)-ndi.uniform_filter(chm,3)**2,0))
b1=(chm>2.5)&(rough<0.45); b1=ndi.binary_opening(b1,iterations=1)
lab,n=ndi.label(b1); sz=ndi.sum(b1,lab,range(1,n+1)); keep=np.zeros(n+1,bool); keep[1:]=sz>=30; bld=keep[lab]
bld=ndi.binary_closing(bld,iterations=1)
bldC=ndi.map_coordinates(bld.astype(float),[wy-0.5,wx-0.5],order=0,mode='nearest')>0.5
cov[bldC]=BLDG
# sand near greens / fairways: tan and bright
tanm=(R_>G_)&(G_>B_+8)&(L>145)&(SAT>22)&(chmC<1)
tanm=ndi.binary_opening(tanm,iterations=1); tanm=dropsmall(tanm,8)
near=np.zeros((CH,CW),bool)
for h in H_:
    near|=np.hypot(wx-h['gc'][0],wy-h['gc'][1])<45
sand=np.zeros((CH,CW),bool)
bm=Image.new('L',(CW,CH),0); bd_=ImageDraw.Draw(bm)
for n,pts,wd in ((1,[(36,-9),(33,10),(27,28),(22,37)],8),(9,[(-2,-37),(6,-40),(13,-42)],5)):
    g=holes[n-1]['gc']; bd_.line([(g[0]+a-X0p,g[1]+b-Y0p) for a,b in pts],fill=1,width=wd,joint='curve')
    for a,b in (pts[0],pts[-1]):
        x,y=g[0]+a-X0p,g[1]+b-Y0p; bd_.ellipse([x-wd/2,y-wd/2,x+wd/2,y+wd/2],fill=1)
sand=np.array(bm)>0
# bunkers and waste pits found as bowls in the lidar (checked against the aerial):
# rocky pit in the #6 fairway, rocky bowl beside #8 green, pit short of #8, grass hollow near #10 green
bowlf=ndi.gaussian_filter(dtm,4)-ndi.gaussian_filter(dtm,0.7)
blab,_=ndi.label(bowlf>0.12)
bowl1m=np.zeros(dtm.shape,bool)
for bx,by in ((295.5,178.0),(277.0,188.2),(187.7,297.0),(656.8,710.7),(264.5,313.1)):
    l_=blab[int(by),int(bx)]
    if l_==0: continue
    r_=np.zeros(dtm.shape,bool); r_[blab==l_]=True
    yy_,xx_=np.mgrid[0:dtm.shape[0],0:dtm.shape[1]]
    bowl1m|=r_&(np.hypot(xx_+0.5-bx,yy_+0.5-by)<14)
bowlC=ndi.map_coordinates(ndi.gaussian_filter(ndi.binary_closing(bowl1m).astype(float),1.2),[wy-0.5,wx-0.5],order=1)>0.5
sand|=bowlC
print('lidar bunkers m2',bowlC.sum()*CC*CC)
cov[sand]=SAND
# water: lidar voids + dark imagery nearby
wv=ndi.binary_closing(voidC,iterations=3); wv=ndi.binary_fill_holes(wv); wv=dropsmall(wv,40)
dark=(L<80)&(chmC<2)
water=wv|(dark&ndi.binary_dilation(wv,iterations=int(3/CC)))
water=ndi.binary_opening(water,iterations=2); water=dropsmall(water,40)
cov[water]=WATER
# creek (traced from aerial, snapped to lidar channel)
creek_px=[(650,1590),(700,1620),(740,1660),(760,1690),(800,1705),(850,1720),(900,1735),(960,1760),(1000,1775),(1050,1790),(1100,1805),(1150,1815),(1200,1830),(1250,1850),(1300,1870),(1350,1890),(1400,1908),(1440,1928),(1465,1955),(1490,2000),(1520,2035),(1560,2045),(1600,2060),(1650,2075),(1700,2092),(1740,2105)]
cw=[w(p) for p in creek_px]
snapped=[]
for p in cw:
    best=None
    for dx in np.arange(-5,5.1,0.5):
        for dy in np.arange(-5,5.1,0.5):
            q=(p[0]+dx,p[1]+dy); z=ndi.map_coordinates(dtm,[[q[1]-0.5],[q[0]-0.5]],order=1)[0]
            if best is None or z<best[0]: best=(z,q)
    snapped.append(best[1])
# densify + smooth
dense=[]
for a,b in zip(snapped[:-1],snapped[1:]):
    n=max(2,int(math.dist(a,b)/1.0))
    for t in range(n): dense.append((a[0]+(b[0]-a[0])*t/n,a[1]+(b[1]-a[1])*t/n))
dense=np.array(dense); dense=ndi.gaussian_filter1d(dense,4,axis=0)
cm=Image.new('L',(CW,CH),0); ImageDraw.Draw(cm).line([(p[0]/CC,p[1]/CC) for p in dense],fill=1,width=max(1,int(2.4/CC)))
creek=(np.array(cm)>0)&~water
cov[creek]=CREEK
# greens and fringes
gm=np.load('green_masks.npy',allow_pickle=True)
greens=np.zeros((CH,CW),bool)
# green 16: the aerial trace came out half size, use the lidar plateau instead
g16=ndi.binary_opening(cells_mask(PADS['green16']['cells']),iterations=2)
g16=ndi.gaussian_filter(g16.astype(float),1.2/CC)>0.5
gm=list(gm); j16,i16=np.nonzero(g16); ox16,oy16=i16.min()+X0p,j16.min()+Y0p
gm[15]=(ox16,oy16,g16[j16.min():j16.max()+1,i16.min():i16.max()+1])
for (ox,oy,mk) in gm:
    ys,xs=np.nonzero(mk); ys=ys+oy-Y0p; xs=xs+ox-X0p; ok=(ys>=0)&(ys<CH)&(xs>=0)&(xs<CW); greens[ys[ok],xs[ok]]=True
fringe=ndi.binary_dilation(greens,iterations=int(1.6/CC))&~greens
cov[fringe&~water]=FRINGE; cov[greens]=GREEN
cov[teem&~water&~greens]=TEE
# ---- in-bounds: property outline closed over the clubhouse strip, woods edges in play,
#      Toll Gate Hill Rd and everything across it out, house lots out
rd=json.load(open('roads.json'))
def wl(q): return w(px((q['lat'],q['lon'])))
def raster_line(pts,width_m):
    m=Image.new('L',(CW,CH),0); ImageDraw.Draw(m).line([(p[0]/CC,p[1]/CC) for p in pts],fill=1,width=max(1,int(round(width_m/CC))),joint='curve'); return np.array(m)>0
def raster_poly(pts):
    m=Image.new('L',(CW,CH),0); ImageDraw.Draw(m).polygon([(p[0]/CC,p[1]/CC) for p in pts],fill=1); return np.array(m)>0
tgroad=[]
road=np.zeros((CH,CW),bool); barrier=np.zeros((CH,CW),bool); resid=np.zeros((CH,CW),bool); houses=np.zeros((CH,CW),bool)
for e in rd['elements']:
    t=e.get('tags',{}); pts=[wl(q) for q in e['geometry']]
    hw=t.get('highway')
    if hw in ('tertiary','unclassified','residential','service'):
        road|=raster_line(pts,7 if hw=='tertiary' else 6)
        if t.get('name')=='Toll Gate Hill Road': barrier|=raster_line(pts,12); tgroad=pts
        if hw=='residential': resid|=raster_line(pts,80)
    elif 'building' in t and len(pts)>2:
        houses|=raster_poly(pts)
dt=lambda m: ndi.distance_transform_edt(~m)*CC
osm_in=raster_poly(bw)
core=dt(osm_in)<=30; core=ndi.distance_transform_edt(core)*CC>30; core|=osm_in
core=ndi.binary_fill_holes(core)
# clubhouse gravel lot, drive and paths (traced from the aerial, image pixels)
lot_px=[(1107,662),(1130,685),(1140,710),(1120,740),(1100,755),(1070,770),(1030,790),(1005,795),(1002,730),(1025,695),(1070,670)]
lot=raster_poly([w(p) for p in lot_px])
# drive: a smooth curve from the road into the lot (Catmull-Rom through the traced points)
def smooth_path(P,n=12):
    P=[P[0]]+P+[P[-1]]; out=[]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        for k in range(n):
            t=k/n; t2=t*t; t3=t2*t
            out.append(tuple(0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3) for j in (0,1)))
    out.append(P[-2]); return out
drive=raster_line(smooth_path([w(p) for p in [(1240,636),(1205,650),(1168,668),(1138,684),(1115,700)]]),5.5)
lot=ndi.gaussian_filter(lot.astype(float),2.2/CC)>0.5
paved=ndi.gaussian_filter((lot|drive).astype(float),1.0/CC)>0.45
cartpath=np.zeros((CH,CW),bool)
core|=lot|drive
# ---- in bounds: one smoothed outer line, no islands
lab,n=ndi.label(~barrier); side=lab[int(H_[0]['gc'][1]/CC),int(H_[0]['gc'][0]/CC)]
course_side=lab==side
nearhouse=(dt(houses)<=12)&~lot&~osm_in
nearhouse&=~(dt(lot|drive)<=60)   # clubhouse and maintenance buildings are on the course
excl=~course_side|road|(resid&~osm_in)|nearhouse
reach=core|(dt(core)<=45)|((dt(core)<=70)&(dt(barrier)<=75))|ndi.binary_dilation(teem,iterations=int(10/CC))
reach&=~excl
sm=ndi.gaussian_filter(reach.astype(float),9/CC)>0.5
sm|=core|ndi.binary_dilation(teem,iterations=int(10/CC))
sm&=~excl
sm=ndi.binary_opening(sm,iterations=int(3/CC))
lab2,n2=ndi.label(sm); sizes=ndi.sum(sm,lab2,range(1,n2+1)); sm=lab2==(int(np.argmax(sizes))+1)
inb=ndi.binary_fill_holes(sm)&~road
cov[inb&(cov==LONG)]=ROUGH
# fairways run to the in-bounds line, not the rough OSM outline
cov[fair_all&inb&np.isin(cov,[ROUGH,LONG])]=FAIR
cov[paved&~bldC]=GRAVEL
drive_s=ndi.gaussian_filter(drive.astype(float),1.0/CC)>0.45
cov[drive_s&~bldC]=ROAD   # the drive is blacktop
cov[cartpath&~bldC&~water&np.isin(cov,[ROUGH,FAIR,LONG])]=PATH
cov[road]=ROAD
# practice putting green beside the clubhouse (traced from the aerial)
pg=Image.new('L',(CW,CH),0); c_=w((1172,707)); ImageDraw.Draw(pg).ellipse([(c_[0]-10.5)/CC,(c_[1]-8.5)/CC,(c_[0]+10.5)/CC,(c_[1]+8.5)/CC],fill=1)
pgm=np.array(pg)>0
cov[ndi.binary_dilation(pgm,iterations=int(1.2/CC))&~pgm&np.isin(cov,[ROUGH,FAIR])]=FRINGE
cov[pgm]=GREEN
greens|=pgm
# driving range tee: the leveled pad beside the practice green (lidar), firing south along the road
RP=PADS['range']; RANGE_TEE=tuple(RP['c']); RANGE_DIR=(0.438,0.899)
RANGE_LINE=tuple(RP['axis']); RANGE_HALF=round(RP['len']/2-2.5,1)
rtee=cells_mask(RP['cells'])
cov[ndi.binary_fill_holes(rtee)&inb&~bldC&~np.isin(cov,[ROAD,BLDG,WATER,GREEN])]=TEE
inside=inb
covf=cov|np.where(inside,0,0x80).astype(np.uint8)
np.save('cover.npy',covf)
# ---- trees from canopy height model
cs=ndi.gaussian_filter(chm,1.0)
mx=ndi.maximum_filter(cs,size=5)
peaks=(cs==mx)&(cs>4)&~bld
# suppress close peaks for tall trees
pj,pi=np.nonzero(peaks); ph=cs[pj,pi]; order=np.argsort(-ph)
taken=np.zeros(len(pj),bool); keep=[]
from scipy.spatial import cKDTree
kd=cKDTree(np.c_[pi,pj])
for o in order:
    if taken[o]: continue
    keep.append(o); rr=max(2.0,0.12*ph[o])
    for q in kd.query_ball_point([pi[o],pj[o]],rr): taken[q]=True
keep=np.array(keep)
mk=np.zeros(chm.shape,np.int32); mk[pj[keep],pi[keep]]=np.arange(1,len(keep)+1)
inv=(np.clip(40-cs,0,40)*6).astype(np.uint16)
seg=ndi.watershed_ift(inv,mk)
seg[(cs<2.5)|bld]=0
area=ndi.sum(np.ones_like(cs),seg,range(1,len(keep)+1))
trees=[]
for n_,o in enumerate(keep):
    x=pi[o]+0.5; y=pj[o]+0.5; h=float(ph[o]); r=float(np.clip(math.sqrt(max(area[n_],1)/math.pi),1.2,min(9,0.45*h+1)))
    # pine vs deciduous: leaf-off aerial is dark green over conifers
    ci_,cj_=int(x/CC),int(y/CC); rp=max(1,int(r*0.5/CC))
    patch=A[max(cj_-rp,0):cj_+rp+1,max(ci_-rp,0):ci_+rp+1].reshape(-1,3)
    rr_,gg_,bb_=patch.mean(0); lum=(rr_+gg_+bb_)/3
    pine=1 if (gg_-rr_>4 and lum<95) else 0
    trees.append((round(x,1),round(y,1),round(r,1),round(h,1),pine))
print('sand m2',sand.sum()*CC*CC,'path m2',(cov==PATH).sum()*CC*CC,'water m2',water.sum()*CC*CC)
print('trees',len(trees),'pines',sum(t[4] for t in trees))
# ---- pins: flat-ish spots at least 4 m inside each green
gy,gx=np.gradient(dtm); slope=np.hypot(gx,gy)
out_holes=[]
for i,h in enumerate(H_):
    ox,oy,mk_=gm[i]
    full=np.zeros((CH,CW),bool); ys,xs=np.nonzero(mk_); full[ys+oy-Y0p,xs+ox-X0p]=True
    dt=ndi.distance_transform_edt(full)*CC
    need=min(4.0,dt.max()*0.55)
    cj,ci=np.nonzero(dt>=need)
    cand=[(ci_*CC+CC/2,cj_*CC+CC/2) for ci_,cj_ in zip(ci,cj)]
    cand=[c for c in cand if slope[min(int(c[1]),HH-1),min(int(c[0]),HW-1)]<0.04] or cand
    pins=[min(cand,key=lambda c:math.dist(c,h['gc']))]
    while len(pins)<6 and len(pins)<len(cand):
        pins.append(max(cand,key=lambda c:min(math.dist(c,p) for p in pins)))
    out_holes.append({'par':par[i],'hcp':hcp[i],'yds':h['yds'],'tee':[round(v,2) for v in h['tee']],'aim':[round(v,2) for v in h['path'][1]] if len(h['path'])==3 else [round(v,2) for v in h['gc']],
      'gc':[round(v,2) for v in h['gc']],'gf':[round(v,2) for v in h['gf']],'gb':[round(v,2) for v in h['gb']],'pins':[[round(a,2),round(b,2)] for a,b in pins]})
    inb=inside[int(h['tee'][1]/CC),int(h['tee'][0]/CC)], inside[int(h['gc'][1]/CC),int(h['gc'][0]/CC)]
    if not all(inb): print('WARNING hole',i+1,'tee/green outside boundary',inb)
# ---- heights: remove lidar noise on greens, cap green tilt at 5 percent (keeps the real fall direction)
Yg,Xg=np.mgrid[0:HH,0:HW]
gmask=ndi.map_coordinates(greens.astype(float),[(Yg+0.5)/CC-0.5,(Xg+0.5)/CC-0.5],order=1)
gsoft=ndi.gaussian_filter(np.clip(gmask*1.5,0,1),2)
smooth=ndi.gaussian_filter(dtm,2.2)
hts=dtm*(1-gsoft)+smooth*gsoft
feather=np.clip(ndi.gaussian_filter((gmask>0.5).astype(float),2.5)*1.6,0,1)
for i,h in enumerate(H_):
    gc=h['gc']; win=(np.abs(Xg+0.5-gc[0])<30)&(np.abs(Yg+0.5-gc[1])<30)
    mk=win&(gmask>0.5)
    if mk.sum()<20: continue
    A_=np.c_[Xg[mk]+0.5-gc[0],Yg[mk]+0.5-gc[1],np.ones(mk.sum())]
    a,b,c0=np.linalg.lstsq(A_,hts[mk],rcond=None)[0]
    tilt=math.hypot(a,b)
    if tilt>0.07:
        k=(tilt-0.07)/tilt
        adj=(a*k*(Xg+0.5-gc[0])+b*k*(Yg+0.5-gc[1]))*feather*win
        hts=hts-adj
        print('green %d tilt %.1f%% capped to 7%%'%(i+1,tilt*100))
# practice green: keep its real plane, damp the small lidar bumps
pc=w((1172,707)); pmask=(((Xg+0.5-pc[0])/11.5)**2+((Yg+0.5-pc[1])/9.5)**2)<=1
if pmask.sum()>20:
    A_=np.c_[Xg[pmask]+0.5-pc[0],Yg[pmask]+0.5-pc[1],np.ones(pmask.sum())]
    a_,b_,c_=np.linalg.lstsq(A_,hts[pmask],rcond=None)[0]
    plane=a_*(Xg+0.5-pc[0])+b_*(Yg+0.5-pc[1])+c_
    pf=np.clip(ndi.gaussian_filter(pmask.astype(float),1.5)*1.4,0,1)
    hts=hts*(1-pf)+(plane+0.4*(ndi.gaussian_filter(hts,1.5)-plane))*pf
base=float(np.floor(hts.min()))
cm_=np.round((hts-base)*100).astype(np.int32)
delta=np.diff(np.concatenate([np.zeros((HH,1),np.int32),cm_],1),axis=1).astype(np.int16)
b64=lambda b: base64.b64encode(zlib.compress(b,9)).decode()
tr=np.array(trees,dtype=float)
course={'name':'Fillmore Golf Club','cc':CC,'cW':CW,'cH':CH,'cover':b64(covf.tobytes()),
 'hc':1.0,'hW':HW,'hH':HH,'hBase':base,'heights':b64(delta.tobytes()),
 'trees':tr.flatten().round(1).tolist(),
 'holes':out_holes,'bound':[[round(p[0],1),round(p[1],1)] for p in bw],
 'practice':{'c':[round(v,2) for v in w((1172,707))],'rx':10.5,'ry':8.5},
 'range':{'tee':list(RANGE_TEE),'dir':list(RANGE_DIR),'line':list(RANGE_LINE),'half':RANGE_HALF},
 'road':[[round(p[0],1),round(p[1],1)] for p in tgroad]}
js='window.COURSE='+json.dumps(course,separators=(',',':'))+';\n'
open('../course.js','w').write(js)
print('course.js %.0f KB'%(len(js)/1024), 'cover b64 %.0f KB heights b64 %.0f KB'%(len(course['cover'])/1024,len(course['heights'])/1024))
for i,h in enumerate(out_holes): print(i+1,h['par'],h['yds'],len(h['pins']),'pins')
