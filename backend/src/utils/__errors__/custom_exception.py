class CustomException(Exception):
    def __init__(
        self,
        message:str = None,
        custom_error_path:str = None,
        custom_error_file_name:str = "error_file.txt",
        extra_error_info:dict = None,
    ):
        if message:
            self.message = message
        else:
            self.message = f"An Anticipated but unacceptable error occurred"
        self.custom_error_path = custom_error_path
        self.custom_error_file_name = custom_error_file_name
        self.extra_error_info = extra_error_info
        super().__init__(self.message)
    
    def __str__(self):
        return self.message


class EntityNotFoundCustomException(CustomException):
    def __init__(
        self,
        **kwargs
    ):
        super().__init__(**kwargs)


class EntityAlreadyExistsCustomException(CustomException):
    def __init__(
        self,
        **kwargs
    ):
        super().__init__(**kwargs)


class BadLLMResponseCustomException(CustomException):
    def __init__(
        self,
        **kwargs
    ):
        super().__init__(**kwargs)

class LLMJsonResponseCustomException(CustomException):
    def __init__(
        self,
        **kwargs
    ):
        super().__init__(**kwargs)
