import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Submission,
    TestInvite,
    Question,
    AIEvaluation,
)

from ..schemas import (
    RunCodeRequest,
    RunCodeResponse,
    SubmissionCreate,
    SubmissionResponse,
)

from ..services.code_runner import run_python_code

from ..services.ai_evaluator import evaluate_code


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"],
)


# ==========================================
# RUN CODE
# ==========================================

@router.post(
    "/run",
    response_model=RunCodeResponse,
)
def run_code(
    request: RunCodeRequest,
):
    if request.language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail="Only Python execution is available right now.",
        )

    result = run_python_code(
        request.code
    )

    return result


# ==========================================
# CREATE SUBMISSION
# ==========================================

@router.post(
    "",
    response_model=SubmissionResponse,
)
def create_submission(
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db),
):
    invite = (
        db.query(TestInvite)
        .filter(
            TestInvite.token
            == submission_data.invite_token
        )
        .first()
    )

    if not invite:
        raise HTTPException(
            status_code=404,
            detail="Invalid invitation.",
        )


    question = (
        db.query(Question)
        .filter(
            Question.id
            == submission_data.question_id
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found.",
        )


    if question.test_id != invite.test_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Question does not belong "
                "to this assessment."
            ),
        )


    if submission_data.language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail="Only Python submissions are supported right now.",
        )


    result = run_python_code(
        submission_data.code
    )


    submission = Submission(
        invite_id=invite.id,
        question_id=question.id,
        code=submission_data.code,
        language=submission_data.language,
        status=result["status"],
        stdout=result["stdout"],
        stderr=result["stderr"],
        execution_time_ms=result["execution_time_ms"],
    )


    db.add(submission)
    db.commit()
    db.refresh(submission)


    return submission

# ==========================================
# AI EVALUATION
# ==========================================

@router.post(
    "/{submission_id}/evaluate"
)
def evaluate_submission(
    submission_id: int,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(Submission)
        .filter(
            Submission.id == submission_id
        )
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found.",
        )


    question = (
        db.query(Question)
        .filter(
            Question.id
            == submission.question_id
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found.",
        )


    try:

        evaluation = evaluate_code(
            question=question.question_text,

            code=submission.code,

            language=submission.language,

            stdout=submission.stdout or "",

            stderr=submission.stderr or "",

            execution_time_ms=(
                submission.execution_time_ms
                or 0
            ),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


    existing = (
        db.query(AIEvaluation)
        .filter(
            AIEvaluation.submission_id
            == submission.id
        )
        .first()
    )


    if existing:

        evaluation_record = existing

    else:

        evaluation_record = AIEvaluation(

            submission_id=submission.id,

            correctness_score=(
                evaluation["correctness_score"]
            ),

            efficiency_score=(
                evaluation["efficiency_score"]
            ),

            code_quality_score=(
                evaluation["code_quality_score"]
            ),

            overall_score=(
                evaluation["overall_score"]
            ),

            is_correct=(
                evaluation["is_correct"]
            ),

            time_complexity=(
                evaluation["time_complexity"]
            ),

            space_complexity=(
                evaluation["space_complexity"]
            ),

            detected_issues=json.dumps(
                evaluation["detected_issues"]
            ),

            strengths=json.dumps(
                evaluation["strengths"]
            ),

            improvements=json.dumps(
                evaluation["improvements"]
            ),

            explanation=(
                evaluation["explanation"]
            ),
        )

        db.add(evaluation_record)

        db.commit()

        db.refresh(evaluation_record)


    return {
        "id": evaluation_record.id,

        "submission_id":
            evaluation_record.submission_id,

        "correctness_score":
            evaluation_record.correctness_score,

        "efficiency_score":
            evaluation_record.efficiency_score,

        "code_quality_score":
            evaluation_record.code_quality_score,

        "overall_score":
            evaluation_record.overall_score,

        "is_correct":
            evaluation_record.is_correct,

        "time_complexity":
            evaluation_record.time_complexity,

        "space_complexity":
            evaluation_record.space_complexity,

        "detected_issues":
            json.loads(
                evaluation_record.detected_issues
            ),

        "strengths":
            json.loads(
                evaluation_record.strengths
            ),

        "improvements":
            json.loads(
                evaluation_record.improvements
            ),

        "explanation":
            evaluation_record.explanation,
    }

@router.get("")
def get_submissions(
    db: Session = Depends(get_db),
):
    submissions = (
        db.query(Submission)
        .order_by(Submission.id.desc())
        .all()
    )

    results = []

    for submission in submissions:

        evaluation = (
            db.query(AIEvaluation)
            .filter(
                AIEvaluation.submission_id
                == submission.id
            )
            .first()
        )

        results.append({
            "id": submission.id,
            "invite_id": submission.invite_id,
            "question_id": submission.question_id,
            "code": submission.code,
            "language": submission.language,
            "status": submission.status,
            "stdout": submission.stdout,
            "stderr": submission.stderr,
            "execution_time_ms":
                submission.execution_time_ms,

            "evaluation": (
                {
                    "overall_score":
                        evaluation.overall_score,

                    "correctness_score":
                        evaluation.correctness_score,

                    "efficiency_score":
                        evaluation.efficiency_score,

                    "code_quality_score":
                        evaluation.code_quality_score,

                    "is_correct":
                        evaluation.is_correct,

                    "time_complexity":
                        evaluation.time_complexity,

                    "space_complexity":
                        evaluation.space_complexity,

                    "detected_issues":
                        json.loads(
                            evaluation.detected_issues
                        ),

                    "strengths":
                        json.loads(
                            evaluation.strengths
                        ),

                    "improvements":
                        json.loads(
                            evaluation.improvements
                        ),

                    "explanation":
                        evaluation.explanation,
                }
                if evaluation
                else None
            ),
        })

    return results