import enum
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, JSON, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class ProblemDifficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(ProblemDifficulty), default=ProblemDifficulty.EASY, nullable=False, index=True)
    constraints = Column(Text, nullable=True)
    input_format = Column(Text, nullable=True)
    output_format = Column(Text, nullable=True)
    sample_input = Column(Text, nullable=True)
    sample_output = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)  # List of strings e.g. ["Array", "Hash Table"]
    time_limit = Column(Float, default=2.0, nullable=False)  # in seconds
    memory_limit = Column(Integer, default=128, nullable=False)  # in MB
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    test_cases = relationship("TestCase", back_populates="problem", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")
