from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

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