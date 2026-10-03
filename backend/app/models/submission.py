import enum
from sqlalchemy import Column, Integer, Text, Float, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class SubmissionLanguage(str, enum.Enum):
    PYTHON = "PYTHON"
    CPP = "CPP"
    JAVA = "JAVA"

class SubmissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    ACCEPTED = "ACCEPTED"
    WRONG_ANSWER = "WRONG_ANSWER"
    COMPILATION_ERROR = "COMPILATION_ERROR"
    RUNTIME_ERROR = "RUNTIME_ERROR"
    TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED"
    MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED"
    INTERNAL_ERROR = "INTERNAL_ERROR"

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    language = Column(Enum(SubmissionLanguage), nullable=False)
    source_code = Column(Text, nullable=False)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False, index=True)
    execution_time = Column(Float, nullable=True)  # In seconds
    memory_used = Column(Float, nullable=True)     # In MB
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
    results = relationship("SubmissionResult", back_populates="submission", cascade="all, delete-orphan")
