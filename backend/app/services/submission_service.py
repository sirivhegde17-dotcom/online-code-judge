from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.problem import Problem
from app.models.submission import Submission, SubmissionStatus, SubmissionLanguage
from app.schemas.submission import SubmissionCreate, CodeRunRequest, CodeRunResponse
from app.execution.judge import judge_engine
from app.services.queue_service import queue_service

class SubmissionService:
    @staticmethod
    def run_code_sample(db: Session, run_in: CodeRunRequest) -> CodeRunResponse:
        """Run user code against public test cases synchronously."""
        problem = db.query(Problem).filter(Problem.id == run_in.problem_id).first()
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID {run_in.problem_id} not found"
            )

        # Filter public test cases (is_hidden == False)
        public_tcs = [tc for tc in problem.test_cases if not tc.is_hidden]
        if not public_tcs:
            # Create ad-hoc test case using sample input/output if no explicit public test case exists
            public_tcs = [{
                "id": 0,
                "input": problem.sample_input or "",
                "expected_output": problem.sample_output or ""
            }]

        overall_status, max_time, max_mem, tc_results = judge_engine.evaluate_test_cases(
            language=run_in.language,
            source_code=run_in.source_code,
            test_cases=public_tcs,
            time_limit=problem.time_limit,
            memory_limit=problem.memory_limit
        )

        passed_count = sum(1 for r in tc_results if r["status"] == SubmissionStatus.ACCEPTED)
        first_stderr = next((r["stderr"] for r in tc_results if r["stderr"]), "")
        first_stdout = next((r["stdout"] for r in tc_results if r["stdout"]), "")

        return CodeRunResponse(
            status=overall_status,
            execution_time=max_time,
            memory_used=max_mem,
            stdout=first_stdout,
            stderr=first_stderr,
            test_cases_passed=passed_count,
            total_test_cases=len(public_tcs)
        )

    @staticmethod
    def create_submission(db: Session, user_id: int, submission_in: SubmissionCreate) -> Submission:
        """Create submission record and queue async background evaluation task."""
        problem = db.query(Problem).filter(Problem.id == submission_in.problem_id).first()
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID {submission_in.problem_id} not found"
            )

        db_submission = Submission(
            user_id=user_id,
            problem_id=submission_in.problem_id,
            language=submission_in.language,
            source_code=submission_in.source_code,
            status=SubmissionStatus.PENDING
        )
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)

        # Enqueue evaluation task to Redis / Celery
        queue_service.enqueue_submission(db_submission.id)
        db.refresh(db_submission)
        return db_submission

    @staticmethod
    def get_submissions(
        db: Session,
        user: User,
        problem_id: Optional[int] = None,
        submission_status: Optional[SubmissionStatus] = None,
        language: Optional[SubmissionLanguage] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Submission]:
        """Retrieve submissions. Regular users only see their own submissions unless ADMIN."""
        query = db.query(Submission)

        if user.role != UserRole.ADMIN:
            query = query.filter(Submission.user_id == user.id)

        if problem_id:
            query = query.filter(Submission.problem_id == problem_id)

        if submission_status:
            query = query.filter(Submission.status == submission_status)

        if language:
            query = query.filter(Submission.language == language)

        return query.order_by(desc(Submission.submitted_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_submission_by_id(db: Session, submission_id: int, user: User) -> Submission:
        """Retrieve submission details by ID. Enforces ownership check for non-admins."""
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Submission with ID {submission_id} not found"
            )

        if user.role != UserRole.ADMIN and submission.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view source code for this submission."
            )

        return submission

submission_service = SubmissionService()
