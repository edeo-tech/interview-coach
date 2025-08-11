from fastapi import Request
from typing import Optional
from enum import Enum
from decouple import config

from datetime import datetime, timezone

from models._base import MongoBaseModel

from utils.__errors__custom_exception import CustomException
from utils.mongo_helpers import exclude_created_at
error_path = "crud/_generic"

ENVIRONMENT = config('ENVIRONMENT', cast=str)

class SortDirection(str, Enum):
    ASCENDING = 'ascending'
    DESCENDING = 'descending'

# Create Operations
async def createDocument(
        req:Request,
        collection_name:str,
        BaseModel:MongoBaseModel,
        new_document:MongoBaseModel
) -> MongoBaseModel:
    
    from crud._generic.model_mappings import CollectionModelMatch
    
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""Collection name has not been set up to
                use generic crud functions - create failed""",
            custom_error_path=error_path,
            custom_error_file_name="create_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "new_document": new_document
            }
        )
    
    if not isinstance(
        new_document, 
        CollectionModelMatch[collection_name]
    ):
        raise CustomException(
            message="""
                Document is not of the correct
                type for the collection
            """,
            custom_error_path=error_path,
            custom_error_file_name="create_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "new_document": new_document
            }
        )
    
    async def embeddedCreateDocument(
            req:Request,
            collection_name:str,
            new_document:BaseModel
    ) -> BaseModel:
        created_document = await req.app.mongodb[collection_name].insert_one(
            new_document.model_dump(by_alias=True, exclude_none=True)
        )
        document = await req.app.mongodb[collection_name].find_one({
            '_id': created_document.inserted_id
        })
        return BaseModel(**document) if document is not None else None
        
    return await embeddedCreateDocument(req, collection_name, new_document)



async def createMultipleDocuments(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    new_documents:list[MongoBaseModel]
) -> list[MongoBaseModel]:
    
    from crud._generic.model_mappings import CollectionModelMatch
    for new_document in new_documents:
        if collection_name not in CollectionModelMatch:
            raise CustomException(
                message="""
                    Collection name has not been set up to
                    use generic crud functions - create multiple failed
                """,
                custom_error_path=error_path,
                custom_error_file_name="create_failed.txt",
                extra_error_info={
                    "collection_name": collection_name,
                    "BaseModel": BaseModel.__name__,
                    "new_document": new_document
                }
            )
        
        if not isinstance(
            new_document,
            CollectionModelMatch[collection_name]
        ):
            raise CustomException(
                message="""
                    One of the documents passed is not of the
                    correct type for the collection - create multiple failed
                """,
                custom_error_path=error_path,
                custom_error_file_name="create_failed.txt",
                extra_error_info={
                    "collection_name": collection_name,
                    "BaseModel": BaseModel.__name__,
                    "new_document": new_document
                }
            )
        
    async def embeddedCreateMultipleDocuments(
        req:Request,
        collection_name:str,
        BaseModel:MongoBaseModel,
        new_documents:list[BaseModel]
    ) -> list[BaseModel]:
        
        created_documents = await req.app.mongodb[collection_name].insert_many(
            [ document.model_dump(
                by_alias=True,
                exclude_none=True
            ) for document in new_documents ]
        )

        documents = await req.app.mongodb[collection_name].find({
            '_id': {'$in': created_documents.inserted_ids}
        }).to_list(length=None)
        
        return [BaseModel(**document) for document in documents] if documents else []
    
    return await embeddedCreateMultipleDocuments(
        req,
        collection_name,
        BaseModel,
        new_documents
    )





# Get Operations

async def getDocument(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    **kwargs
) -> MongoBaseModel | None:
    
    from crud._generic.model_mappings import CollectionModelMatch
    
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message=f"""
                Collection name {collection_name} has not 
                been set up to use generic crud 
                functions - get failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )
    
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - get failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )
    
    query = {}
    # Handle direct model fields
    for field_name, field in BaseModel.model_fields.items():
        param_value = kwargs.get(field.alias, kwargs.get(field_name))
        if param_value is not None:
            query[field.alias if field.alias else field_name] = param_value
            
    # Handle embedded fields with double underscore notation
    for key, value in kwargs.items():
        if "__" in key and key not in query:
            # Convert double underscores to dots for MongoDB query
            mongo_key = key.replace("__", ".")
            query[mongo_key] = value
            
    if not query:
        raise CustomException(
            message="None or invalid query parameters provided - get failed",
            custom_error_path=error_path,
            custom_error_file_name="get_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs,
                "query": query
            }
        )

    document = await req.app.mongodb[collection_name].find_one(query)

    if collection_name == "users":
        return BaseModel.model_construct(**document) if document else None
    return BaseModel(**document) if document else None



async def getMultipleDocuments(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    order_by:Optional[str] = None,
    order_direction:Optional[SortDirection] = SortDirection.DESCENDING,
    limit:Optional[int] = 0,
    skip:Optional[int] = 0,
    sorting:Optional[bool] = True,
    ProjectionModel:Optional[MongoBaseModel] = None,
    **kwargs
) -> list[MongoBaseModel]:
    from crud._generic.model_mappings import CollectionModelMatch
    
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - get_multiple failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "order_by": order_by,
                "order_direction": order_direction,
                "limit": limit,
                "skip": skip,
                "query_parameters": kwargs
            }
        )
    
    if not issubclass(
        BaseModel, 
        CollectionModelMatch[collection_name]
    ):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - get_multiple failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "order_by": order_by,
                "order_direction": order_direction,
                "limit": limit,
                "skip": skip,
                "query_parameters": kwargs
            }
        )
    
    query = {}
    # Handle direct model fields
    for field_name, field in BaseModel.model_fields.items():
        param_value = kwargs.get(field.alias, kwargs.get(field_name))
        if param_value is not None:
            query[field.alias if field.alias else field_name] = param_value
    
    # Handle embedded fields with double underscore notation
    for key, value in kwargs.items():
        if "__" in key and key not in query:
            # Convert double underscores to dots for MongoDB query
            mongo_key = key.replace("__", ".")
            query[mongo_key] = value

    if not query:
        raise CustomException(
            message="""
                None or invalid query parameters provided. 
                If you wish to query all documents, use the
                getAllDocuments crud function.
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_multiple_failed.txt",

            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "kwargs": kwargs,
                "query": query,
                "order_by": order_by,
                "order_direction": order_direction,
                "limit": limit,
                "skip": skip
            }
        )
    
    projection = {}
    if ProjectionModel:
        for field_name, field in ProjectionModel.model_fields.items():
            field_key = field.alias if field.alias else field_name
            projection[field_key] = 1
        if '_id' not in projection:
            projection['_id'] = 1

    # Sorting
    sort_field = order_by if order_by else 'created_at'
    sort_direction = -1 if order_direction == SortDirection.DESCENDING else 1

    # Define the primary sort criteria
    sort_criteria = [(sort_field, sort_direction)]
    
    # Add secondary sort only if the primary sort 
    # field is different from 'created_at'
    if sort_field != 'created_at':
        sort_criteria.append(('created_at', 1))

    # Apply sorting, pagination, and convert to list
    if sorting:
        documents = await req.app.mongodb[collection_name].find(
            query,
            projection=projection
        ).sort(sort_criteria).limit(limit).skip(skip).to_list(length=None)
    else:
        documents = await req.app.mongodb[collection_name].find(
            query,
            projection=projection
        ).to_list(length=None)
    
    if collection_name == "users":
        if ProjectionModel:
            return [ProjectionModel(
                **document
            ) for document in documents] if documents else []
        
        return [BaseModel.model_construct(
            **document
        ) for document in documents] if documents else []

    if ProjectionModel:
        return [ProjectionModel(
            **document
        ) for document in documents] if documents else []

    return [BaseModel(
        **document
    ) for document in documents] if documents else []



async def getAllDocuments(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    order_by:Optional[str] = None,
    order_direction:Optional[SortDirection] = SortDirection.DESCENDING,
    limit:Optional[int] = 0,
) -> list[MongoBaseModel]:
    
    from crud._generic.model_mappings import CollectionModelMatch
    
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - get all failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_all_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "order_by": order_by,
                "order_direction": order_direction,
                "limit": limit
            }
        )
    
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - get all failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="get_all_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "order_by": order_by,
                "order_direction": order_direction,
                "limit": limit
            }
        )

    # sorting
    sort_field = order_by if order_by else 'created_at'
    sort_direction = -1 if order_direction == SortDirection.DESCENDING else 1

    # Define the primary sort criteria
    sort_criteria = [(sort_field, sort_direction)]

    # Add secondary sort only if the primary sort field is different from 'created_at'
    if sort_field != 'created_at':
        sort_criteria.append(('created_at', 1))
    

    
    # Apply sorting, pagination, and convert to list
    documents = await req.app.mongodb[collection_name].find({}).sort(
        sort_criteria
    ).limit(limit).to_list(length=None)

    if collection_name == "users":
        return [BaseModel.model_construct(
            **document
        ) for document in documents] if documents else []

    return [BaseModel(
        **document
    ) for document in documents] if documents else []

async def batchGetDocuments(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    document_ids:list[str],
    order_by:Optional[str] = None,
    order_direction:Optional[SortDirection] = SortDirection.DESCENDING,
    limit:Optional[int] = 0,
    skip:Optional[int] = 0,
    **additional_filters
) -> list[MongoBaseModel]:
    
    from crud._generic.model_mappings import CollectionModelMatch

    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - update failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_ids": document_ids
            }
        )
    
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - batch get failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="batch_get_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_ids": document_ids
            }
        )
    
    # Sorting
    sort_field = order_by if order_by else 'created_at'
    sort_direction = -1 if order_direction == SortDirection.DESCENDING else 1

    # Define the primary sort criteria
    sort_criteria = [(sort_field, sort_direction)]
    
    # Add secondary sort only if the primary sort field is different from 'created_at'
    if sort_field != 'created_at':
        sort_criteria.append(('created_at', 1))
    
    # Create a query that combines document IDs with any additional filters
    query = {'_id': {'$in': document_ids}}
    
    # Add any additional filters to the query
    if additional_filters:
        query.update(additional_filters)
    
    documents = await req.app.mongodb[collection_name].find(query).sort(
        sort_criteria).limit(limit).skip(skip).to_list(length=None)

    if collection_name == "users":
        return [BaseModel.model_construct(
            **document
        ) for document in documents] if documents else []

    return [BaseModel(
        **document
    ) for document in documents] if documents else []

# Counting Operations

async def countDocuments(
    req: Request,
    collection_name: str,
    BaseModel: MongoBaseModel,
    **kwargs
) -> int:
    """
    Counts the number of documents in a given collection
    that match the provided query parameters (based on BaseModel fields).
    """
    from crud._generic.model_mappings import CollectionModelMatch

    # Ensure the collection is supported
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - count failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="count_documents_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # Ensure the BaseModel matches the collection
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - count failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="count_documents_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # Build the query from the fields defined in the BaseModel
    query = {}    
    # Handle direct model fields
    for field_name, field in BaseModel.model_fields.items():
        if field_name in kwargs:
            query[field.alias if field.alias else field_name] = kwargs[field_name]
            
    # Handle embedded fields with double underscore notation
    for key, value in kwargs.items():
        if "__" in key and key not in query:
            # Convert double underscores to dots for MongoDB query
            mongo_key = key.replace("__", ".")
            query[mongo_key] = value

    # If no valid query parameters are provided, 
    # instruct user to call countAllDocuments
    if not query:
        raise CustomException(
            message="""
                None or invalid query parameters provided. If you wish
                to count all documents, use the countAllDocuments function.
            """,
            custom_error_path=error_path,
            custom_error_file_name="count_documents_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # Perform the count
    return await req.app.mongodb[collection_name].count_documents(query)


async def countAllDocuments(
    req: Request,
    collection_name: str,
    BaseModel: MongoBaseModel
) -> int:
    """
    Counts the total number of all documents in a given collection.
    """
    from crud._generic.model_mappings import CollectionModelMatch

    # Ensure the collection is supported
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - count all failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="count_all_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__
            }
        )

    # Ensure the BaseModel matches the collection
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - count all failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="count_all_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__
            }
        )

    # Count all documents with an empty query {}
    return await req.app.mongodb[collection_name].count_documents({})





# Update Operations

async def updateDocument(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    document_id:str,
    raw_update:Optional[dict] = None,
    **kwargs
) -> MongoBaseModel:
    
    from crud._generic.model_mappings import CollectionModelMatch
    import pydantic

    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - update failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_id": document_id,
                "query_parameters": kwargs
            }
        )
    
    if not issubclass(
        BaseModel,
        CollectionModelMatch[collection_name]
    ):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - update failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_id": document_id,
                "query_parameters": kwargs
            }
        )
    
    existing_document = await getDocument(
        req,
        collection_name,
        BaseModel,
        _id=document_id
    )

    if not existing_document:
        return None
    
    # Create a simulated document to validate after updates
    simulated_document_dict = existing_document.model_dump()
    
    if raw_update:
        update_clause = raw_update
        update_clause.setdefault("$set", {})
        update_clause["$set"]["updated_at"] = datetime.now(
            timezone.utc
        )
        # Exclude created_at from $set
        update_clause["$set"] = exclude_created_at(update_clause["$set"])
        
        # Apply simulated updates for validation
        for operation, fields in update_clause.items():
            if operation == "$set":
                # Direct field updates
                for field, value in fields.items():
                    if field in simulated_document_dict:
                        simulated_document_dict[field] = value
            elif operation == "$inc":
                # Increment operations
                for field, value in fields.items():
                    if field in simulated_document_dict:
                        simulated_document_dict[field] += value
            # Add other MongoDB update operators as needed
    else:
        # Create the update data from kwargs
        update_data = {}
        # Remove the _id field from the update data
        kwargs.pop('_id', None)
        for field_name, field in BaseModel.model_fields.items():
            param_value = kwargs.get(field.alias, kwargs.get(field_name))
            if param_value is not None:
                field_key = field.alias if field.alias else field_name
                update_data[field_key] = param_value
                # Also update the simulated document
                simulated_document_dict[field_key] = param_value
    
        update_data['updated_at'] = datetime.now(timezone.utc)
        simulated_document_dict['updated_at'] = update_data['updated_at']

        # Exclude created_at from update_data
        update_data = exclude_created_at(update_data)

        update_clause = {
            '$set': update_data
        }
    
    # Validate the simulated document against Pydantic constraints
    try:
        # Create a new instance with the updated values to trigger validation
        BaseModel(**simulated_document_dict)
    except pydantic.ValidationError as e:
        # Extract validation errors to provide helpful feedback
        error_fields = {}
        for error in e.errors():
            field = error["loc"][0]
            message = error["msg"]
            error_fields[field] = message
        
        raise CustomException(
            message=f"""
                Update operation would violate field constraints.
                Field validations failed: {error_fields}
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_validation_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "document_id": document_id,
                "update_clause": update_clause,
                "validation_errors": error_fields
            }
        )
    
    # Update the document
    await req.app.mongodb[collection_name].update_one(
        { '_id': document_id },
        update_clause
    )

    
    # Return the updated document
    return await getDocument(
        req,
        collection_name,
        BaseModel,
        _id=document_id
    )



async def updateMultipleDocuments(
    req: Request,
    collection_name: str,
    BaseModel: MongoBaseModel,
    filter_kwargs: dict,
    update_fields: dict
) -> list[MongoBaseModel]:
    """
    Updates multiple documents in the given 
    collection that match the filter criteria.
    Validates that the updates would not violate Pydantic field constraints.
    
    Parameters:
        req (Request): The FastAPI request object.
        collection_name (str): The name of the collection.
        BaseModel (MongoBaseModel): The base model for the collection.
        filter_kwargs (dict): Keyword arguments to 
                                build the query filter.
        update_fields (dict): New values for the 
                                document fields to update.
        
    Returns:
        list[MongoBaseModel]: A list of updated documents.
        
    Raises:
        CustomException: When the collection is not supported,
                         when the BaseModel is not of the correct type,
                         when no valid filter criteria are provided/found,
                         or when the update would violate field constraints.
    """
    from crud._generic.model_mappings import CollectionModelMatch
    import pydantic

    # Ensure the collection is supported
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic CRUD functions - update multiple failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "filter_kwargs": filter_kwargs,
                "update_fields": update_fields
            }
        )
    
    # Ensure the BaseModel matches the collection
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - update multiple failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "filter_kwargs": filter_kwargs,
                "update_fields": update_fields
            }
        )
    
    # Build the query from the fields defined in 
    # the BaseModel using filter_kwargs
    query = {}
    for field_name, field in BaseModel.model_fields.items():
        param_value = filter_kwargs.get(
            field.alias, 
            filter_kwargs.get(field_name)
        )
        if param_value is not None:
            query[field.alias if field.alias else field_name] = param_value
            
    if not query:
        raise CustomException(
            message="""
                None or invalid filter parameters provided - 
                update multiple failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "filter_kwargs": filter_kwargs,
                "update_fields": update_fields
            }
        )
    
    # Retrieve the documents that match the filter
    existing_documents = await req.app.mongodb[collection_name].find(
        query
    ).to_list(length=None)
    
    if not existing_documents:
        return []
    
    # Extract the document ids to ensure we update exactly these documents
    document_ids = [doc['_id'] for doc in existing_documents]
    
    # Prepare the update data (exclude _id and include only valid fields)
    update_fields.pop('_id', None)
    valid_update_data = {}
    for field_name, field in BaseModel.model_fields.items():
        param_value = update_fields.get(
            field.alias, 
            update_fields.get(field_name)
        )
        if param_value is not None:
            valid_update_data[
                field.alias if field.alias else field_name
            ] = param_value
            
    valid_update_data['updated_at'] = datetime.now(timezone.utc)
    # Exclude created_at from valid_update_data
    valid_update_data = exclude_created_at(valid_update_data)
    
    # Validate each document against Pydantic constraints after simulated updates
    validation_failures = []
    
    for doc in existing_documents:
        # Create a copy of the document for simulation
        simulated_doc = dict(doc)
        
        # Apply updates to the simulated document
        for field, value in valid_update_data.items():
            simulated_doc[field] = value
            
        try:
            # Validate against the model
            BaseModel(**simulated_doc)
        except pydantic.ValidationError as e:
            # Collect validation errors
            error_fields = {}
            for error in e.errors():
                field = error["loc"][0]
                message = error["msg"]
                error_fields[field] = message
                
            validation_failures.append({
                "document_id": doc["_id"],
                "validation_errors": error_fields
            })
    
    # If there are validation failures, raise an exception
    if validation_failures:
        raise CustomException(
            message=f"""
                Update operation would violate field constraints for {len(validation_failures)} document(s).
                Sample errors: {validation_failures[0]['validation_errors']}
            """,
            custom_error_path=error_path,
            custom_error_file_name="update_multiple_validation_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "update_fields": valid_update_data,
                "validation_failures": validation_failures
            }
        )
    
    # Update the documents using update_many
    await req.app.mongodb[collection_name].update_many(
        {'_id': {'$in': document_ids}},
        {'$set': valid_update_data}
    )
    
    # Retrieve and return the updated documents using batchGetDocuments
    updated_documents = await batchGetDocuments(
        req,
        collection_name,
        BaseModel,
        document_ids,
        order_by='created_at',
        order_direction=SortDirection.DESCENDING,
        limit=0,
        skip=0
    )
    
    return updated_documents



async def incrementDocumentField(
    req:Request,
    collection_name:str,
    BaseModel:MongoBaseModel,
    document_id:str,
    field_name:str,
    increment_by:int | float = 1,
    document:Optional[MongoBaseModel] = None
) -> MongoBaseModel:
    """
    Increments a specific field in a document by the given value,
    ensuring that field constraints are respected.
    
    Parameters:
        req (Request): The FastAPI request object.
        collection_name (str): The name of the collection.
        BaseModel (MongoBaseModel): The base model for the collection.
        document_id (str): The ID of the document to update.
        field_name (str): The name of the field to increment.
        increment_by (int | float): The amount to increment the field by.
        
    Returns:
        MongoBaseModel: The updated document.
        
    Raises:
        CustomException: When the collection is not supported,
                         when the BaseModel is not of the correct type,
                         when the field doesn't exist, when the document doesn't exist,
                         or when the increment would violate field constraints.
    """
    from crud._generic.model_mappings import CollectionModelMatch
    import pydantic
    from pymongo import ReturnDocument
    
    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to
                use generic crud functions - increment failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="increment_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_id": document_id,
                "field_name": field_name,
                "increment_by": increment_by
            }
        )
    
    if not issubclass(
        BaseModel, 
        CollectionModelMatch[collection_name]
    ):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - increment failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="increment_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_id": document_id,
                "field_name": field_name,
                "increment_by": increment_by
            }
        )

    # Ensure the field to increment is valid on this model.
    # If the user can provide either the canonical field name or the alias,
    # check if it matches a model field and retrieve the stored field name/alias.
    valid_field = None
    for model_field_name, field_def in BaseModel.model_fields.items():
        possible_keys = {model_field_name}
        if field_def.alias:
            possible_keys.add(field_def.alias)

        if field_name in possible_keys:
            # Use the alias if it exists, otherwise the regular field name
            valid_field = field_def.alias if field_def.alias else model_field_name
            break

    if not valid_field:
        raise CustomException(
            message=f"Field '{field_name}' does not exist on the model.",
            custom_error_path="crud/_generic",
            custom_error_file_name="increment_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "document_id": document_id,
                "field_name": field_name,
                "increment_by": increment_by
            }
        )

    # First, get the document to validate constraints without updating it yet
    if not document:
        document = await req.app.mongodb[collection_name].find_one(
            {'_id': document_id}
        )
    
    if not document:
        return None
    
    
    # Apply increment to the simulated document
    if field_name in document:
        document[field_name] += increment_by
    
    # Try to validate the simulated document with the field increment applied
    try:
        # Create a new instance with the updated values to trigger validation
        BaseModel(**document)
    except pydantic.ValidationError as e:
        # Extract validation errors to provide helpful feedback
        error_fields = {}
        for error in e.errors():
            field = error["loc"][0]
            message = error["msg"]
            error_fields[field] = message
        
        raise CustomException(
            message=f"""
                Increment operation would violate field constraints.
                Field validations failed: {error_fields}
            """,
            custom_error_path=error_path,
            custom_error_file_name="increment_field_validation_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "document_id": document_id,
                "field_name": field_name,
                "increment_by": increment_by,
                "validation_errors": error_fields
            }
        )

    # Perform the update and get the updated document in one operation
    updated_doc = await req.app.mongodb[collection_name].find_one_and_update(
        {'_id': document_id},
        {
            '$set': {'updated_at': datetime.now(timezone.utc)},
            '$inc': {field_name: increment_by}
        },
        return_document=ReturnDocument.AFTER
    )
    
    # If somehow the document disappeared between validation and update
    if not updated_doc:
        raise CustomException(
            message="""
                Document was not found during
                the increment operation in the
                incrementDocumentField function
            """,
            custom_error_path=error_path,
            custom_error_file_name="increment_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "document_id": document_id,
                "field_name": field_name
            }
        )
    
    # Return the updated document as a model instance
    return BaseModel(**updated_doc)

# Delete Operations

async def deleteDocument(
    req: Request,
    collection_name: str,
    BaseModel: MongoBaseModel,
    **kwargs
) -> MongoBaseModel:
    
    from crud._generic.model_mappings import CollectionModelMatch

    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to use
                generic CRUD functions - delete failed
                """,
            custom_error_path=error_path,
            custom_error_file_name="delete_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )
    
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type
                for the collection - delete failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # First, retrieve the document to ensure existence
    existing_document = await getDocument(
        req=req,
        collection_name=collection_name,
        BaseModel=BaseModel,
        **kwargs
    )

    if not existing_document:
        raise CustomException(
            message="""
                Document not found and so could not be deleted
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # Perform the deletion using the unique _id of the retrieved document
    await req.app.mongodb[collection_name].delete_one({
        '_id': existing_document.id
    })

    # Return the deleted document in case you need its data
    return existing_document



async def deleteMultipleDocuments(
    req: Request,
    collection_name: str,
    BaseModel: MongoBaseModel,
    **kwargs
) -> list[MongoBaseModel]:
    from crud._generic.model_mappings import CollectionModelMatch

    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to use
                generic CRUD functions - delete_multiple failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )
    
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type for the collection
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # Build the query from BaseModel fields
    query = {}
    for field_name, field in BaseModel.model_fields.items():
        param_value = kwargs.get(field.alias, kwargs.get(field_name))
        if param_value is not None:
            query[field.alias if field.alias else field_name] = param_value

    if not query:
        raise CustomException(
            message="""
                None or invalid query parameters provided.
                If you wish to delete all documents,
                use the deleteAllDocuments function.
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
                "query_parameters": kwargs
            }
        )

    # Gather all documents that match so 
    # we can return them after deletion
    documents_to_delete = await req.app.mongodb[collection_name].find(
        query
    ).to_list(length=None)

    if not documents_to_delete:
        return []

    # Perform the deletion
    await req.app.mongodb[collection_name].delete_many(query)

    # Return the list of deleted documents
    return [BaseModel(
        **doc
    ) for doc in documents_to_delete]



async def deleteAllDocuments(
    req: Request,
    collection_name: str,
    BaseModel: MongoBaseModel,
) -> list[MongoBaseModel]:
    from crud._generic.model_mappings import CollectionModelMatch

    if collection_name not in CollectionModelMatch:
        raise CustomException(
            message="""
                Collection name has not been set up to use
                generic CRUD functions - delete_all failed
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_all_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
            }
        )
    
    if not issubclass(BaseModel, CollectionModelMatch[collection_name]):
        raise CustomException(
            message="""
                BaseModel is not of the correct type for the collection
            """,
            custom_error_path=error_path,
            custom_error_file_name="delete_multiple_failed.txt",
            extra_error_info={
                "collection_name": collection_name,
                "BaseModel": BaseModel.__name__,
            }
        )

    # Gather all documents that match so we can return them after deletion
    documents_to_delete = await req.app.mongodb[collection_name].find(
        {}
    ).to_list(length=None)

    if not documents_to_delete:
        return []

    # Perform the deletion
    await req.app.mongodb[collection_name].delete_many({})

    # Return the list of deleted documents
    return [BaseModel(
        **doc
    ) for doc in documents_to_delete]
