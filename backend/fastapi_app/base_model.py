from pydantic import BaseModel

class PromptRequest(BaseModel):
    mainField: str
    subField: str
    difficulty: str

class TextRequest(BaseModel):
    text: str
