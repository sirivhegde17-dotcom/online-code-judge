from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.submission import SubmissionStatus, SubmissionLanguage
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionDetailResponse,
)
from app.services.submission_service import submission_service

router = APIRouter(prefix="/submissions", tags=["Submissions"])

@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_solution(
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit code for evaluation against all test cases."""
    sub = submission_service.create_submission(db, current_user.id, submission_in)
    response = SubmissionResponse.model_validate(sub)
    if sub.problem:
        response.problem_title = sub.problem.title
    return response

@router.get("", response_model=List[SubmissionResponse])
def get_submissions(
    problem_id: Optional[int] = Query(None, description="Filter by problem ID"),
    submission_status: Optional[SubmissionStatus] = Query(None, alias="status", description="Filter by status"),
    language: Optional[SubmissionLanguage] = Query(None, description="Filter by language"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List submission history for the logged-in user (or all submissions for admin)."""
    submissions = submission_service.get_submissions(
        db,
        user=current_user,
        problem_id=problem_id,
        submission_status=submission_status,
        language=language,
        skip=skip,
        limit=limit,
    )
    results = []
    for sub in submissions:
        res = SubmissionResponse.model_validate(sub)
        if sub.problem:
            res.problem_title = sub.problem.title
        results.append(res)
    return results

@router.get("/{submission_id}", response_model=SubmissionDetailResponse)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve detailed submission details including per testcase results and source code."""
    sub = submission_service.get_submission_by_id(db, submission_id, current_user)
    response = SubmissionDetailResponse.model_validate(sub)
    if sub.problem:
        response.problem_title = sub.problem.title
    return response
