exec(open('frame.py').read())
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
A=np.asarray(Image.open('nys2.jpg').convert('RGB')).astype(float)
R_,G_,B_=A[...,0],A[...,1],A[...,2]
tan=ndi.gaussian_filter(R_-G_+0.3*(R_-B_),1.5)
L=(R_+G_+B_)/3
tex=np.sqrt(np.maximum(ndi.uniform_filter(L*L,7)-ndi.uniform_filter(L,7)**2,0))
tex=ndi.gaussian_filter(tex,1.5)
H_,W_=tan.shape
yy,xx=np.mgrid[-70:71,-70:71]; rr=np.hypot(xx,yy)*MPP
masks=[]
for i,h in enumerate(holes):
    x,y=map(int,h['gc']); w=tan[y-70:y+71,x-70:x+71]
    c=w[rr<3].mean(); ring=np.median(w[(rr>20)&(rr<30)])
    thr=(c+ring)/2
    tw=tex[y-70:y+71,x-70:x+71]; tc=np.median(tw[rr<5])
    m=(w>thr)&(rr<24)&(tw<max(tc*1.8,tc+4))
    m=ndi.binary_opening(m,iterations=3)
    lab,n=ndi.label(m); k=lab[70,70]
    if k==0:
        k=lab[rr<4].max()
    m=lab==k; m=ndi.binary_fill_holes(m); m=ndi.binary_closing(m,iterations=4); m=ndi.binary_fill_holes(m)
    m=ndi.binary_opening(m,iterations=5); lab,n=ndi.label(m); k=lab[70,70] or (lab[rr<5].max() if lab[rr<5].max() else 0)
    if k: m=lab==k
    # ellipse clamp from moments
    ys,xs=np.nonzero(m); cy,cx=ys.mean(),xs.mean(); C=np.cov(np.vstack([xs-cx,ys-cy]))
    ev,evec=np.linalg.eigh(C); ax=2*np.sqrt(ev)
    X=np.stack([xx+70-cx,yy+70-cy],-1)@evec; E=(X[...,0]/ax[0])**2+(X[...,1]/ax[1])**2
    m=(m&(E<1.06**2))|(E<0.85**2)
    m=ndi.gaussian_filter(m.astype(float),2.0)>0.5
    area=m.sum()*MPP*MPP
    gl=math.hypot(h['gf'][0]-h['gb'][0],h['gf'][1]-h['gb'][1])*MPP
    print(i+1,'thr %.1f area %.0f m2 (%.0f sqft)  gps f-b %.1f m'%(thr,area,area*10.764,gl))
    masks.append((x-70,y-70,m))
np.save('green_masks.npy',np.array(masks,dtype=object),allow_pickle=True)
im=Image.open('nys2.jpg').convert('RGB')
R=90; sheet=Image.new('RGB',(6*360,3*360))
for i,h in enumerate(holes):
    g=h['gc']; ox,oy,m=masks[i]
    c=im.crop((int(g[0]-R),int(g[1]-R),int(g[0]+R),int(g[1]+R)))
    ov=np.zeros((2*R,2*R),bool); sx=ox-int(g[0]-R); sy=oy-int(g[1]-R)
    ov[sy:sy+141,sx:sx+141]=m
    edge=ov^ndi.binary_erosion(ov)
    a=np.asarray(c).copy(); a[edge]=[255,0,255]
    c=Image.fromarray(a).resize((360,360),Image.NEAREST); ImageDraw.Draw(c).text((6,6),'G%d'%(i+1),fill=(255,255,0))
    sheet.paste(c,((i%6)*360,(i//6)*360))
sheet.save('greens_seg.jpg',quality=90)
