import os
import glob
import uuid
import ezdxf
from shapely.geometry import Point, mapping, Polygon, LineString, MultiLineString
from shapely.ops import unary_union
from transform import transform_polygon, transform_coords

def extract_features(data_dir):
    dxf_files = glob.glob(os.path.join(data_dir, 'S_A350_*.dxf'))
    
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
        
        # Level ID is unique per file/floor
        level_id = str(uuid.uuid4())
        
        # 1. Extract Labels & Rich Metadata
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
                # Approximate center for standard text (simplification)
                # DXF alignment might shift actual insertion point, but bounding is complex
                # We use the raw coordinate
                if txt.dxftype() == 'TEXT':
                    pt = Point(txt.dxf.insert.x, txt.dxf.insert.y)
                else: 
                    # MTEXT
                    pt = Point(txt.dxf.insert.x, txt.dxf.insert.y)
                labels.append({"point": pt, "name": content})

        # 2. Extract Units using the correct FM-Area-* layers (matching original cad_to_imdf.py)
        level_trans_polys = []
        
        layer_categories = {
            'FM-Area-Room':      'room',
            'FM-Area-Circ':      'walkway',
            'FM-Area-Na':        'nonpublic',
            'A-Flor-Strs-Exst':  'staircase',
            'A-Flor-Evtr-Exst':  'elevator'
        }
        
        # Group all closed LWPOLYLINEs by layer once (fast)
        all_lwp = msp.query('LWPOLYLINE').groupby(dxfattrib='layer')
        
        for layer, default_category in layer_categories.items():
            for entity in all_lwp.get(layer, []):
                # Only closed polylines form rooms/spaces
                if not (entity.is_closed or (entity.dxf.flags & 1)):
                    continue
                pts = [(p[0], p[1]) for p in entity.get_points()]
                if len(pts) < 3:
                    continue
                poly = Polygon(pts)
                if not poly.is_valid:
                    continue

                room_name = None
                room_area = None
                for lbl in rich_labels:
                    if poly.contains(lbl['point']):
                        room_name = lbl['rmnumb']
                        room_area = lbl['rmarea']
                        break
                if not room_name:
                    for lbl in labels:
                        if poly.contains(lbl['point']):
                            room_name = lbl['name']
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

                trans_poly = transform_polygon(poly)
                unit_id = str(uuid.uuid4())

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
                if room_area:
                    props["alt_name"] = {"en": room_area}
                if category in ["walkway", "staircase", "elevator"]:
                    props["occupancy"] = "public"
                if category == "restroom":
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
        # Process each door entity individually so that LineString geometry
        # reflects the actual door position and orientation, not a synthetic diagonal.
        level_units = [u for u in units if u['properties']['level_id'] == level_id]
        
        from shapely.geometry import shape as shp_shape
        
        for e in msp.query('*[layer=="A-Door-Exst"]'):
            door_line_cad = None
            if e.dxftype() == 'LINE':
                p0 = (e.dxf.start.x, e.dxf.start.y)
                p1 = (e.dxf.end.x, e.dxf.end.y)
                if p0 != p1:
                    door_line_cad = (p0, p1)
            elif e.dxftype() == 'LWPOLYLINE':
                pts = [(p[0], p[1]) for p in e.get_points()]
                if len(pts) >= 2:
                    door_line_cad = (pts[0], pts[-1])
            
            if door_line_cad is None:
                continue
            
            # Only use short per-door segments (skip lines longer than ~500 CAD units;
            # those are likely reference lines, not actual door panels)
            try:
                cad_line = LineString(door_line_cad)
                if cad_line.length > 500:
                    continue
                search_zone = cad_line.buffer(8.0)
                trans_zone = transform_polygon(search_zone)
                
                touching = []
                for u in level_units:
                    if trans_zone.intersects(shp_shape(u['geometry'])):
                        touching.append(u)
                
                if len(touching) >= 2:
                    # Transform the actual door endpoints to GPS
                    gps_p0 = transform_coords(*door_line_cad[0])
                    gps_p1 = transform_coords(*door_line_cad[1])
                    if gps_p0 == gps_p1:
                        continue
                    door_line_gps = LineString([gps_p0, gps_p1])
                    
                    openings.append({
                        "id": str(uuid.uuid4()),
                        "type": "Feature",
                        "feature_type": "opening",
                        "geometry": mapping(door_line_gps),
                        "properties": {
                            "category": "pedestrian",
                            "accessibility": ["wheelchair"],
                            "level_id": level_id,
                            "unit_ids": [u['id'] for u in touching[:2]]
                        }
                    })
            except Exception:
                continue
                        
        # Amenities Extraction
        for u in level_units:
            if u["properties"]["category"] == "restroom":
                amenity_id = str(uuid.uuid4())
                accessibility = ["wheelchair"] 
                
                from shapely.geometry import shape
                u_geom = shape(u['geometry'])
                pt = u_geom.centroid
                
                amenities.append({
                    "id": amenity_id,
                    "type": "Feature",
                    "feature_type": "amenity",
                    "geometry": mapping(pt),
                    "properties": {
                        "category": "restroom",
                        "accessibility": accessibility,
                        "name": u["properties"].get("name", {"en": "Restroom"}),
                        "unit_ids": [u["id"]]
                    }
                })

        for lbl in labels:
            txt_up = lbl['name'].upper()
            category = None
            if any(k in txt_up for k in ["INFO", "INFORMATION", "DESK", "CIRCULATION", "REFERENCE"]):
                category = "information"
            elif any(k in txt_up for k in ["PRINT", "PRINTER", "WÉPA", "WEPA", "COPIER"]):
                category = "copier"
            
            if category:
                pt_cad = lbl['point']
                trans_pt = Point(transform_coords(pt_cad.x, pt_cad.y))
                
                # Find which unit polygon spatially contains this label (in CAD space)
                containing_unit_ids = []
                for u in level_units:
                    u_geom = shp_shape(u['geometry'])
                    if u_geom.contains(trans_pt):
                        containing_unit_ids.append(u['id'])
                        break
                
                # Fallback: find nearest unit if none contains it
                if not containing_unit_ids:
                    best, best_dist = None, float('inf')
                    for u in level_units:
                        d = shp_shape(u['geometry']).distance(trans_pt)
                        if d < best_dist:
                            best_dist, best = d, u['id']
                    if best:
                        containing_unit_ids = [best]
                
                amenities.append({
                    "id": str(uuid.uuid4()),
                    "type": "Feature",
                    "feature_type": "amenity",
                    "geometry": mapping(trans_pt),
                    "properties": {
                        "category": category,
                        "name": {"en": lbl['name']},
                        "level_ids": [level_id],
                        "unit_ids": containing_unit_ids if containing_unit_ids else None
                    }
                })

        # Furniture Stacks Extraction -> Fixtures
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
                
        # Glass Extraction -> Fixtures
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

        # Level Feature
        if level_trans_polys:
            level_union = unary_union(level_trans_polys)
            level_hull = level_union.convex_hull
            # No snap needed for level polygon 
            
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
                    "short_name": { "en": level_short_name }
                } # building_ids added later in export
            })
            
    return {
        "units": units,
        "levels": levels,
        "openings": openings,
        "amenities": amenities,
        "fixtures": fixtures,
        "first_floor_polys": first_floor_polys,
        "venue_geom_polys": venue_geom_polys
    }
