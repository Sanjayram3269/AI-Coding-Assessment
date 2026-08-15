import json
import os

import httpx
from dotenv import load_dotenv


load_dotenv()


OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)

OPENROUTER_MODEL = os.getenv(
    "OPENROUTER_MODEL",
    "openrouter/free",
)

OPENROUTER_URL = (
    "https://openrouter.ai/api/v1/chat/completions"
)


def evaluate_code(
    question: str,
    code: str,
    language: str,
    stdout: str,
    stderr: str,
    execution_time_ms: int,
) -> dict:

    if not OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not configured."
        )


    system_prompt = """
You are an expert interviewer evaluating a candidate's
response on a technical assessment platform.

The question may be a coding problem (Python, C++, or
Java) or a theory / conceptual question answered in free
text. Adapt your evaluation to whichever type this is —
do not evaluate a theory answer as if it were code.

For coding questions, evaluate:

1. Correctness
2. Algorithm quality
3. Time complexity
4. Space complexity
5. Code quality
6. Error handling
7. Edge-case handling
8. Efficiency
9. Overall quality

For theory / conceptual questions, evaluate the same
scored fields but interpret them for a written answer
instead of code:

- correctness_score: factual and conceptual accuracy
- efficiency_score: how focused and relevant the answer is
- code_quality_score: clarity and structure of the explanation
- time_complexity / space_complexity: return "N/A"
- detected_issues / strengths / improvements: about the
  candidate's reasoning and explanation, not source code

Use the question, the candidate's submitted answer, program
output, program errors, and execution time as evidence where
applicable.

Do not assume that successful execution automatically means
the answer is fully correct. Consider whether the response
actually addresses the stated question.

Return ONLY valid JSON matching the requested schema.
"""


    user_prompt = f"""
CODING QUESTION:

{question}


PROGRAMMING LANGUAGE:

{language}


CANDIDATE CODE:

{code}


PROGRAM OUTPUT:

{stdout}


PROGRAM ERROR:

{stderr}


EXECUTION TIME:

{execution_time_ms} ms


Evaluate this coding submission.

Provide:

- correctness score from 0 to 100
- efficiency score from 0 to 100
- code quality score from 0 to 100
- overall score from 0 to 100
- whether the solution appears correct
- time complexity
- space complexity
- detected issues
- strengths
- improvement suggestions
- concise explanation
"""


    evaluation_schema = {
        "type": "object",

        "properties": {

            "correctness_score": {
                "type": "integer",
                "minimum": 0,
                "maximum": 100,
            },

            "efficiency_score": {
                "type": "integer",
                "minimum": 0,
                "maximum": 100,
            },

            "code_quality_score": {
                "type": "integer",
                "minimum": 0,
                "maximum": 100,
            },

            "overall_score": {
                "type": "integer",
                "minimum": 0,
                "maximum": 100,
            },

            "is_correct": {
                "type": "boolean",
            },

            "time_complexity": {
                "type": "string",
            },

            "space_complexity": {
                "type": "string",
            },

            "detected_issues": {
                "type": "array",

                "items": {
                    "type": "string",
                },
            },

            "strengths": {
                "type": "array",

                "items": {
                    "type": "string",
                },
            },

            "improvements": {
                "type": "array",

                "items": {
                    "type": "string",
                },
            },

            "explanation": {
                "type": "string",
            },
        },

        "required": [
            "correctness_score",
            "efficiency_score",
            "code_quality_score",
            "overall_score",
            "is_correct",
            "time_complexity",
            "space_complexity",
            "detected_issues",
            "strengths",
            "improvements",
            "explanation",
        ],

        "additionalProperties": False,
    }


    payload = {
        "model": OPENROUTER_MODEL,

        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },

            {
                "role": "user",
                "content": user_prompt,
            },
        ],

        "response_format": {
            "type": "json_schema",

            "json_schema": {
                "name": "code_evaluation",
                "strict": True,
                "schema": evaluation_schema,
            },
        },

        "temperature": 0.1,

        "max_tokens": 2000,
    }


    headers = {
        "Authorization": (
            f"Bearer {OPENROUTER_API_KEY}"
        ),

        "Content-Type": "application/json",

        "X-Title": "CodeAssess",
    }


    try:

        with httpx.Client(
            timeout=60.0
        ) as client:

            response = client.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload,
            )


        if response.status_code != 200:

            raise RuntimeError(
                "OpenRouter request failed: "
                f"{response.status_code} "
                f"{response.text}"
            )


        data = response.json()


        content = (
            data["choices"][0]["message"]["content"]
        )


        evaluation = json.loads(
            content
        )


        return evaluation


    except json.JSONDecodeError as exc:

        raise RuntimeError(
            "OpenRouter returned invalid JSON."
        ) from exc


    except KeyError as exc:

        raise RuntimeError(
            "Unexpected OpenRouter response format."
        ) from exc