from typing import Optional

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="candidate",
    )

    tests: Mapped[list["Test"]] = relationship(
        back_populates="interviewer",
    )


class Test(Base):
    __tablename__ = "tests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    interviewer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
    )

    interviewer: Mapped["User"] = relationship(
        back_populates="tests",
    )

    questions: Mapped[list["Question"]] = relationship(
        back_populates="test",
        cascade="all, delete-orphan",
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("tests.id"),
    )

    question_text: Mapped[str] = mapped_column(
        Text,
    )

    language: Mapped[str] = mapped_column(
        String(20),
        default="python",
    )

    test: Mapped["Test"] = relationship(
        back_populates="questions",
    )
class TestInvite(Base):
    __tablename__ = "test_invites"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("tests.id"),
        index=True,
    )

    candidate_name: Mapped[str] = mapped_column(
        String(100),
    )

    candidate_email: Mapped[str] = mapped_column(
        String(255),
    )

    profile_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    scheduled_at: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )

    token: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
    )

    test: Mapped["Test"] = relationship()
class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    invite_id: Mapped[int] = mapped_column(
        ForeignKey("test_invites.id"),
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"),
        index=True,
    )

    code: Mapped[str] = mapped_column(
        Text,
    )

    language: Mapped[str] = mapped_column(
        String(20),
        default="python",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="submitted",
    )

    stdout: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    stderr: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    execution_time_ms: Mapped[int | None] = mapped_column(
        nullable=True,
    )

class AIEvaluation(Base):
    __tablename__ = "ai_evaluations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.id"),
        unique=True,
        index=True,
    )

    correctness_score: Mapped[int] = mapped_column()

    efficiency_score: Mapped[int] = mapped_column()

    code_quality_score: Mapped[int] = mapped_column()

    overall_score: Mapped[int] = mapped_column()

    is_correct: Mapped[bool] = mapped_column()

    time_complexity: Mapped[str] = mapped_column(
        Text
    )

    space_complexity: Mapped[str] = mapped_column(
        Text
    )

    detected_issues: Mapped[str] = mapped_column(
        Text
    )

    strengths: Mapped[str] = mapped_column(
        Text
    )

    improvements: Mapped[str] = mapped_column(
        Text
    )

    explanation: Mapped[str] = mapped_column(
        Text
    )