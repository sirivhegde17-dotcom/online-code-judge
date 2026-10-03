from sqlalchemy import Column, Integer, Text, Float, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.submission import SubmissionStatus

class SubmissionResult(Base):
    __tablename__ = "submission_results"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(SubmissionStatus), nullable=False)
    execution_time = Column(Float, nullable=True)  # In seconds
    memory_used = Column(Float, nullable=True)     # In MB
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    submission = relationship("Submission", back_populates="results")
    test_case = relationship("TestCase", back_populates="submission_results")
