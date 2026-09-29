exec(open('frame.py').read())
import laspy, numpy as np, json
from pyproj import Transformer
osm=json.load(open('osm.json')); bd=[e for e in osm['elements'] if e['id']==213743599][0]['geometry']
bpx=np.array([px((g['lat'],g['lon'])) for g in bd])
M=130
X0p=int(bpx[:,0].min()-M); X1p=int(bpx[:,0].max()+M); Y0p=int(bpx[:,1].min()-M); Y1p=int(bpx[:,1].max()+M)
print('crop px',X0p,Y0p,X1p,Y1p, 'size m', (X1p-X0p)*MPP,(Y1p-Y0p)*MPP)
json.dump({'X0p':X0p,'Y0p':Y0p,'X1p':X1p,'Y1p':Y1p,'MPP':MPP},open('crop.json','w'))
tr=Transformer.from_crs('EPSG:6347','EPSG:3857',always_xy=True)
xs=[];ys=[];zs=[];cl=[];rn=[];nr=[]
for f in ['3825072650.laz','3840072650.laz']:
    las=laspy.read(f)
    x=np.asarray(las.x); y=np.asarray(las.y)
    mx,my=tr.transform(x,y)
    ix=(mx-X0)/(X1-X0)*W; iy=(Y1-my)/(Y1-Y0)*H
    m=(ix>=X0p)&(ix<X1p)&(iy>=Y0p)&(iy<Y1p)
    xs.append((ix[m]-X0p)*MPP); ys.append((iy[m]-Y0p)*MPP); zs.append(np.asarray(las.z)[m]); cl.append(np.asarray(las.classification)[m])
    rn.append(np.asarray(las.return_number)[m]); nr.append(np.asarray(las.number_of_returns)[m])
    print(f, m.sum())
x=np.concatenate(xs);y=np.concatenate(ys);z=np.concatenate(zs);c=np.concatenate(cl)
np.savez_compressed('pts.npz',x=x,y=y,z=z,c=c,rn=np.concatenate(rn),nr=np.concatenate(nr))
u,n=np.unique(c,return_counts=True); print(dict(zip(u.tolist(),n.tolist())))
