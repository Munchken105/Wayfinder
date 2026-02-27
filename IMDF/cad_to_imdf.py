import ezdxf
from shapely.geometry import Polygon, Point, mapping
from shapely.ops import unary_union, snap
import json
import uuid
import os
import glob
import math
import zipfile

# Anchor points (CAD vs GPS)
cad_A = (16.75, -3134.25)
gps_A = (-78.78568152, 42.99989059)

cad_B = (-2176.75, -3134.25)
gps_B = (-78.78638326, 42.99989059)

anchor_lat = gps_A[1]
anchor_lon = gps_A[0]

meters_per_deg_lat = 111132.954
meters_per_deg_lon = 40075016.685 * math.cos(math.radians(anchor_lat)) / 360.0

U_m = (gps_B[0] - anchor_lon) * meters_per_deg_lon
V_m = (gps_B[1] - anchor_lat) * meters_per_deg_lat

u = cad_B[0] - cad_A[0]
v = cad_B[1] - cad_A[1]

S = math.hypot(U_m, V_m) / math.hypot(u, v)
theta = math.atan2(V_m, U_m) - math.atan2(v, u)

VENUE_ID = str(uuid.uuid4())
ADDRESS_ID = str(uuid.uuid4())
BUILDING_ID = str(uuid.uuid4())
FOOTPRINT_ID = str(uuid.uuid4())

def transform_coords(x, y):
    dx = x - cad_A[0]
    dy = y - cad_A[1]
    
    # Rotate and scale
    dx_m = S * (dx * math.cos(theta) - dy * math.sin(theta))
    dy_m = S * (dx * math.sin(theta) + dy * math.cos(theta))
    
    # Translate back to lon/lat
    lon = anchor_lon + (dx_m / meters_per_deg_lon)
    lat = anchor_lat + (dy_m / meters_per_deg_lat)
    return [round(lon, 7), round(lat, 7)]

from shapely.validation import make_valid

def transform_polygon(polygon):
    if polygon.is_empty:
        return polygon
    ext = [transform_coords(x, y) for x, y in polygon.exterior.coords]
    ints = [[transform_coords(x, y) for x, y in interior.coords] for interior in polygon.interiors]
    new_poly = Polygon(ext, ints)
    # Snap vertices to fix Apple validation issues
    new_poly = snap(new_poly, new_poly, 0.001)
    if not new_poly.is_valid:
        new_poly = make_valid(new_poly)
        # If make_valid creates a GeometryCollection or MultiPolygon, just take the largest polygon
        if new_poly.geom_type == 'GeometryCollection':
            polys = [g for g in new_poly.geoms if g.geom_type == 'Polygon']
            if polys:
                new_poly = max(polys, key=lambda p: p.area)
        elif new_poly.geom_type == 'MultiPolygon':
            new_poly = max(new_poly.geoms, key=lambda p: p.area)
    return new_poly

def create_imdf():
    export_dir = '/home/purusoni/Classes/CSE453/WayfinderMain/IMDF/export'
    os.makedirs(export_dir, exist_ok=True)
    dxf_files = glob.glob('/home/purusoni/Classes/CSE453/WayfinderMain/IMDF/DXF_out/S_A350_*.dxf')
    
    units = []
    levels = []
    buildings = []
    footprints = []
    openings = []
    amenities = []
    fixtures = []
    venue_geom_polys = []
    
    floor_mapping = {
        '0B': {'ordinal': 0, 'short_name': 'B'},
        '01': {'ordinal': 1, 'short_name': '1'},
        '02': {'ordinal': 2, 'short_name': '2'},
        '03': {'ordinal': 3, 'short_name': '3'},
        '04': {'ordinal': 4, 'short_name': '4'},
        '05': {'ordinal': 5, 'short_name': '5'}
    }

    first_floor_polys = []
    
    for dxf_file in dxf_files:
        filename = os.path.basename(dxf_file)
        parts = filename.split('_')
        if len(parts) >= 3:
            floor_code = parts[2]
            if floor_code not in floor_mapping:
                continue
            ordinal = floor_mapping[floor_code]['ordinal']
            level_short_name = floor_mapping[floor_code]['short_name']
        else:
            continue
            
        try:
            doc = ezdxf.readfile(dxf_file)
        except Exception as e:
            print(f"Failed to read {dxf_file}: {e}")
            continue
            
        msp = doc.modelspace()
        
        # 1. Extract Labels & Rich Metadata (Task 5)
        labels = []
        rich_labels = []  # {point, rmnumb, rmarea}
        for insert in msp.query('INSERT'):
            if insert.has_attrib:
                rmnumb = None
                rmarea = None
                insert_x = insert.dxf.insert.x
                insert_y = insert.dxf.insert.y
                for attrib in insert.attribs:
                    tag = attrib.dxf.tag
                    val = attrib.dxf.text.strip()
                    if tag == 'RMNUMB' and val:
                        rmnumb = val
                    elif tag == 'RMAREA' and val:
                        rmarea = val
                if rmnumb:
                    pt = Point(insert_x, insert_y)
                    labels.append({"point": pt, "name": rmnumb})
                    rich_labels.append({"point": pt, "rmnumb": rmnumb, "rmarea": rmarea})
                            
        for txt in msp.query('TEXT MTEXT'):
            content = txt.dxf.text if txt.dxftype() == 'TEXT' else txt.text
            content = content.strip()
            if content:
                try:
                    insert_point = Point(txt.dxf.insert.x, txt.dxf.insert.y)
                    labels.append({"point": insert_point, "name": content})
                except Exception:
                    pass
                            
        floor_id = f"floor_{floor_code}"
        level_id = str(uuid.uuid4())
        level_trans_polys = []
        
        # 2. Extract Units, Walkways, Voids
        layer_categories = {
            'FM-Area-Room': 'room',
            'FM-Area-Circ': 'walkway',
            'FM-Area-Na': 'nonpublic',
            'A-Flor-Strs-Exst': 'staircase',
            'A-Flor-Evtr-Exst': 'elevator'
        }
        
        for layer, default_category in layer_categories.items():
            entities = msp.query('LWPOLYLINE').groupby(dxfattrib='layer').get(layer, [])
            for entity in entities:
                if entity.is_closed or (entity.dxf.flags & 1):
                    pts = [(p[0], p[1]) for p in entity.get_points()]
                    if len(pts) >= 3:
                        poly = Polygon(pts)
                        if poly.is_valid:
                            room_name = None
                            room_area = None
                            for label in rich_labels:
                                if poly.contains(label['point']):
                                    room_name = label['rmnumb']
                                    room_area = label['rmarea']
                                    break
                            # fallback: try plain labels (TEXT/MTEXT)
                            if not room_name:
                                for label in labels:
                                    if poly.contains(label['point']):
                                        room_name = label['name']
                                        break
                            
                            category = default_category
                            if room_name:
                                rn_up = room_name.upper()
                                if any(k in rn_up for k in ["STAIR", "STR", "STAIRS"]):
                                    category = "staircase"
                                elif any(k in rn_up for k in ["ELEVATOR", "ELEV", "EV"]):
                                    category = "elevator"
                                elif any(k in rn_up for k in ["BATHROOM", "RESTROOM", "RR", "MEN", "WOMEN"]):
                                    category = "restroom"
                            
                            unit_id = str(uuid.uuid4())
                            trans_poly = transform_polygon(poly)
                            
                            # Build descriptive name for rooms
                            if category == 'room' and room_name:
                                name_prop = f"Room {room_name}"
                                short_name_prop = room_name
                            elif category == 'restroom' and room_name:
                                name_prop = f"Restroom {room_name}"
                                short_name_prop = f"RR {room_name}"
                            elif category in ["walkway", "staircase", "elevator"]:
                                name_prop = None
                                short_name_prop = None
                            else:
                                name_prop = room_name if room_name else None
                                short_name_prop = room_name if room_name else None
                            
                            props = {
                                "category": category,
                                "name": { "en": name_prop } if name_prop else None,
                                "short_name": { "en": short_name_prop } if short_name_prop else None,
                                "level_id": level_id
                            }
                            
                            # Inject area metadata
                            if room_area:
                                props["alt_name"] = {"en": room_area}
                            
                            if category in ["walkway", "staircase", "elevator"]:
                                props["occupancy"] = "public"
                            if category in ["restroom"]:
                                props["occupancy"] = "public"
                            if category == "nonpublic":
                                props["occupancy"] = "nonpublic"

                            feature = {
                                "id": unit_id,
                                "type": "Feature",
                                "feature_type": "unit",
                                "geometry": mapping(trans_poly),
                                "properties": props
                            }
                            units.append(feature)
                            level_trans_polys.append(trans_poly)
                            venue_geom_polys.append(trans_poly)
                            
                            if floor_code == '01':
                                first_floor_polys.append(trans_poly)
                                
        # Door Openings Extraction
        from shapely.geometry import LineString, MultiLineString
        door_ents = msp.query('*[layer=="A-Door-Exst"]')
        door_lines = []
        for e in door_ents:
            if e.dxftype() == 'LWPOLYLINE':
                pts = [(p[0], p[1]) for p in e.get_points()]
                if len(pts) >= 2:
                    door_lines.append(LineString(pts))
            elif e.dxftype() == 'LINE':
                door_lines.append(LineString([(e.dxf.start.x, e.dxf.start.y), (e.dxf.end.x, e.dxf.end.y)]))
            # Treating Arcs primarily as contextual, lines provide enough boundary structure for the door block intersection. 
            # Could approximate arcs later if needed.
            
        if door_lines:
            union_doors = unary_union(door_lines)
            if union_doors.geom_type in ['LineString', 'MultiLineString']:
                door_shapes = [line.buffer(5.0) for line in (union_doors.geoms if union_doors.geom_type == 'MultiLineString' else [union_doors])]
                door_zones = unary_union(door_shapes)
                dz_list = list(door_zones.geoms) if door_zones.geom_type in ['MultiPolygon', 'GeometryCollection'] else [door_zones]
                
                # Check intersections against units of this level
                level_units = [u for u in units if u['properties']['level_id'] == level_id]
                for dz in dz_list:
                    trans_dz = transform_polygon(dz)
                    intersecting_units = []
                    for u in level_units:
                        from shapely.geometry import shape
                        u_geom = shape(u['geometry'])
                        if trans_dz.intersects(u_geom):
                            intersecting_units.append(u)
                    
                    # Filtering to find valid unit connections (e.g. at least 2 distinct units, often a walkway + room)
                    if len(intersecting_units) >= 2:
                        unit_ids = [u['id'] for u in intersecting_units[:2]]
                        opening_id = str(uuid.uuid4())
                        
                        # Generate a valid LineString geometry by crossing the centroid
                        pt = trans_dz.centroid
                        door_line = LineString([(pt.x - 0.0001, pt.y - 0.0001), (pt.x + 0.0001, pt.y + 0.0001)])
                        
                        openings.append({
                            "id": opening_id,
                            "type": "Feature",
                            "feature_type": "opening",
                            "geometry": mapping(door_line),
                            "properties": {
                                "category": "pedestrian",
                                "accessibility": ["wheelchair"], # Most campus doors comply, can filter if standard fails
                                "level_id": level_id,
                                "unit_ids": unit_ids
                            }
                        })
                        
        # Amenities Extraction
        # 1. Restrooms (from Units that were classified as restrooms)
        for u in level_units:
            if u["properties"]["category"] == "restroom":
                amenity_id = str(uuid.uuid4())
                
                # Check for wheelchair accessibility using A-Flor-Tptn-Exst (partitions) as a heuristic
                # Or just assign it since campus restrooms typically are
                accessibility = ["wheelchair"] 
                
                # Create a point amenity at the centroid of the restroom unit
                from shapely.geometry import shape
                u_geom = shape(u['geometry'])
                centroid = u_geom.centroid
                
                amenities.append({
                    "id": amenity_id,
                    "type": "Feature",
                    "feature_type": "amenity",
                    "geometry": mapping(centroid),
                    "properties": {
                        "category": "restroom",
                        "accessibility": accessibility,
                        "unit_ids": [u["id"]]
                    }
                })
                
        # 2. Information and Printers (from Text labels)
        for label in labels:
            text_up = label['name'].upper()
            category = None
            if any(k in text_up for k in ["INFO", "INFORMATION", "HELP", "DESK"]):
                category = "information"
            elif any(k in text_up for k in ["PRINT", "PRINTER", "WÉPA", "WEPA", "COPIER"]):
                category = "printer"
                
            if category:
                # Find enclosing unit
                enclosing_unit_id = None
                pt = label['point']
                trans_pt = Point(transform_coords(pt.x, pt.y))
                for u in level_units:
                    if shape(u['geometry']).contains(trans_pt):
                        enclosing_unit_id = u['id']
                        break
                        
                amenity_id = str(uuid.uuid4())
                amenities.append({
                    "id": amenity_id,
                    "type": "Feature",
                    "feature_type": "amenity",
                    "geometry": mapping(trans_pt),
                    "properties": {
                        "category": category,
                        "accessibility": ["wheelchair"],
                        "name": {"en": label['name']},
                        "unit_ids": [enclosing_unit_id] if enclosing_unit_id else []
                    }
                })
                
        # Furniture Extraction (Shelving)
        furn_lines = []
        for e in msp.query('*[layer=="A-Furn-Exst"]'):
            if e.dxftype() == 'LWPOLYLINE':
                pts = [(p[0], p[1]) for p in e.get_points()]
                if len(pts) >= 2: furn_lines.append(LineString(pts))
            elif e.dxftype() == 'LINE':
                furn_lines.append(LineString([(e.dxf.start.x, e.dxf.start.y), (e.dxf.end.x, e.dxf.end.y)]))
        
        if furn_lines:
            union_furn = unary_union(furn_lines)
            furn_shapes = [line.buffer(2.0) for line in (union_furn.geoms if union_furn.geom_type == 'MultiLineString' else [union_furn] if union_furn.geom_type == 'LineString' else [])]
            if furn_shapes:
                furn_zones = unary_union(furn_shapes)
                fz_list = list(furn_zones.geoms) if furn_zones.geom_type in ['MultiPolygon', 'GeometryCollection'] else [furn_zones]
                
                for fz in fz_list:
                    trans_poly = transform_polygon(fz.convex_hull)
                    fixture_id = str(uuid.uuid4())
                    fixtures.append({
                        "id": fixture_id,
                        "type": "Feature",
                        "feature_type": "fixture",
                        "geometry": mapping(trans_poly),
                        "properties": {
                            "category": "furniture",
                            "level_id": level_id
                        }
                    })
                    level_trans_polys.append(trans_poly)
                
        # Glass Extraction
        glaz_lines = []
        for e in msp.query('*[layer=="A-Glaz-Exst"]'):
            if e.dxftype() == 'LWPOLYLINE':
                pts = [(p[0], p[1]) for p in e.get_points()]
                if len(pts) >= 2: glaz_lines.append(LineString(pts))
            elif e.dxftype() == 'LINE':
                glaz_lines.append(LineString([(e.dxf.start.x, e.dxf.start.y), (e.dxf.end.x, e.dxf.end.y)]))
                
        if glaz_lines:
            union_glaz = unary_union(glaz_lines)
            glaz_shapes = [line.buffer(2.0) for line in (union_glaz.geoms if union_glaz.geom_type == 'MultiLineString' else [union_glaz] if union_glaz.geom_type == 'LineString' else [])]
            if glaz_shapes:
                glaz_zones = unary_union(glaz_shapes)
                gz_list = list(glaz_zones.geoms) if glaz_zones.geom_type in ['MultiPolygon', 'GeometryCollection'] else [glaz_zones]
                
                for gz in gz_list:
                    trans_poly = transform_polygon(gz) # buffer is already a polygon
                    fixture_id = str(uuid.uuid4())
                    fixtures.append({
                        "id": fixture_id,
                        "type": "Feature",
                        "feature_type": "fixture",
                        "geometry": mapping(trans_poly),
                        "properties": {
                            "category": "obstruction",
                            "level_id": level_id
                        }
                    })
                    level_trans_polys.append(trans_poly)
                            
        # Level feature
        if level_trans_polys:
            level_union = unary_union(level_trans_polys)
            level_hull = level_union.convex_hull
            # Apply snapping to the hull as well
            level_hull = snap(level_hull, level_hull, 0.001)
            levels.append({
                "id": level_id,
                "type": "Feature",
                "feature_type": "level",
                "geometry": mapping(level_hull),
                "properties": {
                    "category": "unspecified",
                    "outdoor": False,
                    "ordinal": ordinal,
                    "name": { "en": f"Floor {floor_code}" },
                    "short_name": { "en": level_short_name },
                    "building_ids": [BUILDING_ID]
                }
            })
            
    # Footprint Feature & Building Feature
    if first_floor_polys:
        building_union = unary_union(first_floor_polys)
        building_hull = building_union.convex_hull
        building_hull = snap(building_hull, building_hull, 0.001)
        
        footprints.append({
            "id": FOOTPRINT_ID,
            "type": "Feature",
            "feature_type": "footprint",
            "geometry": mapping(building_hull),
            "properties": {
                "category": "ground",
                "name": { "en": "Lockwood Library Footprint" },
                "building_ids": [BUILDING_ID]
            }
        })
        
        buildings.append({
            "id": BUILDING_ID,
            "type": "Feature",
            "feature_type": "building",
            "geometry": mapping(building_hull),
            "properties": {
                "category": "unspecified",
                "name": { "en": "Lockwood Library Building" },
                "short_name": { "en": "Lockwood" },
                "display_point": mapping(building_hull.centroid),
                "address_id": ADDRESS_ID,
                "footprint_id": FOOTPRINT_ID,
                "building_ids": [BUILDING_ID]
            }
        })

    def write_geojson(filename, features):
        with open(os.path.join(export_dir, filename), 'w') as f:
            json.dump({"type": "FeatureCollection", "features": features}, f, indent=2)

    write_geojson('unit.geojson', units)
    write_geojson('level.geojson', levels)
    if openings:
        write_geojson('opening.geojson', openings)
    if amenities:
        write_geojson('amenity.geojson', amenities)
    if buildings:
        write_geojson('building.geojson', buildings)
    if footprints:
        write_geojson('footprint.geojson', footprints)
    if fixtures:
        write_geojson('fixture.geojson', fixtures)
    
    # Venue
    if venue_geom_polys:
        venue_hull = unary_union(venue_geom_polys).convex_hull
        # Apple Maps validator requires that Venue strict envelops building, which envelops footprints, which envelop units.
        venue_hull = venue_hull.buffer(0.005) # Add a small buffer to the venue to pad it 
        venue_hull = snap(venue_hull, venue_hull, 0.001)
    else:
        venue_hull = Point(anchor_lon, anchor_lat)
        
    venue = [{
        "id": VENUE_ID,
        "type": "Feature",
        "feature_type": "venue",
        "geometry": mapping(venue_hull),
        "properties": {
            "category": "university",
            "name": { "en": "University at Buffalo - Lockwood Library" },
            "display_point": mapping(venue_hull.centroid) if not venue_hull.is_empty else mapping(Point(anchor_lon, anchor_lat)),
            "address_id": ADDRESS_ID,
            "hours": "Mo-Fr 08:00-22:00",
            "phone": "+1-716-645-2814",
            "website": "http://library.buffalo.edu/"
        }
    }]
    write_geojson('venue.geojson', venue)
    
    # Address (Strict ID and no geometry)
    address = [{
        "id": ADDRESS_ID,
        "type": "Feature",
        "feature_type": "address",
        "geometry": None,
        "properties": {
            "address": "119 Lockwood Library, Buffalo, NY 14260",
            "locality": "Buffalo",
            "province": "US-NY",
            "country": "US",
            "postal_code": "14260"
        }
    }]
    write_geojson('address.geojson', address)
    
    # Manifest
    manifest = {
        "version": "1.0.0",
        "language": "en",
        "generated_by": "Wayfinder-AI"
    }
    with open(os.path.join(export_dir, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=2)

    # ZIP archive
    zip_path = '/home/purusoni/Classes/CSE453/WayfinderMain/IMDF/Lockwood_IMDF_Final.zip'
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        file_list = ['unit.geojson', 'level.geojson', 'venue.geojson', 'address.geojson', 'building.geojson', 'footprint.geojson', 'opening.geojson', 'amenity.geojson', 'fixture.geojson', 'manifest.json']
        for fname in file_list:
            file_path = os.path.join(export_dir, fname)
            if os.path.exists(file_path):
                zipf.write(file_path, arcname=fname)
                
    print(f"Successfully generated IMDF archive at {zip_path}")
    print(f"Total Units Extracted: {len(units)}")
    print(f"Total Levels Extracted: {len(levels)}")
    print(f"Total Openings Extracted: {len(openings)}")
    print(f"Total Amenities Extracted: {len(amenities)}")
    print(f"Total Buildings Extracted: {len(buildings)}")
    print(f"Total Footprints Extracted: {len(footprints)}")

if __name__ == "__main__":
    create_imdf()
