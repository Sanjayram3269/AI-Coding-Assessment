"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Test = {
    id: number;
    title: string;
    description: string | null;
    interviewer_id: number;
};

type Question = {
    id: number;
    test_id: number;
    question_text: string;
    language: string;
};

export default function TestDetailsPage() {
    const params = useParams();

    const testId = params.id as string;

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [candidateName, setCandidateName] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [creatingInvite, setCreatingInvite] = useState(false);
    const [inviteError, setInviteError] = useState("");

    useEffect(() => {
        const loadTest = async () => {
            try {
                setLoading(true);
                setError("");

                const [testResponse, questionsResponse] =
                    await Promise.all([
                        fetch(
                            `http://127.0.0.1:8000/tests/${testId}`
                        ),
                        fetch(
                            `http://127.0.0.1:8000/tests/${testId}/questions`
                        ),
                    ]);

                if (
                    !testResponse.ok ||
                    !questionsResponse.ok
                ) {
                    throw new Error(
                        "Failed to load assessment."
                    );
                }

                const testData =
                    await testResponse.json();

                const questionData =
                    await questionsResponse.json();

                setTest(testData);
                setQuestions(questionData);
            } catch (err) {
                console.error(err);

                setError(
                    "Unable to load assessment."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTest();
    }, [testId]);

    const createInvite = async () => {
        setInviteError("");
        setInviteLink("");

        if (!candidateName.trim()) {
            setInviteError(
                "Please enter the candidate name."
            );
            return;
        }

        if (!candidateEmail.trim()) {
            setInviteError(
                "Please enter the candidate email."
            );
            return;
        }

        try {
            setCreatingInvite(true);

            const response = await fetch(
                `http://127.0.0.1:8000/tests/${testId}/invites`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        candidate_name:
                            candidateName.trim(),

                        candidate_email:
                            candidateEmail.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to create invitation."
                );
            }

            const invite = await response.json();

            const link =
                `${window.location.origin}/candidate/test/${invite.token}`;

            setInviteLink(link);
        } catch (err) {
            console.error(err);

            setInviteError(
                err instanceof Error
                    ? err.message
                    : "Failed to create invitation."
            );
        } finally {
            setCreatingInvite(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">
                Loading assessment...
            </main>
        );
    }

    if (error || !test) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center">

                    <h1 className="text-xl font-semibold">
                        {error || "Assessment not found"}
                    </h1>

                    <Link
                        href="/interviewer/dashboard"
                        className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm"
                    >
                        Back to Dashboard
                    </Link>

                </div>
            </main>
        );
    }

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
                            Assessment Details
                        </p>
                    </div>

                    <Link
                        href="/interviewer/dashboard"
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Dashboard
                    </Link>

                </div>

            </header>


            {/* Main */}

            <section className="mx-auto max-w-5xl px-8 py-10">

                {/* Assessment Details */}

                <div className="rounded-xl border border-white/10 bg-[#111111] p-7">

                    <div className="flex items-start justify-between">

                        <div>

                            <span className="text-xs text-blue-400">
                                Assessment #{test.id}
                            </span>

                            <h2 className="mt-2 text-3xl font-bold">
                                {test.title}
                            </h2>

                            <p className="mt-3 text-gray-500">
                                {test.description ||
                                    "No description provided."}
                            </p>

                        </div>

                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                            Active
                        </span>

                    </div>

                </div>


                {/* Invite Candidate */}

                <div className="mt-6 rounded-xl border border-white/10 bg-[#111111] p-7">

                    <h3 className="text-lg font-semibold">
                        Invite Candidate
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Generate a private assessment link for a candidate.
                    </p>


                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                        {/* Candidate Name */}

                        <div>

                            <label className="text-sm text-gray-400">
                                Candidate Name
                            </label>

                            <input
                                value={candidateName}
                                onChange={(event) =>
                                    setCandidateName(
                                        event.target.value
                                    )
                                }
                                placeholder="Candidate name"
                                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                            />

                        </div>


                        {/* Candidate Email */}

                        <div>

                            <label className="text-sm text-gray-400">
                                Candidate Email
                            </label>

                            <input
                                type="email"
                                value={candidateEmail}
                                onChange={(event) =>
                                    setCandidateEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="candidate@example.com"
                                className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                            />

                        </div>

                    </div>


                    {/* Generate Button */}

                    <button
                        onClick={createInvite}
                        disabled={creatingInvite}
                        className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {creatingInvite
                            ? "Generating..."
                            : "Generate Invite Link"}
                    </button>


                    {/* Error */}

                    {inviteError && (
                        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {inviteError}
                        </div>
                    )}


                    {/* Generated Link */}

                    {inviteLink && (
                        <div className="mt-5">

                            <p className="text-sm font-medium text-green-400">
                                Invitation created successfully
                            </p>

                            <div className="mt-3 flex gap-2">

                                <input
                                    value={inviteLink}
                                    readOnly
                                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 outline-none"
                                />

                                <button
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            inviteLink
                                        )
                                    }
                                    className="rounded-lg border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
                                >
                                    Copy
                                </button>

                            </div>

                        </div>
                    )}

                </div>


                {/* Questions */}

                <div className="mt-8">

                    <div className="flex items-center justify-between">

                        <div>

                            <h3 className="text-xl font-semibold">
                                Questions
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {questions.length} question
                                {questions.length !== 1
                                    ? "s"
                                    : ""}
                            </p>

                        </div>

                    </div>


                    {/* Question List */}

                    <div className="mt-5 space-y-4">

                        {questions.length === 0 && (
                            <div className="rounded-xl border border-white/10 bg-[#111111] p-6 text-sm text-gray-500">
                                No questions have been added to this assessment yet.
                            </div>
                        )}


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

                                        <span className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-400">
                                            {question.language}
                                        </span>

                                    </div>


                                    <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                                        {question.question_text}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </section>

        </main>
    );
}