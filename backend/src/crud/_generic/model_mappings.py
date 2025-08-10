from models.auth.refresh import RefreshToken
from models.users.users import User

CollectionModelMatch = {
    'refresh_tokens': RefreshToken,
    'users': User
}
