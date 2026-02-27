import math
from shapely.geometry import Polygon
from shapely.ops import snap
from shapely.validation import make_valid

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
