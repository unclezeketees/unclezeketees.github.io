# Fillmore Golf course data pipeline

These scripts build `../course.js` (terrain, surfaces, trees, holes) for the game.
Run them from this folder with Python 3 and `numpy scipy pillow tifffile laspy lazrs pyproj`.

## Inputs to download first

1. NYS orthoimagery, saved as `nys2.jpg` (2000 x 2608, Web Mercator):
   `https://orthos.its.ny.gov/arcgis/rest/services/wms/Latest/MapServer/export?bbox=-8506757.18769,5263844.86028,-8505421.35381,5265586.78767&bboxSR=3857&imageSR=3857&size=2000,2608&format=jpg&f=image`
2. USGS 3DEP lidar point cloud tiles (NY_CayugaOswegoCounties_2018_A18), saved as `3825072650.laz` and `3840072650.laz`:
   `https://rockyweb.usgs.gov/vdelivery/Datasets/Staged/Elevation/LPC/Projects/NY_CayugaOswegoCounties_2018_A18/NY_CayugaOswego_2018/LAZ/USGS_LPC_NY_CayugaOswegoCounties_2018_A18_u_<tile>_2018.laz`

Included here: `gt_points.txt` (GolfTraxx tee, target and green GPS points per hole),
`osm.json` (OpenStreetMap course boundary, way 213743599), `roads.json` (OpenStreetMap roads and buildings
around the course), `crop.json` (game frame).

## Steps

1. `python3 greens.py` traces each green outline from the aerial, writes `green_masks.npy`.
2. `python3 lidar.py` clips the lidar to the course, writes `pts.npz`.
3. `python3 grids.py` builds the 1 m ground model and canopy height model, writes `grids.npz`.
4. `python3 build.py` classifies surfaces, detects trees, picks pin spots, writes `../course.js`.

## Hand-set details in build.py

- Creek centerline points (traced from the aerial, snapped to the lidar channel).
- In bounds: one smoothed outer line about 50 yds into the woods around the OSM outline, closed over the
  clubhouse strip and running up to Toll Gate Hill Rd. The road, everything across it, and the Golf View Rd
  house lots are out. No out-of-bounds islands.
- Clubhouse drive, gravel lot, cart path and the practice green southeast of the clubhouse (traced from the aerial).
- Bunkers at holes 1 and 9 (the only sand visible in the imagery), plus bowls found in the lidar:
  the rocky pit in the #6 fairway, the bowl beside #8 green, a pit short of #8, and a hollow near #10 green.
- Fairway widths are estimated (about 32 m, narrowing toward the green). The spring
  aerial does not show mowing lines clearly enough to trace them.
- Green tilt is capped at 7 percent. The lidar shows about 8.6 percent on #10, which a ball
  cannot stop on at the game's green speed. #5 and #7 keep their measured tilt.
