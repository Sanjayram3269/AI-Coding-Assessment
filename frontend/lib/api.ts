import { API_URL } from "./config";

export async function getTests() {
    const response = await fetch(
        `${API_URL}/tests`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch tests");
    }

    return response.json();
}


export async function createTest(data: {
    title: string;
    description: string;
    interviewer_id: number;
}) {
    const response = await fetch(
        `${API_URL}/tests`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create test");
    }

    return response.json();
}


export async function createQuestion(
    testId: number,
    data: {
        question_text: string;
        language: string;
    }
) {
    const response = await fetch(
        `${API_URL}/tests/${testId}/questions`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create question");
    }

    return response.json();
}


export async function getQuestions(
    testId: number
) {
    const response = await fetch(
        `${API_URL}/tests/${testId}/questions`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch questions");
    }

    return response.json();
}