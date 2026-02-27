# IMDF 1.0.0 Reference

> Source: OGC Community Standard 20-094 — Indoor Mapping Data Format  
> Spec URL: https://docs.ogc.org/cs/20-094/index.html

---

## Overview

IMDF is a GeoJSON-based standard for describing the indoor physical space of a venue.  
It is organized as a **ZIP archive** containing one `.geojson` file per feature type plus a `manifest.json`.

### Feature Hierarchy (containment order)

```
Venue
  └── Building (1…n)
        └── Footprint (1 per building)
        └── Level (1…n)
              └── Unit (0…n)
              └── Opening (0…n)        ← connects Units
              └── Fixture (0…n)
              └── Amenity (0…n)        ← points of interest
              └── Kiosk (0…n)
              └── Section (0…n)
              └── Geofence (0…n)
  └── Address (1 per venue)
```

Apple Maps validator enforces **strict** geometric containment at every level.

---

## Archive Structure

```
archive.imdf/
├── manifest.json       ← Required. Version and metadata.
├── address.geojson     ← Required.
├── venue.geojson       ← Required.
├── building.geojson    ← Required.
├── footprint.geojson   ← Required.
├── level.geojson       ← Required.
├── unit.geojson        ← Optional but almost always present.
├── opening.geojson     ← Optional.
├── amenity.geojson     ← Optional.
├── fixture.geojson     ← Optional.
└── ...
```

### manifest.json
```json
{
  "version": "1.0.0",
  "language": "en",
  "generated_by": "Wayfinder-AI"
}
```

---

## Feature Type Reference

Each feature follows a standard GeoJSON wrapper:

```json
{
  "id": "<uuid>",
  "type": "Feature",
  "feature_type": "<type>",
  "geometry": { ... },
  "properties": { ... }
}
```

---

### `address`

| Property    | Type   | Required | Notes                          |
|-------------|--------|----------|--------------------------------|
| `address`   | string | ✅       | Street address                 |
| `locality`  | string | ✅       | City                           |
| `province`  | string | ✅       | ISO 3166-2 code, e.g. `US-NY` |
| `country`   | string | ✅       | ISO 3166-1 alpha-2, e.g. `US` |
| `postal_code` | string | ✅     |                                |
| `unit`      | string | ❌       | Suite / apt number             |

**Geometry**: `null`

---

### `venue`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | See [Venue Categories](#venue-categories) |
| `name`         | LocalizedString | ✅  | `{"en": "My Venue"}`            |
| `display_point` | Point     | ❌       | Pin location on map              |
| `address_id`   | UUID       | ✅       | References `address.geojson`     |
| `hours`        | string     | ❌       | OSM opening_hours format         |
| `phone`        | string     | ❌       | E.164 format                     |
| `website`      | string     | ❌       | URL                              |
| `restriction`  | enum       | ❌       | `"none"`, `"employeesonly"`, `"restricted"` |

**Geometry**: `Polygon` — must strictly contain all child Building geometries.

#### Venue Categories
`airport`, `aquarium`, `businesscampus`, `casino`, `communitycenter`, `conventioncenter`, `governmentbuilding`,
`healthcarefacility`, `hotel`, `library`, `mall`, `museum`, `namr`, `parkingfacility`, `resort`, `retailstore`,
`school`, `stadium`, `stripmall`, `theme_park`, `transitstation`, `university`, `warehouse`, `unspecified`

---

### `building`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | See [Building Categories](#building-categories) |
| `name`         | LocalizedString | ✅  |                                  |
| `short_name`   | LocalizedString | ❌  |                                  |
| `display_point` | Point     | ❌       |                                  |
| `address_id`   | UUID       | ❌       |                                  |
| `footprint_id` | UUID       | ❌       |                                  |
| `restriction`  | enum       | ❌       |                                  |

**Geometry**: `Polygon` — must be contained by Venue and contain all its Levels.

#### Building Categories
`parking`, `unspecified`

> ⚠️ Only two values are valid for Building. Do NOT use `education`, `library`, etc.

---

### `footprint`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | `"ground"`, `"subterranean"`, `"aerial"`, `"unspecified"` |
| `name`         | LocalizedString | ❌  |                                  |
| `building_ids` | [UUID]     | ✅       |                                  |

**Geometry**: `Polygon`

---

### `level`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `ordinal`      | integer    | ✅       | 0 = ground, negative = basement  |
| `short_name`   | LocalizedString | ✅  | Floor label, e.g. `"1"`, `"B"`  |
| `category`     | enum       | ✅       | `"unspecified"` is common        |
| `outdoor`      | boolean    | ✅       |                                  |
| `name`         | LocalizedString | ❌  |                                  |
| `building_ids` | [UUID]     | ✅       |                                  |
| `restriction`  | enum       | ❌       |                                  |

**Geometry**: `Polygon`

#### Level Categories
`auditorium`, `buttresslevel`, `carpark`, `conferenceroom`, `exhibition`, `foodcourt`, `lobby`, `lounge`,
`movielevel`, `observation`, `recreation`, `skating`, `transit`, `unspecified`

---

### `unit`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | See [Unit Categories](#unit-categories) |
| `name`         | LocalizedString | ❌  |                                  |
| `short_name`   | LocalizedString | ❌  |                                  |
| `alt_name`     | LocalizedString | ❌  |                                  |
| `level_id`     | UUID       | ✅       |                                  |
| `display_point` | Point     | ❌       |                                  |
| `occupancy`    | enum       | ❌       | `"public"`, `"nonpublic"`        |
| `accessibility` | [enum]   | ❌       | `"wheelchair"`                   |
| `restriction`  | enum       | ❌       |                                  |

**Geometry**: `Polygon`

#### Unit Categories
`auditorium`, `bathroom`, `bedroom`, `busarea`, `cafe`, `classroom`, `conference`, `corridor`, `dishwashingroom`,
`elevator`, `escalator`, `fieldofplay`, `foodprep`, `foodservice`, `guestroom`, `kitchen`, `lab`, `library`,
`lobby`, `lounge`, `mailroom`, `mechanical`, `movietheater`, `nonpublic`, `office`, `parking`, `phonebooth`,
`platform`, `privatelounge`, `proscenium`, `recreation`, `restroom`, `room`, `serverroom`, `shop`, `shower`,
`staircase`, `storage`, `storeroom`, `structure`, `ticketing`, `unspecified`, `utilities`, `vestibule`,
`walkway`

> ⚠️ `shelving`, `column`, `glass` are **NOT** valid Unit categories. Use `fixture` feature_type instead.

---

### `opening`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | See [Opening Categories](#opening-categories) |
| `level_id`     | UUID       | ✅       |                                  |
| `unit_ids`     | [UUID]     | ❌       | Links two adjacent Units          |
| `accessibility` | [enum]   | ❌       | `"wheelchair"`                   |
| `name`         | LocalizedString | ❌  |                                  |
| `door`         | object     | ❌       | `{type, material, automatic}`    |
| `restriction`  | enum       | ❌       |                                  |

**Geometry**: ⚠️ **`LineString` ONLY** — Not Polygon.  
The LineString must cross the boundary between two adjacent units.

#### Opening Categories
`automobile`, `emergencyexit`, `pedestrian`, `service`, `unspecified`

> ⚠️ `door` is **NOT** a valid Opening category.

---

### `fixture`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | See [Fixture Categories](#fixture-categories) |
| `level_id`     | UUID       | ✅       |                                  |
| `name`         | LocalizedString | ❌  |                                  |
| `alt_name`     | LocalizedString | ❌  |                                  |
| `display_point` | Point     | ❌       |                                  |
| `anchor_id`    | UUID       | ❌       |                                  |

**Geometry**: `Polygon` or `Point`

#### Fixture Categories
`cabinetry`, `column`, `credenza`, `default`, `display`, `fireplace`, `fitness`, `fountain`, `furniture`,
`gamearea`, `glass`, `kitchen`, `locker`, `lounge`, `movingwalkway`, `obstruction`, `piano`, `planter`,
`reception`, `seating`, `shelving`, `showcase`, `signage`, `stairs`, `structure`, `tech`, `vegetation`,
`wall`, `workstation`

> ✅ Use `fixture` with `category: "furniture"` for tables/chairs. Use `category: "shelving"` for book stacks.

---

### `amenity`

| Property       | Type       | Required | Notes                            |
|----------------|------------|----------|----------------------------------|
| `category`     | enum       | ✅       | See [Amenity Categories](#amenity-categories) |
| `name`         | LocalizedString | ❌  |                                  |
| `alt_name`     | LocalizedString | ❌  |                                  |
| `unit_ids`     | [UUID]     | ❌       | Units this amenity belongs to    |
| `level_ids`    | [UUID]     | ❌       |                                  |
| `accessibility` | [enum]   | ❌       | `"wheelchair"`                   |
| `hours`        | string     | ❌       |                                  |
| `phone`        | string     | ❌       |                                  |
| `website`      | string     | ❌       |                                  |

**Geometry**: `Point`

#### Amenity Categories
`arttour`, `atm`, `babycare`, `bar`, `bikestorage`, `busservice`, `cafe`, `charging`, `cinema`, `cloakroom`,
`concierge`, `copier`, `currency`, `elevator`, `emergency`, `escalator`, `exhibitionhall`, `family`,
`fax`, `feedback`, `firstaid`, `fountain`, `gate`, `guestservice`, `hotel`, `information`, `internet`,
`library`, `lockers`, `lounge`, `luggagestorage`, `metroservice`, `militaryservice`, `nosmokingarea`,
`parking`, `phone`, `playground`, `plaza`, `police`, `postbox`, `recycling`, `restroom`, `ridesharing`,
`seating`, `shop`, `shower`, `shoppingshelves`, `skiservice`, `smokingarea`, `snacks`, `spa`, `stairs`,
`taxi`, `ticket`, `transitservice`, `trash`, `unspecified`, `valet`, `waitingarea`, `water`, `wheelchair`

> ⚠️ `printer` is **NOT** a valid Amenity category. Use `copier` instead.

---

## Property Types

### LocalizedString
A dictionary keyed by BCP-47 language tags:
```json
{"en": "Main Library", "es": "Biblioteca Principal"}
```

### Restriction Values
`"none"`, `"employeesonly"`, `"restricted"`

### Accessibility Values
`"wheelchair"`

### Door Object
```json
{
  "type": "revolving" | "sliding" | "double" | "pocket" | "unspecified",
  "material": "wood" | "glass" | "metal" | "unspecified",
  "automatic": true | false
}
```

---

## Geometry Rules

| Feature Type  | Allowed Geometry Types          |
|---------------|---------------------------------|
| `address`     | `null`                          |
| `venue`       | `Polygon`                       |
| `building`    | `Polygon`                       |
| `footprint`   | `Polygon`                       |
| `level`       | `Polygon`                       |
| `unit`        | `Polygon`                       |
| `opening`     | **`LineString`**                |
| `fixture`     | `Polygon`, `Point`             |
| `amenity`     | `Point`                         |
| `kiosk`       | `Point`, `Polygon`             |

All coordinates must be **WGS84 (EPSG:4326)** `[longitude, latitude]` pairs.

---

## Common Validator Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `invalid_geometry_type` on opening | Opening stored as Polygon | Use `LineString` |
| `invalid_enum_value` on unit category | Using `shelving`, `column`, `glass` as unit | Use `fixture` feature_type |
| `invalid_enum_value` on opening category | Using `door` | Use `pedestrian` |
| `invalid_enum_value` on amenity category | Using `printer` | Use `copier` |
| `invalid_enum_value` on building category | Using `education` | Use `unspecified` |
| `feature_not_contained_by_parent` | Venue/Building/Level polys don't fully contain children | Buffer outer geometries |
| `self_intersection` | Polygon ring crosses itself | Apply `shapely.validation.make_valid()` |
| `snapped_vertices` | Too many decimal places in coords | Round all coords to 7 decimal places |
