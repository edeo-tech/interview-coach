from typing import Any
from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import core_schema
from datetime import datetime, timezone

from decouple import config

ENVIRONMENT = config('ENVIRONMENT', cast=str)

# Converts the ObjectId identifier to str
class PyObjectID(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not(ObjectId.is_valid(v)):
            raise ValueError("Invalid Object")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(
        cls, 
        _source_type: Any,
        _handler: Any
    ) -> core_schema.CoreSchema:
        
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(
                        cls.validate
                    ),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )


class MongoBaseModel(BaseModel):
    id: str = Field(
        default_factory=lambda: str(ObjectId()), 
        alias="_id"
    )
    class ConfigDict:
        json_encoders = {ObjectId: str}
        populate_by_name = True
    
    async def save(self, req, collection_name):
        self.last_updated = datetime.now(
            timezone.utc
        )
        try:
            if ENVIRONMENT == 'development':
                print('Saving document with id:', self.id)
            update_result = await req.app.mongodb[
                collection_name
            ].update_one(
                {"_id": self.id}, 
                {"$set": self.model_dump(
                    exclude={'created_at'},
                    exclude_none=True, 
                    by_alias=True
                )}
            )
            if update_result.modified_count == 0:
                if ENVIRONMENT == 'development':
                    print("""
                        No document was updated. 
                        Please check if the document exists
                        and the fields to update.
                    """)
            else:
                if ENVIRONMENT == 'development':
                    print(f"""
                        Document with id {self.id} 
                        successfully updated.
                    """)
        except Exception as e:
            if ENVIRONMENT == 'development':
                print(
                    "An error occurred while saving the document:",
                    e
                )
    
    # metadata
    updated_at:datetime = Field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )
    created_at:datetime = Field(
        default_factory=lambda: datetime.now(
            timezone.utc
        )
    )
