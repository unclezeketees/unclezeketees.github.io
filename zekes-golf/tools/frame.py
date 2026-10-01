import math,json
X0,Y0,X1,Y1=-8506757.1876950022,5263844.8602762222,-8505421.3538050018,5265586.7876687823
W,H=2000,2608
MPP=(X1-X0)/W*math.cos(math.radians(42.689))   # ground meters per image px
def merc(lon,lat): return lon*20037508.342789244/180, math.log(math.tan((90+lat)*math.pi/360))*20037508.342789244/math.pi
def px(p):
    x,y=merc(p[1],p[0]); return ((x-X0)/(X1-X0)*W,(Y1-y)/(Y1-Y0)*H)
ev=[eval(l) for l in open('gt_points.txt').read().splitlines()[1:]]
holes=[]
for i in range(18):
    g=ev[i*5:(i+1)*5]
    d={k:px((la,lo)) for k,la,lo in g[:4]}
    d['tee']=px((g[4][1],g[4][2]))
    holes.append(d)
