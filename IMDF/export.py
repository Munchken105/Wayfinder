import os
import json
import zipfile
import uuid
from shapely.geometry import mapping, Point
from shapely.ops import unary_union, snap
from transform import anchor_lon, anchor_lat

def export_imdf(data_dict, export_dir, zip_path):
    os.makedirs(export_dir, exist_ok=True)
    
    VENUE_ID = str(uuid.uuid4())
    ADDRESS_ID = str(uuid.uuid4())
    BUILDING_ID = str(uuid.uuid4())
    FOOTPRINT_ID = str(uuid.uuid4())
    
    # Associate building ids down to levels
    for lvl in data_dict.get("levels", []):
        lvl["properties"]["building_ids"] = [BUILDING_ID]
        
    # Footprint Feature & Building Feature
    footprints = []
    buildings = []
    first_floor_polys = data_dict.get("first_floor_polys", [])
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

    write_geojson('unit.geojson', data_dict.get("units", []))
    write_geojson('level.geojson', data_dict.get("levels", []))
    if data_dict.get("openings"):
        write_geojson('opening.geojson', data_dict.get("openings"))
    if data_dict.get("amenities"):
        write_geojson('amenity.geojson', data_dict.get("amenities"))
    if buildings:
        write_geojson('building.geojson', buildings)
    if footprints:
        write_geojson('footprint.geojson', footprints)
    if data_dict.get("fixtures"):
        write_geojson('fixture.geojson', data_dict.get("fixtures"))
    
    # Venue
    venue_geom_polys = data_dict.get("venue_geom_polys", [])
    if venue_geom_polys:
        venue_hull = unary_union(venue_geom_polys).convex_hull
        # Apple Maps validator requires that Venue strictly envelops building, which envelops footprints, which envelop units.
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
    
    # Address
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
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        file_list = ['unit.geojson', 'level.geojson', 'venue.geojson', 'address.geojson', 'building.geojson', 'footprint.geojson', 'opening.geojson', 'amenity.geojson', 'fixture.geojson', 'manifest.json']
        for fname in file_list:
            file_path = os.path.join(export_dir, fname)
            if os.path.exists(file_path):
                zipf.write(file_path, arcname=fname)
                
    print(f"Successfully generated IMDF archive at {zip_path}")
    print(f"Total Units Extracted: {len(data_dict.get('units', []))}")
    print(f"Total Levels Extracted: {len(data_dict.get('levels', []))}")
    print(f"Total Openings Extracted: {len(data_dict.get('openings', []))}")
    print(f"Total Amenities Extracted: {len(data_dict.get('amenities', []))}")
    print(f"Total Fixtures Extracted: {len(data_dict.get('fixtures', []))}")
    print(f"Total Buildings Extracted: {len(buildings)}")
    print(f"Total Footprints Extracted: {len(footprints)}")
