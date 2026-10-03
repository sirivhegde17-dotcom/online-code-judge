from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    input = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    problem = relationship("Problem", back_populates="test_cases")
    submission_results = relationship("SubmissionResult", back_populates="test_case", cascade="all, delete-orphan")
