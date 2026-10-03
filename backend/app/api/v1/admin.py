from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_admin
from app.models.user import User
from app.models.problem import Problem
from app.models.test_case import TestCase
from app.models.submission import Submission, SubmissionStatus
from app.schemas.user import UserResponse
from app.schemas.submission import SubmissionResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Retrieve global system statistics for administrative dashboard."""
    total_users = db.query(func.count(User.id)).scalar()
    total_problems = db.query(func.count(Problem.id)).scalar()
    total_submissions = db.query(func.count(Submission.id)).scalar()
    total_test_cases = db.query(func.count(TestCase.id)).scalar()
    accepted_submissions = db.query(func.count(Submission.id)).filter(Submission.status == SubmissionStatus.ACCEPTED).scalar()

    return {
        "total_users": total_users or 0,
        "total_problems": total_problems or 0,
        "total_submissions": total_submissions or 0,
        "total_test_cases": total_test_cases or 0,
        "accepted_submissions": accepted_submissions or 0,
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Retrieve list of all users registered in the system (ADMIN restricted)."""
    return db.query(User).order_by(User.id).offset(skip).limit(limit).all()

@router.put("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    is_active: bool = Query(..., description="Target active status"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Enable or disable a user account (ADMIN restricted)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot disable their own account."
        )

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user

@router.get("/submissions", response_model=List[SubmissionResponse])
def get_all_system_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Retrieve all system-wide submissions across all users (ADMIN restricted)."""
    submissions = db.query(Submission).order_by(Submission.submitted_at.desc()).offset(skip).limit(limit).all()
    results = []
    for sub in submissions:
        res = SubmissionResponse.model_validate(sub)
        if sub.problem:
            res.problem_title = sub.problem.title
        results.append(res)
    return results
