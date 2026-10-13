"""Build the webmap data files from the Wild Ginger Botanical Consulting delivery.

Usage:
    python scripts/prep_data.py "/path/to/Pine Invasive Survey 2026 Datasets 20260928"

Expects WGBC_LNF_Datasets2026.gdb and PineCreekInvasiveSurvey_Tracks2026/ inside that folder.
Writes data/*.js (published) and qa/ (local checks, git-ignored).
Requires: geopandas, pyogrio, shapely>=2.
"""
import sys, os, json
import geopandas as gpd, pandas as pd
from shapely.ops import unary_union
D=sys.argv[1] if len(sys.argv)>1 else "."
G=os.path.join(D,"WGBC_LNF_Datasets2026.gdb")
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"data")+"/"; QA=os.path.join(ROOT,"qa")+"/"; os.makedirs(QA,exist_ok=True)
inv=gpd.read_file(G,layer='InvasivesInventoryWGBC2026_ExportFeatures')
eo=gpd.read_file(G,layer='ElementOccurrenceWGBC2026_ExportFeatures')
si=gpd.read_file(G,layer='SI2025DataCollection2026ExportFeatures_ExportFeatures')
trk=gpd.read_file(os.path.join(D,"PineCreekInvasiveSurvey_Tracks2026","PineCreekInvasiveSurvey_Tracks2026.shp")).to_crs(26910)
# drop Z
from shapely import force_2d
for g in (inv,eo,si,trk): g['geometry']=force_2d(g.geometry)
inv=inv[inv.district_code=='050658'].copy(); eo=eo[eo.district_code=='050658'].copy(); si=si[si.District=='Eagle Lake'].copy()
# Stephens Camp exclusion zone
sc_si=si[si.SITE_NAME.str.contains('teph',case=False)]
sc_inv=inv[inv.Directions.fillna('').str.contains('Stephens Camp')]
seed=pd.concat([sc_si.geometry,sc_inv.geometry])
zone=unary_union(list(seed)).convex_hull.buffer(500)
print('zone area ac',zone.area/4046.86, 'bounds',zone.bounds)
def outside(g): return g[~g.geometry.intersects(zone)].copy()
print('inv before',len(inv)); inv_x=inv[inv.geometry.intersects(zone)]; print('excluded inv:',list(inv_x.SITE_ID)); inv=outside(inv)
print('si excluded',len(si)-len(outside(si)), 'eo excluded', len(eo)-len(outside(eo)))
si=outside(si); eo=outside(eo)
# tracks: clip out zone
trk['geometry']=trk.geometry.difference(zone); trk=trk[~trk.geometry.is_empty]
miles=trk.length.sum()/1609.34
foot=unary_union(list(trk.geometry.buffer(25)))  # ~50 m survey swath
extent=unary_union(list(trk.geometry.buffer(400))).buffer(-200).simplify(40)
print('track miles',miles,'swath ac',foot.area/4046.86,'extent ac',extent.area/4046.86)
# save zone for QA (not published)
gpd.GeoDataFrame(geometry=[zone],crs=26910).to_crs(4326).to_file(QA+'stephens_camp_exclusion_zone.geojson')
common={'Bromus inermis':'Smooth brome','Phalaris arundinacea':'Reed canarygrass','Alopecurus pratensis':'Meadow foxtail','Phleum pratense':'Timothy','Elymus repens':'Quackgrass','Thinopyrum intermedium':'Intermediate wheatgrass','Cirsium arvense':'Canada thistle'}
dist={'SP':'Variably patchy','CL':'Clumped','SE':'Evenly distributed','LI':'Linear'}
def num(x):
    try: return float(x)
    except: return None
inv['acres']=inv.area/4046.86
feats=inv.to_crs(4326)
recs=[]
for i,r in feats.iterrows():
    p=dict(id=r.SITE_ID, sci=r.scientific_name, common=common.get(r.scientific_name,''), code=r.SPECIES_CODE,
      acres=round(r.acres,3), infested=num(r.INFESTED_PERCENT), cover=num(r.COVER_PERCENT),
      dist=dist.get(r.DISTRIBUTION,r.DISTRIBUTION), count=r.SPECIES_COUNT, count_uom=r.SPECIES_COUNT_UOM,
      date=str(r.INV_DATE)[:10], quad=r.QuadName.title(), elev=num(r.ELEVATION_AVG),
      water_ft=num(r.HOR_DIST_TO_WATER), notes=(r.COMMENTS or '').strip().replace('\n',' ') if isinstance(r.COMMENTS,str) else '',
      pheno=r.PhenologyClass)
    recs.append(p)
feats=gpd.GeoDataFrame(recs,geometry=list(feats.geometry.simplify(0.000005)),crs=4326)
def dump(gdf,name,var,prec=6):
    js=gdf.to_json(drop_id=True)
    # round coords
    d=json.loads(js)
    def rnd(c):
        return [rnd(x) for x in c] if isinstance(c[0],(list,tuple)) else [round(c[0],prec),round(c[1],prec)]
    for f in d['features']: f['geometry']['coordinates']=rnd(f['geometry']['coordinates'])
    open(OUT+name,'w').write(f"window.{var} = "+json.dumps(d,separators=(',',':'))+";\n")
dump(feats,'invasives.js','INVASIVES')
dump(gpd.GeoDataFrame(geometry=[foot.simplify(8)],crs=26910).to_crs(4326),'survey_swath.js','SWATH',5)
dump(gpd.GeoDataFrame(geometry=[extent],crs=26910).to_crs(4326),'survey_extent.js','EXTENT',5)
t2=gpd.GeoDataFrame(geometry=list(trk.geometry.simplify(10)),crs=26910).to_crs(4326)
dump(t2,'tracks.js','TRACKS',5)
# species summary
s=inv.groupby('scientific_name').agg(n=('SITE_ID','size'),acres=('acres','sum'),
   med_cover=('COVER_PERCENT',lambda x: pd.to_numeric(x,errors='coerce').median()),
   med_water=('HOR_DIST_TO_WATER',lambda x: pd.to_numeric(x,errors='coerce').median()),
   quads=('QuadName',lambda x: ', '.join(sorted(set(q.title() for q in x))))).sort_values('acres',ascending=False)
print(s.to_string()); print('total ac',inv.acres.sum(), 'n',len(inv))
# rare/SI summary, no coordinates
si['site']=si.SITE_NAME.str.strip().str.title().replace({'Gorden Valley':'Gordon Valley'})
print(si.groupby('SCIENTIFIC').agg(n=('OCCURRENCE','size'),common=('COMMON_NAM','first'),sites=('site',lambda x:', '.join(sorted(set(x))))).to_string())
print(eo[['scientific_name','SITE_NAME','GENETS_RAMETS_COUNT']])
summary=dict(track_miles=round(miles),swath_acres=round(foot.area/4046.86),extent_acres=round(extent.area/4046.86),n_inv=len(inv),inv_acres=round(inv.acres.sum(),1),
  si_taxa=int(si.SCIENTIFIC.nunique()), si_n=len(si), tes_n=len(eo), tes_plants=int(eo.GENETS_RAMETS_COUNT.sum()),
  species={k:dict(n=int(v.n),acres=round(v.acres,2),med_cover=None if pd.isna(v.med_cover) else float(v.med_cover),quads=v.quads) for k,v in s.iterrows()})
json.dump(summary,open(QA+'summary.json','w'),indent=1)
print(json.dumps({k:v for k,v in summary.items() if k!='species'}))
# per-species settings text
for sp,g in inv.groupby('scientific_name'):
    print('##',sp); print(' | '.join(g.COMMENTS.dropna().str.strip().str[:80]))
inv['inf']=pd.to_numeric(inv.INFESTED_PERCENT,errors='coerce')
inv['net']=inv.acres*inv.inf/100
print(inv.groupby('scientific_name')[['acres','net']].sum().round(2), inv.net.sum())
print(inv.sort_values('acres',ascending=False)[['SITE_ID','acres','inf','COVER_PERCENT']].head(8))
summary['inv_net_acres']=round(inv.net.sum(),1)
for k in summary['species']: summary['species'][k]['net']=round(inv[inv.scientific_name==k].net.sum(),2)
json.dump(summary,open(QA+'summary.json','w'),indent=1)

open(OUT+'summary.js','w').write('window.SURVEY = '+json.dumps({k:summary[k] for k in ['track_miles','swath_acres','extent_acres']})+';\n')
