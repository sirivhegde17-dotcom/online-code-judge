from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.submission import SubmissionLanguage, SubmissionStatus

class CodeRunRequest(BaseModel):
    problem_id: int
    language: SubmissionLanguage
    source_code: str = Field(..., min_length=1)

class CodeRunResponse(BaseModel):
    status: SubmissionStatus
    execution_time: float
    memory_used: float
    stdout: Optional[str] = ""
    stderr: Optional[str] = ""
    test_cases_passed: int
    total_test_cases: int

class SubmissionCreate(BaseModel):
    problem_id: int
    language: SubmissionLanguage
    source_code: str = Field(..., min_length=1)

class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    problem_id: int
    problem_title: Optional[str] = None
    language: SubmissionLanguage
    status: SubmissionStatus
    execution_time: Optional[float] = None
    memory_used: Optional[float] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

class SubmissionResultResponse(BaseModel):
    id: int
    test_case_id: int
    status: SubmissionStatus
    execution_time: Optional[float] = None
    memory_used: Optional[float] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None

    class Config:
        from_attributes = True

class SubmissionDetailResponse(SubmissionResponse):
    source_code: str
    results: List[SubmissionResultResponse] = []

    class Config:
        from_attributes = True
