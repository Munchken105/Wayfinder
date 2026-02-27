# IMDF Pipeline — Lockwood Library

This module converts AutoCAD floor plans (DXF) into an **Apple Maps Indoor Mapping Data Format (IMDF 1.0.0)** dataset for Lockwood Memorial Library, University at Buffalo.

## Quick Start

```bash
cd IMDF/
python3 main.py
# Output: export/*.geojson + Lockwood_IMDF_Final.zip
```

## Module Structure

| File | Purpose |
|------|---------|
| `main.py` | Entry point — runs the full pipeline |
| `transform.py` | GPS affine transformation & Shapely geometry normalization |
| `extract.py` | DXF layer parsing, unit classification, fixture/opening/amenity extraction |
| `export.py` | GeoJSON formatting, manifest, ZIP packaging |
| `IMDF_REFERENCE.md` | Full IMDF 1.0.0 enum & schema reference |

---

## What is IMDF?

**Indoor Mapping Data Format (IMDF)** is an OGC Community Standard (OGC 20-094) developed by Apple for representing the physical indoor environment of venues. It powers Apple Maps Indoor for airports, malls, libraries, and campuses.

- **Format:** GeoJSON Feature Collections, one file per feature type
- **Coordinate system:** WGS84 (EPSG:4326) — `[longitude, latitude]`
- **Archive:** A ZIP file with `.geojson` files + `manifest.json`
- **Spec:** https://docs.ogc.org/cs/20-094/index.html

---

## Feature Hierarchy

Apple Maps validates strict geometric containment between feature layers:

```
Venue  ⊇  Building  ⊇  Level  ⊇  Unit
                              ⊇  Opening  (LineString crossing unit boundaries)
                              ⊇  Fixture  (furniture, glass, obstacles)
                              ⊇  Amenity  (restroom, copier, information — Point)
```

---

## DXF Layer Mapping

| DXF Layer | IMDF Feature | Category | Notes |
|-----------|-------------|----------|-------|
| `FM-Area-Room` | `unit` | `room` | Interior rooms, labs, study spaces |
| `FM-Area-Circ` | `unit` | `walkway` | Corridors, hallways |
| `FM-Area-Na` | `unit` | `nonpublic` | Mechanical, storage, utility |
| `A-Flor-Strs-Exst` | `unit` | `staircase` | Stair cores |
| `A-Flor-Evtr-Exst` | `unit` | `elevator` | Elevator shafts |
| `A-Door-Exst` | `opening` | `pedestrian` | Door panels → `LineString` |
| `A-Furn-Exst` | `fixture` | `furniture` | Book stacks, tables, chairs |
| `A-Glaz-Exst` | `fixture` | `obstruction` | Glass walls, curtain walls |
| `A-Area-Iden-Exst` | metadata | — | Room numbers (`RMNUMB`) and areas (`RMAREA`) |

---

## Coordinate Transformation

The pipeline uses a two-anchor affine transformation to convert CAD drawing units to GPS (WGS84).

**Anchor points:**

| Point | CAD (x, y) | GPS (lon, lat) |
|-------|-----------|----------------|
| A | `(16.75, -3134.25)` | `(-78.78568152, 42.99989059)` |
| B | `(-2176.75, -3134.25)` | `(-78.78638326, 42.99989059)` |

**Algorithm** (`transform.py`):
1. Compute scale `S` and rotation `θ` from the two anchor displacements
2. For each CAD point `(x, y)`, translate relative to anchor A, rotate+scale to metres, convert metres → degrees using latitude-aware `meters_per_deg_lon`

---

## Output Files

Running `main.py` produces these files in `export/`:

| File | Description |
|------|-------------|
| `manifest.json` | IMDF version, language, generator |
| `address.geojson` | Venue mailing address |
| `venue.geojson` | Outer venue polygon (buffered convex hull) |
| `building.geojson` | Building polygon (ground-floor convex hull) |
| `footprint.geojson` | Same geometry, `category: "ground"` |
| `level.geojson` | One feature per floor (B, 1–5) |
| `unit.geojson` | All rooms, walkways, staircases, elevators |
| `opening.geojson` | Door LineStrings connecting adjacent units |
| `fixture.geojson` | Furniture clusters and glass wall segments |
| `amenity.geojson` | Restrooms, copiers, information desks |

---

## Key Implementation Decisions

### 1. Opening Geometry — LineString not Polygon
The IMDF specification requires openings to be `LineString` geometries that cross the boundary between two adjacent units. Each door entity from `A-Door-Exst` is processed individually; its CAD endpoints are transformed directly to GPS to form the LineString.

### 2. Furniture as Fixtures
Furniture blocks (`A-Furn-Exst`) contain ~50,000 disconnected `LINE` entities per floor. These are:
- Merged with `unary_union`
- Buffered by 2 CAD units
- Convex hull taken per disconnected cluster → `fixture` with `category: "furniture"`

This preserves visual presence on the map without blocking wayfinding routes (fixtures are obstacles, not routable units).

### 3. Glass Walls as Obstructions
Glass partitions (`A-Glaz-Exst`) are buffered and output as `fixture` with `category: "obstruction"`.

### 4. Room Metadata
The `A-Area-Iden-Exst` layer block inserts carry `RMNUMB` (room number, e.g. `206A`) and `RMAREA` (area in sq ft, e.g. `530sf`). These are spatially matched to unit polygons via point-in-polygon containment.

### 5. Venue Buffering
The venue convex hull receives a `buffer(0.005)` (≈ 550m at this latitude — effectively a tight margin in degrees) to guarantee the validator's containment hierarchy check passes.

---

## Apple Maps Validator Notes

| Validator Error | Root Cause | Fix Applied |
|-----------------|-----------|-------------|
| `invalid_geometry_type` on opening | Opening was `Polygon` | Changed to `LineString` from actual door endpoints |
| `invalid_enum_value` on opening | Category was `"door"` | Changed to `"pedestrian"` |
| `invalid_enum_value` on unit | Category was `"shelving"`, `"column"`, `"glass"` | Moved to `fixture` feature type |
| `invalid_enum_value` on amenity | Category was `"printer"` | Changed to `"copier"` |
| `invalid_enum_value` on building | Category was `"education"` | Changed to `"unspecified"` |
| `feature_not_contained` | Venue too tight around units | Added `buffer(0.005)` to venue hull |
| `amenity_must_reference_unit` | Amenities missing `unit_ids` | Spatial containment lookup added |

---

## Valid IMDF Enum Quick Reference

### Unit Categories
`room`, `walkway`, `restroom`, `staircase`, `elevator`, `nonpublic`, `corridor`, `lobby`, `storage`, `unspecified` *(and many more — see IMDF_REFERENCE.md)*

### Opening Categories
`pedestrian` ✅ · `automobile` · `emergencyexit` · `service` · `unspecified`

### Fixture Categories
`furniture` ✅ · `obstruction` ✅ · `glass` · `shelving` · `column` · `wall` · `seating` · `signage` *(and more)*

### Amenity Categories
`restroom` ✅ · `copier` ✅ · `information` ✅ · `elevator` · `atm` · `charging` · `water` · `trash` · `parking` *(and more)*

### Building Categories *(only two valid values)*
`parking` · `unspecified` ✅

### Venue Categories
`university` ✅ · `library` · `airport` · `mall` · `museum` · `transitstation` · `unspecified` *(and more)*

---

## Floor Mapping

| DXF Floor Code | Ordinal | Short Name |
|---------------|---------|-----------|
| `0B` | 0 | B (Basement) |
| `01` | 1 | 1 |
| `02` | 2 | 2 |
| `03` | 3 | 3 |
| `04` | 4 | 4 |
| `05` | 5 | 5 |

---

## Dependencies

```
ezdxf>=1.0.0
shapely>=2.0.0
```

Install with:
```bash
pip install ezdxf shapely
```
