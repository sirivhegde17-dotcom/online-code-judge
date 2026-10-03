from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.problem import ProblemDifficulty
from app.schemas.test_case import TestCaseCreate, TestCaseResponse, TestCasePublicResponse

class ProblemBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str
    difficulty: ProblemDifficulty = ProblemDifficulty.EASY
    constraints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    tags: Optional[List[str]] = []
    time_limit: float = Field(2.0, gt=0, le=10.0)      # In seconds
    memory_limit: int = Field(128, gt=0, le=1024)     # In MB

class ProblemCreate(ProblemBase):
    test_cases: Optional[List[TestCaseCreate]] = []

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[ProblemDifficulty] = None
    constraints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    tags: Optional[List[str]] = None
    time_limit: Optional[float] = None
    memory_limit: Optional[int] = None

class ProblemListResponse(BaseModel):
    id: int
    title: str
    difficulty: ProblemDifficulty
    tags: Optional[List[str]] = []
    time_limit: float
    memory_limit: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProblemDetailResponse(ProblemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    public_test_cases: List[TestCasePublicResponse] = []

    class Config:
        from_attributes = True

class ProblemAdminDetailResponse(ProblemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    test_cases: List[TestCaseResponse] = []

    class Config:
        from_attributes = True
