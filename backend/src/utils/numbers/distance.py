from math import radians, sin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    """
    Return distance in kilometers between two lat/lon points.
    Args:
        lat1, lon1: Latitude and longitude of point 1 (float)
        lat2, lon2: Latitude and longitude of point 2 (float)
    Returns:
        Distance in kilometers (float)
    """
    R = 6371.0  # Earth radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c
