"use client";

import { useEffect, useState } from "react";

type Evaluation = {
    correctness_score: number;
    efficiency_score: number;
    code_quality_score: number;
    overall_score: number;
    is_correct: boolean;
    time_complexity: string;
    space_complexity: string;
    detected_issues: string[];
    strengths: string[];
    improvements: string[];
    explanation: string;
};

type Submission = {
    id: number;
    code?: string;
    language?: string;
    stdout?: string;
    stderr?: string;
    execution_time_ms?: number;
};

type StoredResult = {
    submission: Submission;
    evaluation: Evaluation;
};

export default function CandidateResultPage() {
    const [result, setResult] = useState<StoredResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(
                "latestEvaluation"
            );

            if (stored) {
                setResult(JSON.parse(stored));
            }
        } catch (error) {
            console.error(
                "Unable to load evaluation result:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] text-white">
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-gray-400">
                        Loading your evaluation...
                    </p>
                </div>
            </main>
        );
    }

    if (!result) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] text-white">
                <div className="flex min-h-screen items-center justify-center px-6">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-8 text-center">
                        <h1 className="text-2xl font-bold">
                            Result Not Available
                        </h1>

                        <p className="mt-3 text-sm text-gray-400">
                            No recent evaluation was found on this
                            device. Please complete an assessment
                            before viewing the result.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const { evaluation, submission } = result;

    const score = Math.max(
        0,
        Math.min(100, evaluation.overall_score)
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <header className="border-b border-white/10 px-6 py-5">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-2xl font-bold">
                        Assessment Result
                    </h1>

                    <p className="mt-1 text-sm text-gray-400">
                        Your coding submission has been evaluated.
                    </p>
                </div>
            </header>

            <section className="mx-auto max-w-5xl px-6 py-10">
                {/* Overall Score */}
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-8">
                    <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-blue-600/30 bg-blue-600/10">
                                <span className="text-5xl font-bold">
                                    {score}
                                </span>

                                <span className="text-sm text-gray-400">
                                    / 100
                                </span>
                            </div>

                            <div
                                className={`mt-4 rounded-full px-4 py-2 text-sm font-medium ${
                                    evaluation.is_correct
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-red-500/10 text-red-400"
                                }`}
                            >
                                {evaluation.is_correct
                                    ? "Solution appears correct"
                                    : "Solution needs improvement"}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">
                                Evaluation Summary
                            </h2>

                            <p className="mt-2 text-gray-400">
                                Your solution was analyzed for
                                correctness, efficiency, and code
                                quality.
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                <ScoreCard
                                    title="Correctness"
                                    score={
                                        evaluation.correctness_score
                                    }
                                />

                                <ScoreCard
                                    title="Efficiency"
                                    score={
                                        evaluation.efficiency_score
                                    }
                                />

                                <ScoreCard
                                    title="Code Quality"
                                    score={
                                        evaluation.code_quality_score
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complexity */}
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <InfoCard
                        title="Time Complexity"
                        value={evaluation.time_complexity}
                    />

                    <InfoCard
                        title="Space Complexity"
                        value={evaluation.space_complexity}
                    />
                </div>

                {/* AI Explanation */}
                <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-7">
                    <h2 className="text-xl font-bold">
                        AI Evaluation
                    </h2>

                    <p className="mt-4 leading-7 text-gray-300">
                        {evaluation.explanation}
                    </p>
                </section>

                {/* Strengths */}
                <ResultList
                    title="Strengths"
                    items={evaluation.strengths}
                    emptyMessage="No specific strengths were identified."
                />

                {/* Issues */}
                <ResultList
                    title="Detected Issues"
                    items={evaluation.detected_issues}
                    emptyMessage="No specific issues were detected."
                />

                {/* Improvements */}
                <ResultList
                    title="Suggested Improvements"
                    items={evaluation.improvements}
                    emptyMessage="No additional improvements were suggested."
                />

                {/* Execution Details */}
                <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-7">
                    <h2 className="text-xl font-bold">
                        Submission Details
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <InfoCard
                            title="Submission ID"
                            value={`#${submission.id}`}
                        />

                        <InfoCard
                            title="Language"
                            value={
                                submission.language ||
                                "Python"
                            }
                        />

                        <InfoCard
                            title="Execution Time"
                            value={
                                submission.execution_time_ms !==
                                undefined
                                    ? `${submission.execution_time_ms} ms`
                                    : "Not available"
                            }
                        />
                    </div>

                    {submission.stderr ? (
                        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                            <h3 className="font-semibold text-red-400">
                                Program Error
                            </h3>

                            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-gray-300">
                                {submission.stderr}
                            </pre>
                        </div>
                    ) : null}

                    {submission.stdout ? (
                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5">
                            <h3 className="font-semibold">
                                Program Output
                            </h3>

                            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-gray-300">
                                {submission.stdout}
                            </pre>
                        </div>
                    ) : null}
                </section>

                <p className="mt-8 text-center text-xs text-gray-600">
                    Your assessment result has been recorded.
                </p>
            </section>
        </main>
    );
}


function ScoreCard({
    title,
    score,
}: {
    title: string;
    score: number;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-gray-400">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold">
                {score}
                <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / 100
                </span>
            </p>
        </div>
    );
}


function InfoCard({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className="mt-2 break-words text-lg font-semibold text-white">
                {value}
            </p>
        </div>
    );
}


function ResultList({
    title,
    items,
    emptyMessage,
}: {
    title: string;
    items: string[];
    emptyMessage: string;
}) {
    return (
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-7">
            <h2 className="text-xl font-bold">
                {title}
            </h2>

            {items.length > 0 ? (
                <ul className="mt-5 space-y-3">
                    {items.map((item, index) => (
                        <li
                            key={`${title}-${index}`}
                            className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-gray-300"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 text-sm text-gray-500">
                    {emptyMessage}
                </p>
            )}
        </section>
    );
}