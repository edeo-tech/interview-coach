from fastapi import APIRouter, Depends, Request, HTTPException
from authentication import Authorization
from crud.flight_poll.poll_flights import get_nearby_flights_for_location, scheduled_poll_all_users
from crud.users.auth.users import get_user_by_id
from utils.discord.flights import format_message

router = APIRouter()
auth = Authorization()

@router.post('/poll-user')
async def poll_user_flights(req: Request, user_id: str = Depends(auth.auth_wrapper)):
    user = await get_user_by_id(req, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    lat = getattr(user, 'last_lat', None)
    lon = getattr(user, 'last_long', None)
    username = getattr(user, 'username', None)
    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail='User location not set')
    flights = get_nearby_flights_for_location(lat, lon)
    for flight in flights:
        format_message(flight, username)
    return {'message': f'Sent {len(flights)} flights for user {username} to Discord.'}

@router.post('/poll-all')
async def poll_all_users(req: Request, user_id: str = Depends(auth.auth_wrapper)):
    scheduled_poll_all_users(req)
    return {'message': 'Polled all users and sent flights to Discord.'}
