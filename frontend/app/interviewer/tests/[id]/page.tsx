"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/config";

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

type Invite = {
    id: number;
    test_id: number;
    candidate_name: string;
    candidate_email: string;
    token: string;
};

type Submission = {
    id: number;
    invite_id: number;
    question_id: number;
    code: string;
    language: string;
};

const LANGUAGES = [
    "Text",
    "Python",
    "C++",
    "Java",
];

export default function InterviewerTestPage() {
    const params = useParams();
    const testId = params.id as string;

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [latestSubmission, setLatestSubmission] =
        useState<Submission | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [questionText, setQuestionText] = useState("");
    const [language, setLanguage] = useState("Python");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");


    const loadTest = async () => {
        try {
            setLoading(true);
            setError("");

            const [testResponse, questionsResponse, invitesResponse] =
                await Promise.all([
                    fetch(`${API_URL}/tests/${testId}`),
                    fetch(`${API_URL}/tests/${testId}/questions`),
                    fetch(`${API_URL}/tests/invites`),
                ]);

            if (!testResponse.ok || !questionsResponse.ok) {
                throw new Error("Failed to load test.");
            }

            const testData = await testResponse.json();
            const questionData = await questionsResponse.json();

            setTest(testData);
            setQuestions(questionData);

            // Find this test's candidate invite(s), then look up
            // the most recent submitted solution to show read-only
            // in the "solution — only for user" panel.
            if (invitesResponse.ok) {
                const allInvites: Invite[] = await invitesResponse.json();

                const testInviteIds = allInvites
                    .filter((invite) => invite.test_id === Number(testId))
                    .map((invite) => invite.id);

                if (testInviteIds.length > 0) {
                    const submissionsResponse = await fetch(
                        `${API_URL}/submissions`
                    );

                    if (submissionsResponse.ok) {
                        const allSubmissions: Submission[] =
                            await submissionsResponse.json();

                        const forThisTest = allSubmissions
                            .filter((submission) =>
                                testInviteIds.includes(submission.invite_id)
                            )
                            .sort((a, b) => b.id - a.id);

                        setLatestSubmission(forThisTest[0] || null);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setError("Unable to load test.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testId]);


    const handleSubmitQuestion = async () => {
        setSubmitError("");

        if (!questionText.trim()) {
            setSubmitError("Please write a question.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch(
                `${API_URL}/tests/${testId}/questions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        question_text: questionText.trim(),
                        language: language.toLowerCase(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add question.");
            }

            setQuestionText("");
            setLanguage("Python");

            await loadTest();
        } catch (err) {
            console.error(err);
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : "Failed to add question."
            );
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">
                Loading test...
            </main>
        );
    }

    if (error || !test) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center">

                    <h1 className="text-xl font-semibold">
                        {error || "Test not found"}
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
                <div className="mx-auto flex max-w-3xl items-center justify-between px-8 py-5">
                    <div>
                        <h1 className="text-xl font-bold">
                            {test.title}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Join link — interviewer view
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
            <section className="mx-auto max-w-3xl px-8 py-10">

                {questions.length > 0 && (
                    <div className="mb-6 rounded-xl border border-white/10 bg-[#111111] p-5">
                        <h3 className="text-sm font-semibold text-gray-300">
                            Questions added ({questions.length})
                        </h3>

                        <div className="mt-3 space-y-2">
                            {questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="flex items-start justify-between gap-4 rounded-lg bg-white/5 px-4 py-3 text-sm"
                                >
                                    <span className="text-gray-400">
                                        {index + 1}.{" "}
                                        {question.question_text.length > 80
                                            ? `${question.question_text.slice(0, 80)}...`
                                            : question.question_text}
                                    </span>
                                    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-xs text-gray-500">
                                        {question.language}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Question — only for interviewer */}
                <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

                    <label className="text-sm font-semibold text-gray-300">
                        Question{" "}
                        <span className="font-normal text-gray-600">
                            (only for interviewer)
                        </span>
                    </label>

                    <textarea
                        value={questionText}
                        onChange={(event) =>
                            setQuestionText(event.target.value)
                        }
                        placeholder="Write the coding problem here..."
                        rows={6}
                        className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500"
                    />

                    <div className="mt-5">
                        <label className="text-sm text-gray-400">
                            Select Language (Text, Python, C++, Java)
                        </label>

                        <select
                            value={language}
                            onChange={(event) =>
                                setLanguage(event.target.value)
                            }
                            className="mt-2 rounded-lg border border-white/10 bg-[#181818] px-4 py-3 text-sm outline-none focus:border-blue-500"
                        >
                            {LANGUAGES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Solution — only for user */}
                <div className="mt-6 rounded-xl border border-white/10 bg-[#111111] p-6">

                    <label className="text-sm font-semibold text-gray-300">
                        Solution{" "}
                        <span className="font-normal text-gray-600">
                            (only for user)
                        </span>
                    </label>

                    <div className="mt-3 min-h-[140px] w-full whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-gray-400">
                        {latestSubmission
                            ? latestSubmission.code
                            : "Waiting for the candidate's solution — it will appear here once submitted."}
                    </div>

                </div>

                {submitError && (
                    <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {submitError}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmitQuestion}
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>

            </section>

        </main>
    );
}
