from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_admin
from app.models.user import User
from app.models.problem import ProblemDifficulty
from app.schemas.problem import (
    ProblemCreate,
    ProblemUpdate,
    ProblemListResponse,
    ProblemDetailResponse,
    ProblemAdminDetailResponse,
)
from app.schemas.test_case import TestCaseCreate, TestCaseResponse, TestCasePublicResponse
from app.services.problem_service import problem_service

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.get("", response_model=List[ProblemListResponse])
def get_problems(
    search: Optional[str] = Query(None, description="Search in title or description"),
    difficulty: Optional[ProblemDifficulty] = Query(None, description="Filter by difficulty"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    sort_by: str = Query("id", description="Sort field: id, title, difficulty, created_at"),
    sort_order: str = Query("asc", description="Sort direction: asc or desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve list of problems with optional filtering, search, and pagination."""
    return problem_service.get_problems(
        db,
        search=search,
        difficulty=difficulty,
        tag=tag,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )

@router.get("/{problem_id}", response_model=ProblemDetailResponse)
def get_problem(
    problem_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve problem details for public/user viewing (hidden test cases excluded)."""
    db_problem = problem_service.get_problem_by_id(db, problem_id)
    if not db_problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem with ID {problem_id} not found"
        )
    
    # Filter public test cases only (is_hidden == False)
    public_tcs = [
        TestCasePublicResponse.model_validate(tc)
        for tc in db_problem.test_cases
        if not tc.is_hidden
    ]
    
    response_data = ProblemDetailResponse.model_validate(db_problem)
    response_data.public_test_cases = public_tcs
    return response_data

@router.post("", response_model=ProblemAdminDetailResponse, status_code=status.HTTP_201_CREATED)
def create_problem(
    problem_in: ProblemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create a new problem (ADMIN restricted)."""
    db_problem = problem_service.create_problem(db, problem_in)
    return ProblemAdminDetailResponse.model_validate(db_problem)

@router.put("/{problem_id}", response_model=ProblemAdminDetailResponse)
def update_problem(
    problem_id: int,
    problem_in: ProblemUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Update an existing problem (ADMIN restricted)."""
    db_problem = problem_service.update_problem(db, problem_id, problem_in)
    return ProblemAdminDetailResponse.model_validate(db_problem)

@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Delete a problem (ADMIN restricted)."""
    problem_service.delete_problem(db, problem_id)
    return None

@router.post("/{problem_id}/test-cases", response_model=TestCaseResponse, status_code=status.HTTP_201_CREATED)
def add_test_case(
    problem_id: int,
    test_case_in: TestCaseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Add a test case to a problem (ADMIN restricted)."""
    return problem_service.add_test_case(db, problem_id, test_case_in)

@router.delete("/{problem_id}/test-cases/{test_case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_case(
    problem_id: int,
    test_case_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Delete a test case from a problem (ADMIN restricted)."""
    problem_service.delete_test_case(db, problem_id, test_case_id)
    return None
