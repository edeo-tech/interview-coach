from models._base import MongoBaseModel
from typing import Optional
from datetime import datetime, timezone


class CompanyInfo(MongoBaseModel):
    normalized_name: str
    domain: Optional[str] = None
    brandfetch_identifier_type: str  # "domain" or "brandId"
    brandfetch_identifier_value: str
    match_confidence: float
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)