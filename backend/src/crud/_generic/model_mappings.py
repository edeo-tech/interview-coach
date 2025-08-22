from models.auth.refresh import RefreshToken
from models.users.users import User
from models.interviews.cv_profile import CVProfile
from models.interviews.interviews import Interview
from models.interviews.attempts import InterviewAttempt, InterviewFeedback
from models.jobs import Job

CollectionModelMatch = {
    'refresh_tokens': RefreshToken,
    'users': User,
    'cv_profiles': CVProfile,
    'jobs': Job,
    'interviews': Interview,
    'interview_attempts': InterviewAttempt,
    'interview_feedback': InterviewFeedback,
}

# Reverse mapping from model to collection name
ModelCollectionMatch = {model: collection for collection, model in CollectionModelMatch.items()}

def get_db_for_model(app, model_class):
    """
    Get the MongoDB collection for a given model class.
    
    Args:
        app: FastAPI app instance with mongodb attribute
        model_class: The model class to get the collection for
        
    Returns:
        The MongoDB collection for the model
    """
    collection_name = ModelCollectionMatch.get(model_class)
    if not collection_name:
        raise ValueError(f"No collection mapping found for model {model_class.__name__}")
    
    return app.mongodb[collection_name]
