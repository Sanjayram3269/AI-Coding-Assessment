import html
import json

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Submission,
    TestInvite,
    Question,
    AIEvaluation,
    Test,
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
        request.code,
        request.stdin,
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


    if submission_data.language.lower() == "python":

        result = run_python_code(
            submission_data.code,
            submission_data.stdin,
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

    else:

        # Only Python is auto-executed right now. Other languages
        # (C++, Java, Text) are still accepted and stored so the
        # candidate can submit and receive an AI evaluation — they
        # just skip the run step.
        submission = Submission(
            invite_id=invite.id,
            question_id=question.id,
            code=submission_data.code,
            language=submission_data.language,
            status="submitted",
            stdout=None,
            stderr=None,
            execution_time_ms=None,
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

        # Some models don't fully honor the strict JSON schema and
        # occasionally omit a field. Fall back gracefully instead
        # of letting one flaky response crash the whole evaluation.

        correctness_score = evaluation.get(
            "correctness_score", 0
        )

        efficiency_score = evaluation.get(
            "efficiency_score", 0
        )

        code_quality_score = evaluation.get(
            "code_quality_score", 0
        )

        overall_score = evaluation.get(
            "overall_score",
            round(
                (
                    correctness_score
                    + efficiency_score
                    + code_quality_score
                )
                / 3
            ),
        )

        evaluation_record = AIEvaluation(

            submission_id=submission.id,

            correctness_score=correctness_score,

            efficiency_score=efficiency_score,

            code_quality_score=code_quality_score,

            overall_score=overall_score,

            is_correct=evaluation.get(
                "is_correct", False
            ),

            time_complexity=evaluation.get(
                "time_complexity", "Unknown"
            ),

            space_complexity=evaluation.get(
                "space_complexity", "Unknown"
            ),

            detected_issues=json.dumps(
                evaluation.get("detected_issues", [])
            ),

            strengths=json.dumps(
                evaluation.get("strengths", [])
            ),

            improvements=json.dumps(
                evaluation.get("improvements", [])
            ),

            explanation=evaluation.get(
                "explanation",
                "The AI evaluator did not return a "
                "full explanation for this submission.",
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


# ==========================================
# DOWNLOAD REPORT
# ==========================================

@router.get("/{submission_id}/report")
def download_report(
    submission_id: int,
    db: Session = Depends(get_db),
):
    submission = (
        db.query(Submission)
        .filter(Submission.id == submission_id)
        .first()
    )

    if not submission:
        raise HTTPException(
            status_code=404,
            detail="Submission not found.",
        )

    invite = (
        db.query(TestInvite)
        .filter(TestInvite.id == submission.invite_id)
        .first()
    )

    question = (
        db.query(Question)
        .filter(Question.id == submission.question_id)
        .first()
    )

    test = (
        db.query(Test)
        .filter(Test.id == question.test_id)
        .first()
        if question
        else None
    )

    evaluation = (
        db.query(AIEvaluation)
        .filter(AIEvaluation.submission_id == submission.id)
        .first()
    )

    def esc(value: str | None) -> str:
        return html.escape(value or "")

    def render_list(items: list[str]) -> str:
        if not items:
            return "<p class=\"muted\">None noted.</p>"

        return "<ul>" + "".join(
            f"<li>{esc(item)}</li>" for item in items
        ) + "</ul>"

    evaluation_section = "<p class=\"muted\">This submission has not been AI-evaluated yet.</p>"

    if evaluation:
        detected_issues = json.loads(evaluation.detected_issues)
        strengths = json.loads(evaluation.strengths)
        improvements = json.loads(evaluation.improvements)

        evaluation_section = f"""
        <div class="scores">
            <div class="score-box"><span>{evaluation.overall_score}</span><label>Overall</label></div>
            <div class="score-box"><span>{evaluation.correctness_score}</span><label>Correctness</label></div>
            <div class="score-box"><span>{evaluation.efficiency_score}</span><label>Efficiency</label></div>
            <div class="score-box"><span>{evaluation.code_quality_score}</span><label>Code Quality</label></div>
        </div>

        <table class="meta">
            <tr><th>Solution appears correct</th><td>{"Yes" if evaluation.is_correct else "No"}</td></tr>
            <tr><th>Time complexity</th><td>{esc(evaluation.time_complexity)}</td></tr>
            <tr><th>Space complexity</th><td>{esc(evaluation.space_complexity)}</td></tr>
        </table>

        <h3>AI Explanation</h3>
        <p>{esc(evaluation.explanation)}</p>

        <h3>Strengths</h3>
        {render_list(strengths)}

        <h3>Detected Issues</h3>
        {render_list(detected_issues)}

        <h3>Suggested Improvements</h3>
        {render_list(improvements)}
        """

    report_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Assessment Report - Submission #{submission.id}</title>
<style>
    body {{ font-family: -apple-system, Segoe UI, Arial, sans-serif; margin: 40px; color: #111; }}
    h1 {{ margin-bottom: 4px; }}
    h3 {{ margin-top: 28px; margin-bottom: 8px; }}
    .subtitle {{ color: #555; margin-top: 0; }}
    table.meta {{ border-collapse: collapse; margin: 16px 0; }}
    table.meta th, table.meta td {{ text-align: left; padding: 6px 14px 6px 0; border-bottom: 1px solid #eee; }}
    .scores {{ display: flex; gap: 16px; margin: 20px 0; }}
    .score-box {{ border: 1px solid #ddd; border-radius: 10px; padding: 14px 20px; text-align: center; }}
    .score-box span {{ display: block; font-size: 28px; font-weight: 700; }}
    .score-box label {{ font-size: 12px; color: #666; }}
    pre {{ background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 16px; white-space: pre-wrap; word-break: break-word; }}
    .muted {{ color: #777; }}
    @media print {{ body {{ margin: 12px; }} }}
</style>
</head>
<body>
    <h1>CodeAssess — Evaluation Report</h1>
    <p class="subtitle">Generated for {esc(test.title) if test else "Unknown assessment"}</p>

    <table class="meta">
        <tr><th>Candidate</th><td>{esc(invite.candidate_name) if invite else "Unknown"}</td></tr>
        <tr><th>Email</th><td>{esc(invite.candidate_email) if invite else "Unknown"}</td></tr>
        <tr><th>Submission</th><td>#{submission.id}</td></tr>
        <tr><th>Language</th><td>{esc(submission.language)}</td></tr>
        <tr><th>Execution time</th><td>{submission.execution_time_ms if submission.execution_time_ms is not None else "N/A"} ms</td></tr>
    </table>

    <h3>Question</h3>
    <pre>{esc(question.question_text) if question else "N/A"}</pre>

    <h3>Submitted Code</h3>
    <pre>{esc(submission.code)}</pre>

    <h3>AI Evaluation</h3>
    {evaluation_section}
</body>
</html>"""

    headers = {
        "Content-Disposition": (
            f'attachment; filename="report_submission_{submission_id}.html"'
        )
    }

    return Response(
        content=report_html,
        media_type="text/html",
        headers=headers,
    )