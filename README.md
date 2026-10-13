# Pine Creek Invasive Plants 2026 — webmap (draft)

Static Leaflet map of the 2026 Pine Creek invasive plant survey (Wild Ginger Botanical Consulting for Trout Unlimited, Lassen NF Eagle Lake RD). No build step.

## Run / host
- Local: double-click `index.html` (data load as `<script>` files, so it works from disk).
- GitHub Pages: push this folder to a repo, then Settings → Pages → deploy from branch (root).

## Files
| Path | What |
|---|---|
| `index.html` | Page shell and text |
| `css/style.css` | Styling (light/dark) |
| `js/app.js` | Map, legend, popups, species/group profiles |
| `js/species.js` | Species profiles, groups, colors, rare-plant summary text |
| `data/invasives.js` | 56 invasive polygons, WGS84 |
| `data/survey_swath.js` | GPS tracks buffered ±25 m (ground searched) |
| `data/survey_extent.js` | Generalized survey-area outline (tracks buffered 400 m, shrunk 200 m) |
| `data/tracks.js` | GPS tracks, simplified ~10 m |
| `data/summary.js` | Track miles and swath acreage |
| `scripts/prep_data.py` | Rebuilds everything in `data/` from the source .gdb and tracks shapefile |

## Data processing (from `WGBC_LNF_Datasets2026.gdb`, Sept 28 2026 delivery)
- Kept Eagle Lake RD records only (district 050658); Hat Creek "Valley Project" records dropped.
- **Stephens Camp excluded (private land):** a 500 m buffer around the convex hull of all Stephens Camp records. Removes invasive polygons PHPR3-006, THIN6-002, PHPR3-007, 10 SI occurrences, and the GPS track segments inside it.
- Rare (TES) and SI plant locations are **not** published; only species names and occurrence counts appear.
- Fields dropped from the public data: directions, examiner names, GlobalIDs, edit metadata.
- Net acres = polygon acres × INFESTED_PERCENT.

## Rebuilding the data
```
pip install geopandas pyogrio
python scripts/prep_data.py "/path/to/Pine Invasive Survey 2026 Datasets 20260928"
```
Raw survey data stays out of the repo (see `.gitignore`). The script also writes a local `qa/` folder (git-ignored) with the Stephens Camp exclusion outline for checking.

## Working on changes
- `main` is the live version.
- Each change goes on its own branch (`feature/…`, `fix/…`, `data/…`) and is merged to `main` through a pull request, so every change has a record and can be rolled back.
