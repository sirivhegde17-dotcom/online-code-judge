from pydantic import BaseModel
from datetime import datetime

class TestCaseBase(BaseModel):
    input: str
    expected_output: str
    is_hidden: bool = False

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(TestCaseBase):
    id: int
    problem_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TestCasePublicResponse(BaseModel):
    id: int
    input: str
    expected_output: str

    class Config:
        from_attributes = True
