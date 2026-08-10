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