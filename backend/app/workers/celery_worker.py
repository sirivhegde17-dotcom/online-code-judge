from celery import Celery
from app.core.config import settings
from app.database.session import SessionLocal
from app.models.submission import Submission, SubmissionStatus
from app.models.submission_result import SubmissionResult
from app.models.leaderboard import Leaderboard
from app.models.problem import ProblemDifficulty
from app.execution.judge import judge_engine

celery_app = Celery(
    "codejudge_worker",
    broker=settings.redis_connection_url,
    backend=settings.redis_connection_url
)
celery = celery_app  # Alias for standard Celery CLI lookup

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="evaluate_submission_task")
def evaluate_submission_task(submission_id: int):
    """
    Background worker task to judge a code submission asynchronously.
    """
    db = SessionLocal()
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            return {"error": f"Submission #{submission_id} not found"}

        # Set status to RUNNING
        submission.status = SubmissionStatus.RUNNING
        db.commit()

        problem = submission.problem
        test_cases = problem.test_cases

        # Run Judge Engine
        overall_status, max_time, max_mem, per_tc_results = judge_engine.evaluate_test_cases(
            language=submission.language,
            source_code=submission.source_code,
            test_cases=test_cases,
            time_limit=problem.time_limit,
            memory_limit=problem.memory_limit
        )

        # Clear existing submission_results if any
        db.query(SubmissionResult).filter(SubmissionResult.submission_id == submission_id).delete()

        # Save per testcase results
        for tc_res in per_tc_results:
            db_res = SubmissionResult(
                submission_id=submission_id,
                test_case_id=tc_res["test_case_id"],
                status=tc_res["status"],
                execution_time=tc_res["execution_time"],
                memory_used=tc_res["memory_used"],
                stdout=tc_res["stdout"],
                stderr=tc_res["stderr"]
            )
            db.add(db_res)

        # Update submission record
        submission.status = overall_status
        submission.execution_time = max_time
        submission.memory_used = max_mem
        db.commit()

        # Update Leaderboard Stats for User
        user_id = submission.user_id
        leaderboard = db.query(Leaderboard).filter(Leaderboard.user_id == user_id).first()
        if not leaderboard:
            leaderboard = Leaderboard(user_id=user_id)
            db.add(leaderboard)

        leaderboard.total_submissions += 1
        if overall_status == SubmissionStatus.ACCEPTED:
            leaderboard.accepted_submissions += 1

            # Check if this is user's first accepted submission for this problem
            prior_accepted = db.query(Submission).filter(
                Submission.user_id == user_id,
                Submission.problem_id == problem.id,
                Submission.status == SubmissionStatus.ACCEPTED,
                Submission.id != submission_id
            ).first()

            if not prior_accepted:
                leaderboard.problems_solved += 1
                # Points bonus based on problem difficulty
                points = 10
                if problem.difficulty == ProblemDifficulty.MEDIUM:
                    points = 20
                elif problem.difficulty == ProblemDifficulty.HARD:
                    points = 30
                leaderboard.score += points

        db.commit()

        return {
            "submission_id": submission_id,
            "status": overall_status,
            "execution_time": max_time,
            "memory_used": max_mem
        }

    except Exception as e:
        db.rollback()
        if submission:
            submission.status = SubmissionStatus.INTERNAL_ERROR
            db.commit()
        raise e
    finally:
        db.close()
