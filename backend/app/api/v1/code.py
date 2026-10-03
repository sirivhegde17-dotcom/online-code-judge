from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.submission import CodeRunRequest, CodeRunResponse
from app.services.submission_service import submission_service

router = APIRouter(prefix="/code", tags=["Code Execution"])

@router.post("/run", response_model=CodeRunResponse)
def run_code_sample(
    run_in: CodeRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run code synchronously against public test cases without creating a submission record."""
    return submission_service.run_code_sample(db, run_in)
