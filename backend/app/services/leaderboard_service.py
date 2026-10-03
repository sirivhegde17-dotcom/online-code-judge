from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.leaderboard import Leaderboard
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntryResponse, UserStatsResponse

class LeaderboardService:
    @staticmethod
    def get_leaderboard(db: Session, skip: int = 0, limit: int = 50) -> List[LeaderboardEntryResponse]:
        """Fetch ranked leaderboard entries."""
        query = (
            db.query(Leaderboard, User.username)
            .join(User, Leaderboard.user_id == User.id)
            .order_by(
                desc(Leaderboard.problems_solved),
                desc(Leaderboard.score),
                desc(Leaderboard.accepted_submissions),
            )
        )

        entries = query.offset(skip).limit(limit).all()
        results = []

        for index, (lb, username) in enumerate(entries, start=skip + 1):
            rate = 0.0
            if lb.total_submissions > 0:
                rate = round((lb.accepted_submissions / lb.total_submissions) * 100.0, 1)

            results.append(
                LeaderboardEntryResponse(
                    rank=index,
                    user_id=lb.user_id,
                    username=username,
                    problems_solved=lb.problems_solved,
                    total_submissions=lb.total_submissions,
                    accepted_submissions=lb.accepted_submissions,
                    score=lb.score,
                    acceptance_rate=rate,
                    updated_at=lb.updated_at,
                )
            )

        return results

    @staticmethod
    def get_user_stats(db: Session, user_id: int) -> UserStatsResponse:
        """Get user rank and solving stats for dashboard."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return UserStatsResponse(user_id=user_id, username="Unknown")

        # Get all entries to compute user's rank
        all_entries = (
            db.query(Leaderboard)
            .order_by(
                desc(Leaderboard.problems_solved),
                desc(Leaderboard.score),
                desc(Leaderboard.accepted_submissions),
            )
            .all()
        )

        user_lb = db.query(Leaderboard).filter(Leaderboard.user_id == user_id).first()
        if not user_lb:
            return UserStatsResponse(user_id=user_id, username=user.username)

        user_rank = None
        for idx, lb in enumerate(all_entries, start=1):
            if lb.user_id == user_id:
                user_rank = idx
                break

        rate = 0.0
        if user_lb.total_submissions > 0:
            rate = round((user_lb.accepted_submissions / user_lb.total_submissions) * 100.0, 1)

        return UserStatsResponse(
            user_id=user_id,
            username=user.username,
            rank=user_rank,
            problems_solved=user_lb.problems_solved,
            total_submissions=user_lb.total_submissions,
            accepted_submissions=user_lb.accepted_submissions,
            score=user_lb.score,
            acceptance_rate=rate,
        )

leaderboard_service = LeaderboardService()
