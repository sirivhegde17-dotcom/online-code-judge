from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, String
from fastapi import HTTPException, status

from app.models.problem import Problem, ProblemDifficulty
from app.models.test_case import TestCase
from app.schemas.problem import ProblemCreate, ProblemUpdate
from app.schemas.test_case import TestCaseCreate

class ProblemService:
    @staticmethod
    def get_problems(
        db: Session,
        search: Optional[str] = None,
        difficulty: Optional[ProblemDifficulty] = None,
        tag: Optional[str] = None,
        sort_by: str = "id",
        sort_order: str = "asc",
        skip: int = 0,
        limit: int = 100,
    ) -> List[Problem]:
        query = db.query(Problem)

        if search:
            query = query.filter(
                or_(
                    Problem.title.ilike(f"%{search}%"),
                    Problem.description.ilike(f"%{search}%")
                )
            )

        if difficulty:
            query = query.filter(Problem.difficulty == difficulty)

        if tag:
            # JSON tags array search or substring match
            query = query.filter(Problem.tags.cast(String).ilike(f"%{tag}%"))

        # Sorting logic
        sort_attr = getattr(Problem, sort_by, Problem.id)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(asc(sort_attr))

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_problem_by_id(db: Session, problem_id: int) -> Optional[Problem]:
        return db.query(Problem).filter(Problem.id == problem_id).first()

    @staticmethod
    def create_problem(db: Session, problem_in: ProblemCreate) -> Problem:
        problem_data = problem_in.model_dump(exclude={"test_cases"})
        db_problem = Problem(**problem_data)
        db.add(db_problem)
        db.commit()
        db.refresh(db_problem)

        if problem_in.test_cases:
            for tc in problem_in.test_cases:
                db_tc = TestCase(
                    problem_id=db_problem.id,
                    input=tc.input,
                    expected_output=tc.expected_output,
                    is_hidden=tc.is_hidden
                )
                db.add(db_tc)
            db.commit()
            db.refresh(db_problem)

        return db_problem

    @staticmethod
    def update_problem(db: Session, problem_id: int, problem_in: ProblemUpdate) -> Problem:
        db_problem = ProblemService.get_problem_by_id(db, problem_id)
        if not db_problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID {problem_id} not found"
            )

        update_data = problem_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_problem, field, value)

        db.commit()
        db.refresh(db_problem)
        return db_problem

    @staticmethod
    def delete_problem(db: Session, problem_id: int) -> bool:
        db_problem = ProblemService.get_problem_by_id(db, problem_id)
        if not db_problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID {problem_id} not found"
            )
        db.delete(db_problem)
        db.commit()
        return True

    @staticmethod
    def add_test_case(db: Session, problem_id: int, test_case_in: TestCaseCreate) -> TestCase:
        db_problem = ProblemService.get_problem_by_id(db, problem_id)
        if not db_problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID {problem_id} not found"
            )
        db_tc = TestCase(
            problem_id=problem_id,
            input=test_case_in.input,
            expected_output=test_case_in.expected_output,
            is_hidden=test_case_in.is_hidden
        )
        db.add(db_tc)
        db.commit()
        db.refresh(db_tc)
        return db_tc

    @staticmethod
    def delete_test_case(db: Session, problem_id: int, test_case_id: int) -> bool:
        db_tc = db.query(TestCase).filter(
            TestCase.id == test_case_id,
            TestCase.problem_id == problem_id
        ).first()
        if not db_tc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Test case {test_case_id} for problem {problem_id} not found"
            )
        db.delete(db_tc)
        db.commit()
        return True

problem_service = ProblemService()
