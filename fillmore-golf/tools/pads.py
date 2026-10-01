# Tee pads, the range tee and green #16, traced from the lidar ground points.
# Tee pads are leveled: raised above the slope around them with a flat top.
# Seeds were picked by eye on 0.5 m relief maps; the outline comes from the lidar.
import numpy as np, json, math
from scipy import ndimage as ndi
R5=0.5
def dtm05():
    P=np.load('pts.npz'); x,y,z,c=P['x'],P['y'],P['z'],P['c']
    g=c==2; HW,HH=int(811/R5),int(1132/R5)
    i=np.clip((x[g]/R5).astype(int),0,HW-1); j=np.clip((y[g]/R5).astype(int),0,HH-1); k=j*HW+i
    cnt=np.bincount(k,minlength=HW*HH); sm=np.bincount(k,weights=z[g],minlength=HW*HH)
    d=np.full(HW*HH,np.nan); ok=cnt>0; d[ok]=sm[ok]/cnt[ok]; d=d.reshape(HH,HW)
    m=np.isnan(d); idx=ndi.distance_transform_edt(m,return_distances=False,return_indices=True); f=d[idx[0],idx[1]]
    return ndi.gaussian_filter(np.where(m,ndi.gaussian_filter(f,2),f),0.5)
# hole: (seed x,y in m, options). share: use another hole's pad; start: 'south' etc picks part of the pad
TEES={
 1:((516,333),dict(thr=0.06,sig=10,maxsl=0.08,rad=20)),
 2:((326,603),{}), 4:((268,610),{}), 5:((92,336),{}), 6:((128,206),{}), 7:((360,72),{}),
 9:((205,335),{}),
 10:((527,325),dict(thr=0.03,sig=8,maxsl=0.07,rad=8,open_sky=True)),   # stay out from under the big tree
 11:((708,738),{}), 13:((356,1057),{}), 15:((426,591),{}), 16:((476,739),{}),
 17:((680,880),{}), 18:((553,537),{}),
}
SHARED={12:(17,'south')}   # #12 tees off the south end of the #17 pad, across the creek
RANGE_SEED=(509,245)
GREEN16=((622,878),dict(thr=0.10,sig=16,maxsl=0.14,rad=17))
def seg(D,SL,chm,seed,rad=16,thr=0.12,sig=12,maxsl=0.10,open_sky=False):
    sx,sy=int(seed[0]/R5),int(seed[1]/R5); r=int(rad/R5)
    y0,y1,x0,x1=max(sy-r-40,0),sy+r+40,max(sx-r-40,0),sx+r+40
    d=ndi.gaussian_filter(D,1.0)[y0:y1,x0:x1]; lr=d-ndi.gaussian_filter(d,sig)
    yy,xx=np.mgrid[y0:y1,x0:x1]
    canopy=(ndi.map_coordinates(chm,[(yy+0.5)*R5-0.5,(xx+0.5)*R5-0.5],order=1)>2.5) if open_sky else False
    m=(lr>thr)&(SL[y0:y1,x0:x1]<maxsl)&(np.hypot(xx-sx,yy-sy)<r)&~canopy
    m=ndi.binary_opening(m,iterations=2)
    lab,n=ndi.label(m); l=lab[sy-y0,sx-x0]
    if l==0:
        ii=ndi.distance_transform_edt(lab==0,return_distances=False,return_indices=True); l=lab[ii[0][sy-y0,sx-x0],ii[1][sy-y0,sx-x0]]
    m=ndi.binary_fill_holes(ndi.binary_closing(lab==l,iterations=2))
    ys,xs=np.nonzero(m); return np.stack([(xs+x0+0.5)*R5,(ys+y0+0.5)*R5],1)
def run():
    D=dtm05(); gy,gx=np.gradient(ndi.gaussian_filter(D,1.5),R5); SL=np.hypot(gx,gy)
    chm=np.load('grids.npz')['chm']
    out={'cell':R5,'tees':{},'range':None,'green16':None}
    def pack(p):
        c=p.mean(0); ev,evec=np.linalg.eigh(np.cov((p-c).T))
        return {'cells':p.round(2).tolist(),'c':c.round(2).tolist(),'axis':evec[:,1].round(3).tolist(),'len':round(4*math.sqrt(ev[1]),1)}
    for h,(s,kw) in TEES.items():
        out['tees'][h]=pack(seg(D,SL,chm,s,**kw)); out['tees'][h]['start']=out['tees'][h]['c']
    for h,(src,part) in SHARED.items():
        p=np.array(out['tees'][src]['cells']); q=p[p[:,1]>np.median(p[:,1])] if part=='south' else p
        out['tees'][h]=dict(out['tees'][src]); out['tees'][h]['start']=q.mean(0).round(2).tolist()
    out['range']=pack(seg(D,SL,chm,RANGE_SEED))
    out['green16']=pack(seg(D,SL,chm,GREEN16[0],**GREEN16[1]))
    json.dump(out,open('tee_pads.json','w'))
    for h,v in sorted(out['tees'].items()): print('tee',h,'start',v['start'],'pad %.0f m2'%(len(v['cells'])*R5*R5))
    print('range',out['range']['c'],'axis',out['range']['axis'],'len',out['range']['len'])
    print('green16',out['green16']['c'],'%.0f m2'%(len(out['green16']['cells'])*R5*R5))
if __name__=='__main__': run()
