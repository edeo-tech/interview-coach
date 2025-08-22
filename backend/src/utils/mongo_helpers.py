from bson import ObjectId
from typing import Any, Dict, Union

def exclude_created_at(update_dict: dict) -> dict:
    """
    Returns a copy of the update_dict with 'created_at' removed, if present.
    This ensures 'created_at' is never updated in MongoDB update operations.
    """
    if not isinstance(update_dict, dict):
        raise ValueError("update_dict must be a dictionary")
    return {k: v for k, v in update_dict.items() if k != 'created_at'}

def serialize_mongo_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Serialize a MongoDB document by converting ObjectId to string
    and handling other MongoDB-specific data types.
    
    Args:
        doc: MongoDB document dictionary
        
    Returns:
        Serialized document with ObjectId converted to string
    """
    if not isinstance(doc, dict):
        return doc
    
    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, dict):
            serialized[key] = serialize_mongo_document(value)
        elif isinstance(value, list):
            serialized[key] = [
                serialize_mongo_document(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            serialized[key] = value
    
    return serialized 