from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LeaderboardEntryResponse(BaseModel):
    rank: int
    user_id: int
    username: str
    problems_solved: int
    total_submissions: int
    accepted_submissions: int
    score: int
    acceptance_rate: float
    updated_at: datetime

    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    user_id: int
    username: str
    rank: Optional[int] = None
    problems_solved: int = 0
    total_submissions: int = 0
    accepted_submissions: int = 0
    score: int = 0
    acceptance_rate: float = 0.0
