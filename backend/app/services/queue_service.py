import logging
from app.workers.celery_worker import evaluate_submission_task

logger = logging.getLogger(__name__)

class QueueService:
    @staticmethod
    def enqueue_submission(submission_id: int):
        """
        Dispatches submission evaluation to Celery queue.
        If Celery worker is unreachable or during local sync execution, executes inline.
        """
        try:
            # Try asynchronous queue dispatch
            task = evaluate_submission_task.delay(submission_id)
            logger.info(f"Enqueued submission #{submission_id} to Celery queue (Task ID: {task.id})")
            return task.id
        except Exception as e:
            logger.warning(f"Could not reach Redis/Celery queue ({e}). Executing evaluation synchronously.")
            # Synchronous fallback execution
            evaluate_submission_task(submission_id)
            return "sync_execution"

queue_service = QueueService()
