def exclude_created_at(update_dict: dict) -> dict:
    """
    Returns a copy of the update_dict with 'created_at' removed, if present.
    This ensures 'created_at' is never updated in MongoDB update operations.
    """
    if not isinstance(update_dict, dict):
        raise ValueError("update_dict must be a dictionary")
    return {k: v for k, v in update_dict.items() if k != 'created_at'} 