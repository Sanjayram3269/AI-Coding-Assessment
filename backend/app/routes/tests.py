import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Test, Question, TestInvite
from ..schemas import (
    TestCreate,
    TestResponse,
    QuestionCreate,
    QuestionResponse,
    InviteCreate,
    InviteResponse,
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
# GET ALL CANDIDATE INVITES
# ==========================================

@router.get(
    "/invites",
    response_model=list[InviteResponse],
)
def get_all_invites(
    db: Session = Depends(get_db),
):

    invites = (
        db.query(TestInvite)
        .order_by(TestInvite.id.desc())
        .all()
    )

    return invites


# ==========================================
# GET INVITE BY TOKEN
# ==========================================

@router.get(
    "/invites/{token}",
    response_model=InviteResponse,
)
def get_invite(
    token: str,
    db: Session = Depends(get_db),
):

    invite = (
        db.query(TestInvite)
        .filter(TestInvite.token == token)
        .first()
    )

    if not invite:
        raise HTTPException(
            status_code=404,
            detail="Invalid invitation link",
        )

    return invite


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


# ==========================================
# CREATE CANDIDATE INVITE
# ==========================================

@router.post(
    "/{test_id}/invites",
    response_model=InviteResponse,
)
def create_invite(
    test_id: int,
    invite_data: InviteCreate,
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

    token = secrets.token_urlsafe(32)

    invite = TestInvite(
        test_id=test_id,
        candidate_name=invite_data.candidate_name,
        candidate_email=invite_data.candidate_email,
        token=token,
        status="pending",
    )

    db.add(invite)
    db.commit()
    db.refresh(invite)

    return invite