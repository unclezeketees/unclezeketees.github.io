import numpy as np, json
from scipy import ndimage as ndi
from scipy.interpolate import griddata
cr=json.load(open('crop.json')); MPP=cr['MPP']
Wm=(cr['X1p']-cr['X0p'])*MPP; Hm=(cr['Y1p']-cr['Y0p'])*MPP
HW,HH=int(np.ceil(Wm)),int(np.ceil(Hm))
P=np.load('pts.npz'); x,y,z,c=P['x'],P['y'],P['z'],P['c']
i=np.clip(x.astype(int),0,HW-1); j=np.clip(y.astype(int),0,HH-1); k=j*HW+i
g=c==2
cnt=np.bincount(k[g],minlength=HW*HH); sm=np.bincount(k[g],weights=z[g],minlength=HW*HH)
dtm=np.full(HW*HH,np.nan); ok=cnt>0; dtm[ok]=sm[ok]/cnt[ok]; dtm=dtm.reshape(HH,HW)
print('ground coverage %.1f%%'%(ok.mean()*100))
# fill gaps: nearest then smooth blend
mask=np.isnan(dtm)
idx=ndi.distance_transform_edt(mask,return_distances=False,return_indices=True)
filled=dtm[idx[0],idx[1]]
# smooth only the filled cells a bit more
sm1=ndi.gaussian_filter(filled,3)
filled=np.where(mask,sm1,filled)
dtm=ndi.gaussian_filter(filled,0.6)
v=(c==1)
dsm=np.full(HW*HH,-1e9); np.maximum.at(dsm,k[v],z[v]); dsm=dsm.reshape(HH,HW)
vcnt=np.bincount(k[v],minlength=HW*HH).reshape(HH,HW)
chm=np.where(dsm>-1e8,dsm-dtm,0); chm=np.clip(chm,0,45)
anyret=(cnt.reshape(HH,HW)+vcnt)==0
np.savez_compressed('grids.npz',dtm=dtm,chm=chm,gcnt=cnt.reshape(HH,HW),vcnt=vcnt,void=anyret)
print('grid',HW,HH,'dtm range',dtm.min(),dtm.max(),'(ft %.0f-%.0f)'%(dtm.min()*3.281,dtm.max()*3.281),'void cells',anyret.sum(),'chm>3m %.1f%%'%((chm>3).mean()*100))
from PIL import Image
a=np.clip(chm/25,0,1); Image.fromarray((a*255).astype('uint8')).resize((HW,HH)).save('chm.png')
Image.fromarray((anyret*255).astype('uint8')).save('void.png')
gy,gx=np.gradient(dtm); hs=np.clip(0.6+(-gx-gy)*1.5,0,1)
Image.fromarray((hs*255).astype('uint8')).save('hs.png')
