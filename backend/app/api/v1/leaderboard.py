from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntryResponse, UserStatsResponse
from app.services.leaderboard_service import leaderboard_service

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntryResponse])
def get_leaderboard(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve global leaderboard rankings."""
    return leaderboard_service.get_leaderboard(db, skip=skip, limit=limit)

@router.get("/me", response_model=UserStatsResponse)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve dashboard statistics and rank for current user."""
    return leaderboard_service.get_user_stats(db, current_user.id)
