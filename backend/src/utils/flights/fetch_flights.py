import requests
from src.utils.numbers.distance import haversine

def fetch_flights_near_location(lat, lon, radius_km, token):
    """
    Fetch flights near the given lat/lon within radius_km using OpenSky API.
    Args:
        lat (float): Latitude of center point
        lon (float): Longitude of center point
        radius_km (float): Search radius in kilometers
        token (str): OpenSky API access token
    Returns:
        List[dict]: List of flights (callsign, icao24, lat, lon, alt)
    """
    url = "https://opensky-network.org/api/states/all"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    states = resp.json().get("states", [])
    nearby = []
    for s in states:
        callsign = (s[1] or "").strip()
        flight_lat, flight_lon, alt = s[6], s[5], s[7]
        if not (callsign and flight_lat and flight_lon):
            continue
        if haversine(lat, lon, flight_lat, flight_lon) <= radius_km:
            nearby.append({
                "callsign": callsign,
                "icao24": s[0],
                "lat": flight_lat,
                "lon": flight_lon,
                "alt": alt
            })
    return nearby
