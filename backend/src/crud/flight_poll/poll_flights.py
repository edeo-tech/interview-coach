from fastapi import Request
from models.users.users import User

from src.utils.discord.flights import format_message
from src.crud._generic import _db_actions

# Placeholder for fetching flights from OpenSky or similar
from src.utils.flights.fetch_flights import fetch_flights_near_location

# --- Core Logic ---

def get_nearby_flights_for_location(lat, lon, radius_km=1.66):
    """
    Fetch flights near a given lat/lon within radius_km.
    Returns a list of flight dicts.
    """
    return fetch_flights_near_location(lat, lon, radius_km)


def batch_poll_users(users, radius_km=1.66, location_precision=0.1):
    """
    For a list of users (with lat/lon), deduplicate by location (rounded to location_precision),
    fetch flights for each unique location, and map results back to users.
    Returns: {user_id: [flights]}
    """
    from collections import defaultdict
    loc_map = defaultdict(list)
    for user in users:
        if user['lat'] is not None and user['lon'] is not None:
            key = (round(user['lat']/location_precision)*location_precision,
                   round(user['lon']/location_precision)*location_precision)
            loc_map[key].append(user)
    # Fetch flights for each unique location
    flights_by_loc = {}
    for loc in loc_map:
        flights_by_loc[loc] = get_nearby_flights_for_location(loc[0], loc[1], radius_km)
    # Map flights back to users
    user_flights = {}
    for loc, users_at_loc in loc_map.items():
        flights = flights_by_loc[loc]
        for user in users_at_loc:
            user_flights[user['id']] = flights
    return user_flights


def scheduled_poll_all_users(req:Request):
    """
    Fetch all users, poll for nearby flights, and send Discord notifications.
    """
    users = _db_actions.getMultipleDocuments(
        req=req,
        collection_name='users',
        BaseModel=User,
        is_banned=False
    )
    user_flights = batch_poll_users(users)
    for user in users:
        flights = user_flights.get(user['id'], [])
        if flights:
            for flight in flights:
                format_message(flight, user['username'])
