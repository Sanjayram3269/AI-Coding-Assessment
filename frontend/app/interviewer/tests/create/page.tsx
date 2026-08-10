"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
    id: number;
    question_text: string;
    language: string;
};

const LANGUAGES = [
    "Python",
    "C++",
    "Java",
    "Text",
];

export default function CreateAssessmentPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            question_text: "",
            language: "Python",
        },
    ]);

    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");


    const addQuestion = () => {
        setQuestions((current) => [
            ...current,
            {
                id: Date.now(),
                question_text: "",
                language: "Python",
            },
        ]);
    };


    const removeQuestion = (id: number) => {
        if (questions.length === 1) {
            return;
        }

        setQuestions((current) =>
            current.filter((question) => question.id !== id)
        );
    };


    const updateQuestion = (
        id: number,
        field: "question_text" | "language",
        value: string
    ) => {
        setQuestions((current) =>
            current.map((question) =>
                question.id === id
                    ? {
                          ...question,
                          [field]: value,
                      }
                    : question
            )
        );
    };


    const handleCreate = async () => {
        setError("");

        if (!title.trim()) {
            setError("Please enter an assessment title.");
            return;
        }

        const emptyQuestion = questions.find(
            (question) => !question.question_text.trim()
        );

        if (emptyQuestion) {
            setError("Please complete all questions.");
            return;
        }

        try {
            setCreating(true);

            const userData = localStorage.getItem("user");

            if (!userData) {
                router.push("/");
                return;
            }

            const user = JSON.parse(userData);

            if (user.role !== "interviewer") {
                router.push("/");
                return;
            }


            // Create the assessment

            const testResponse = await fetch(
                "http://127.0.0.1:8000/tests",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        title: title.trim(),
                        description: description.trim(),
                        interviewer_id: 1,
                    }),
                }
            );


            if (!testResponse.ok) {
                throw new Error(
                    "Failed to create assessment."
                );
            }


            const test = await testResponse.json();


            // Create every question

            for (const question of questions) {

                const questionResponse = await fetch(
                    `http://127.0.0.1:8000/tests/${test.id}/questions`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            question_text:
                                question.question_text.trim(),

                            language:
                                question.language.toLowerCase(),
                        }),
                    }
                );


                if (!questionResponse.ok) {
                    throw new Error(
                        "Failed to create one of the questions."
                    );
                }
            }


            router.push("/interviewer/dashboard");

        } catch (err) {

            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );

        } finally {

            setCreating(false);

        }
    };


    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">


            {/* Header */}

            <header className="border-b border-white/10">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

                    <div>

                        <h1 className="text-xl font-bold">
                            CodeAssess
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Interviewer Dashboard
                        </p>

                    </div>


                    <button
                        onClick={() =>
                            router.push(
                                "/interviewer/dashboard"
                            )
                        }
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </header>


            {/* Main */}

            <section className="mx-auto max-w-5xl px-8 py-10">


                <div className="mb-8">

                    <h2 className="text-3xl font-bold">
                        Create Assessment
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Create a coding assessment and add questions
                        for candidates.
                    </p>

                </div>


                {/* Basic information */}

                <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

                    <h3 className="text-lg font-semibold">
                        Assessment Details
                    </h3>


                    <div className="mt-6 space-y-5">


                        <div>

                            <label className="text-sm text-gray-400">
                                Assessment Name
                            </label>

                            <input
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="e.g. Python Developer Assessment"
                                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                            />

                        </div>


                        <div>

                            <label className="text-sm text-gray-400">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe this assessment..."
                                rows={4}
                                className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                            />

                        </div>

                    </div>

                </div>


                {/* Questions */}

                <div className="mt-6">

                    <div className="mb-4 flex items-center justify-between">

                        <div>

                            <h3 className="text-lg font-semibold">
                                Coding Questions
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add the questions candidates will solve.
                            </p>

                        </div>


                        <button
                            onClick={addQuestion}
                            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                        >
                            + Add Question
                        </button>

                    </div>


                    <div className="space-y-5">

                        {questions.map(
                            (question, index) => (

                                <div
                                    key={question.id}
                                    className="rounded-xl border border-white/10 bg-[#111111] p-6"
                                >

                                    <div className="flex items-center justify-between">

                                        <h4 className="font-semibold">
                                            Question {index + 1}
                                        </h4>


                                        {questions.length > 1 && (

                                            <button
                                                onClick={() =>
                                                    removeQuestion(
                                                        question.id
                                                    )
                                                }
                                                className="text-sm text-red-400 transition hover:text-red-300"
                                            >
                                                Remove
                                            </button>

                                        )}

                                    </div>


                                    <div className="mt-5">

                                        <label className="text-sm text-gray-400">
                                            Question
                                        </label>

                                        <textarea
                                            value={
                                                question.question_text
                                            }
                                            onChange={(event) =>
                                                updateQuestion(
                                                    question.id,
                                                    "question_text",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Write the coding problem here..."
                                            rows={6}
                                            className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500"
                                        />

                                    </div>


                                    <div className="mt-5">

                                        <label className="text-sm text-gray-400">
                                            Programming Language
                                        </label>

                                        <select
                                            value={
                                                question.language
                                            }
                                            onChange={(event) =>
                                                updateQuestion(
                                                    question.id,
                                                    "language",
                                                    event.target.value
                                                )
                                            }
                                            className="mt-2 rounded-lg border border-white/10 bg-[#181818] px-4 py-3 text-sm outline-none focus:border-blue-500"
                                        >

                                            {LANGUAGES.map(
                                                (language) => (
                                                    <option
                                                        key={language}
                                                        value={language}
                                                    >
                                                        {language}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* Error */}

                {error && (

                    <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>

                )}


                {/* Bottom actions */}

                <div className="mt-8 flex justify-end gap-3">

                    <button
                        onClick={() =>
                            router.push(
                                "/interviewer/dashboard"
                            )
                        }
                        className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium transition hover:bg-white/5"
                    >
                        Cancel
                    </button>


                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {creating
                            ? "Creating..."
                            : "Create Assessment"}
                    </button>

                </div>

            </section>

        </main>
    );
}