"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
    invite_id: number;
    question_id: number;
    code: string;
    language: string;
    status: string;
    stdout: string;
    stderr: string;
    execution_time_ms: number;
    evaluation: Evaluation | null;
};

type Invite = {
    id: number;
    test_id: number;
    candidate_name: string;
    candidate_email: string;
    token: string;
    status: string;
};

export default function ReportDetailPage() {
    const params = useParams();

    const id = params.id as string;

    const [submission, setSubmission] =
        useState<Submission | null>(null);

    const [invite, setInvite] =
        useState<Invite | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {
        loadReport();
    }, [id]);


    const loadReport = async () => {
        try {
            setLoading(true);
            setError("");


            const [
                submissionsResponse,
                invitesResponse,
            ] = await Promise.all([
                fetch(
                    "http://127.0.0.1:8000/submissions",
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    "http://127.0.0.1:8000/tests/invites",
                    {
                        cache: "no-store",
                    }
                ),
            ]);


            if (!submissionsResponse.ok) {
                throw new Error(
                    "Unable to load submission."
                );
            }


            if (!invitesResponse.ok) {
                throw new Error(
                    "Unable to load candidate information."
                );
            }


            const submissions =
                await submissionsResponse.json();

            const invites =
                await invitesResponse.json();


            const foundSubmission =
                submissions.find(
                    (item: Submission) =>
                        String(item.id) === String(id)
                );


            if (!foundSubmission) {
                throw new Error(
                    "Submission not found."
                );
            }


            const foundInvite =
                invites.find(
                    (item: Invite) =>
                        item.id ===
                        foundSubmission.invite_id
                );


            setSubmission(foundSubmission);

            setInvite(
                foundInvite || null
            );

        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load report."
            );

        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] text-white">
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-gray-400">
                        Loading report...
                    </p>
                </div>
            </main>
        );
    }


    if (error || !submission) {
        return (
            <main className="min-h-screen bg-[#0a0a0a] text-white">

                <div className="flex min-h-screen items-center justify-center px-6">

                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-8 text-center">

                        <h1 className="text-2xl font-bold">
                            Report Not Found
                        </h1>

                        <p className="mt-3 text-sm text-gray-400">
                            {error ||
                                "The requested report could not be found."}
                        </p>

                        <Link
                            href="/interviewer/reports"
                            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-500"
                        >
                            Back to Reports
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    const evaluation =
        submission.evaluation;


    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            {/* Header */}
            <header className="border-b border-white/10 px-6 py-5 lg:px-8">

                <div className="mx-auto flex max-w-7xl items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold">
                            Candidate Report
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Detailed AI evaluation of the candidate
                            submission.
                        </p>

                    </div>


                    <Link
                        href="/interviewer/reports"
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Back to Reports
                    </Link>

                </div>

            </header>


            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

                {/* Candidate information */}
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-7">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div>

                            <h2 className="text-3xl font-bold">

                                {invite?.candidate_name ||
                                    `Candidate #${submission.invite_id}`}

                            </h2>


                            <p className="mt-2 text-gray-400">

                                {invite?.candidate_email ||
                                    "Email unavailable"}

                            </p>

                        </div>


                        <div className="flex flex-wrap gap-3">

                            <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-400">
                                Submission #{submission.id}
                            </span>


                            <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-400">
                                {submission.language}
                            </span>

                        </div>

                    </div>

                </div>


                {!evaluation ? (

                    <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center">

                        <h2 className="text-xl font-semibold text-yellow-400">
                            Evaluation Pending
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                            This submission has not received an AI
                            evaluation yet.
                        </p>

                    </div>

                ) : (

                    <>
                        {/* Score */}
                        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-8">

                            <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">

                                <div className="flex justify-center">

                                    <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-blue-600/30 bg-blue-600/10">

                                        <span className="text-5xl font-bold">
                                            {
                                                evaluation.overall_score
                                            }
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            / 100
                                        </span>

                                    </div>

                                </div>


                                <div>

                                    <h2 className="text-2xl font-bold">
                                        AI Evaluation
                                    </h2>

                                    <p className="mt-2 text-gray-400">
                                        Overall assessment of the
                                        candidate's solution.
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
                                value={
                                    evaluation.time_complexity
                                }
                            />

                            <InfoCard
                                title="Space Complexity"
                                value={
                                    evaluation.space_complexity
                                }
                            />

                        </div>


                        {/* Explanation */}
                        <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-7">

                            <h2 className="text-xl font-bold">
                                AI Explanation
                            </h2>

                            <p className="mt-4 leading-7 text-gray-300">
                                {
                                    evaluation.explanation
                                }
                            </p>

                        </section>


                        {/* Strengths */}
                        <ResultList
                            title="Strengths"
                            items={
                                evaluation.strengths
                            }
                            emptyMessage="No specific strengths identified."
                        />


                        {/* Issues */}
                        <ResultList
                            title="Detected Issues"
                            items={
                                evaluation.detected_issues
                            }
                            emptyMessage="No specific issues detected."
                        />


                        {/* Improvements */}
                        <ResultList
                            title="Suggested Improvements"
                            items={
                                evaluation.improvements
                            }
                            emptyMessage="No additional improvements suggested."
                        />

                    </>
                )}


                {/* Execution */}
                <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-7">

                    <h2 className="text-xl font-bold">
                        Execution Details
                    </h2>


                    <div className="mt-5 grid gap-4 sm:grid-cols-3">

                        <InfoCard
                            title="Submission ID"
                            value={`#${submission.id}`}
                        />

                        <InfoCard
                            title="Execution Time"
                            value={`${submission.execution_time_ms} ms`}
                        />

                        <InfoCard
                            title="Status"
                            value={submission.status}
                        />

                    </div>


                    {submission.stdout && (
                        <div className="mt-5">

                            <h3 className="mb-2 font-semibold">
                                Program Output
                            </h3>

                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-5 text-sm text-gray-300">
                                {submission.stdout}
                            </pre>

                        </div>
                    )}


                    {submission.stderr && (
                        <div className="mt-5">

                            <h3 className="mb-2 font-semibold text-red-400">
                                Program Error
                            </h3>

                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-gray-300">
                                {submission.stderr}
                            </pre>

                        </div>
                    )}

                </section>


                {/* Submitted Code */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

                    <div className="border-b border-white/10 px-7 py-5">

                        <h2 className="text-xl font-bold">
                            Submitted Code
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Candidate's submitted solution.
                        </p>

                    </div>


                    <pre className="max-h-[700px] overflow-auto bg-[#0d0d0d] p-7 text-sm leading-6 text-gray-300">

                        <code>
                            {submission.code}
                        </code>

                    </pre>

                </section>


                <div className="mt-8 pb-8 text-center">

                    <Link
                        href="/interviewer/reports"
                        className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                        ← Back to All Reports
                    </Link>

                </div>

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
        <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className="mt-2 break-words text-lg font-semibold">
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

                    {items.map(
                        (item, index) => (

                            <li
                                key={`${title}-${index}`}
                                className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-gray-300"
                            >
                                {item}
                            </li>

                        )
                    )}

                </ul>

            ) : (

                <p className="mt-4 text-sm text-gray-500">
                    {emptyMessage}
                </p>

            )}

        </section>
    );
}