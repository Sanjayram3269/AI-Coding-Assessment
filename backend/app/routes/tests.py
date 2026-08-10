from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Test, Question
from ..schemas import (
    TestCreate,
    TestResponse,
    QuestionCreate,
    QuestionResponse,
)


router = APIRouter(
    prefix="/tests",
    tags=["Tests"],
)


# ==========================================
# CREATE TEST
# ==========================================

@router.post(
    "",
    response_model=TestResponse,
)
def create_test(
    test_data: TestCreate,
    db: Session = Depends(get_db),
):

    test = Test(
        title=test_data.title,
        description=test_data.description,
        interviewer_id=test_data.interviewer_id,
    )

    db.add(test)
    db.commit()
    db.refresh(test)

    return test


# ==========================================
# GET ALL TESTS
# ==========================================

@router.get(
    "",
    response_model=list[TestResponse],
)
def get_tests(
    db: Session = Depends(get_db),
):

    tests = db.query(Test).all()

    return tests


# ==========================================
# GET SINGLE TEST
# ==========================================

@router.get(
    "/{test_id}",
    response_model=TestResponse,
)
def get_test(
    test_id: int,
    db: Session = Depends(get_db),
):

    test = (
        db.query(Test)
        .filter(Test.id == test_id)
        .first()
    )

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found",
        )

    return test


# ==========================================
# ADD QUESTION TO TEST
# ==========================================

@router.post(
    "/{test_id}/questions",
    response_model=QuestionResponse,
)
def create_question(
    test_id: int,
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
):

    test = (
        db.query(Test)
        .filter(Test.id == test_id)
        .first()
    )

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found",
        )

    question = Question(
        test_id=test_id,
        question_text=question_data.question_text,
        language=question_data.language,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question


# ==========================================
# GET QUESTIONS FOR TEST
# ==========================================

@router.get(
    "/{test_id}/questions",
    response_model=list[QuestionResponse],
)
def get_questions(
    test_id: int,
    db: Session = Depends(get_db),
):

    test = (
        db.query(Test)
        .filter(Test.id == test_id)
        .first()
    )

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found",
        )

    questions = (
        db.query(Question)
        .filter(Question.test_id == test_id)
        .all()
    )

    return questions