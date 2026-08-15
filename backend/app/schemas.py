from pydantic import BaseModel, Field


class TestCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    interviewer_id: int


class TestResponse(BaseModel):
    id: int
    title: str
    description: str | None
    interviewer_id: int

    model_config = {
        "from_attributes": True
    }


class QuestionCreate(BaseModel):
    question_text: str = Field(
        min_length=1
    )

    language: str = "python"


class QuestionResponse(BaseModel):
    id: int
    test_id: int
    question_text: str
    language: str

    model_config = {
        "from_attributes": True}
    
class InviteCreate(BaseModel):
    candidate_name: str = Field(
        min_length=1,
        max_length=100,
    )

    candidate_email: str = Field(
        min_length=3,
        max_length=255,
    )

    profile_id: str | None = Field(
        default=None,
        max_length=100,
    )

    scheduled_at: str | None = None


class InviteResponse(BaseModel):
    id: int
    test_id: int
    candidate_name: str
    candidate_email: str
    profile_id: str | None
    scheduled_at: str | None
    token: str
    status: str

    model_config = {
        "from_attributes": True
    }
class RunCodeRequest(BaseModel):
    code: str = Field(
        min_length=1,
        max_length=50000,
    )

    language: str = "python"

    stdin: str = Field(
        default="",
        max_length=10000,
    )


class RunCodeResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    execution_time_ms: int


class SubmissionCreate(BaseModel):
    invite_token: str
    question_id: int

    code: str = Field(
        min_length=1,
        max_length=50000,
    )

    language: str = "python"

    stdin: str = Field(
        default="",
        max_length=10000,
    )


class SubmissionResponse(BaseModel):
    id: int
    invite_id: int
    question_id: int
    code: str
    language: str
    status: str
    stdout: str | None
    stderr: str | None
    execution_time_ms: int | None

    model_config = {
        "from_attributes": True
    }

class EvaluationResponse(BaseModel):
    id: int
    submission_id: int

    correctness_score: int
    efficiency_score: int
    code_quality_score: int
    overall_score: int

    is_correct: bool

    time_complexity: str
    space_complexity: str

    detected_issues: list[str]
    strengths: list[str]
    improvements: list[str]

    explanation: str