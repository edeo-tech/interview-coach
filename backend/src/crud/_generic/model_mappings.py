from models.auth.refresh import RefreshToken
from models.users.users import User
from models.interviews.cv_profile import CVProfile
from models.interviews.interviews import Interview
from models.interviews.attempts import InterviewAttempt, InterviewFeedback

CollectionModelMatch = {
    'refresh_tokens': RefreshToken,
    'users': User,
    'cv_profiles': CVProfile,
    'interviews': Interview,
    'interview_attempts': InterviewAttempt,
    'interview_feedback': InterviewFeedback,
}
