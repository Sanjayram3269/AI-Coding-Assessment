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
You are an expert software engineering evaluator
for an online coding assessment platform.

Evaluate the candidate's submitted code objectively.

Evaluate:

1. Correctness
2. Algorithm quality
3. Time complexity
4. Space complexity
5. Code quality
6. Error handling
7. Edge-case handling
8. Efficiency
9. Overall quality

Use the coding question, source code, program output,
program errors, and execution time as evidence.

Do not assume that successful execution automatically
means the algorithm is fully correct.

Consider whether the solution actually solves the
stated problem.

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