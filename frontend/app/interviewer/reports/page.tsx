"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Evaluation = {
    overall_score: number;
    correctness_score: number;
    efficiency_score: number;
    code_quality_score: number;
    is_correct: boolean;
    time_complexity: string;
    space_complexity: string;
    explanation: string;
};

type Invite = {
    id: number;
    test_id: number;
    candidate_name: string;
    candidate_email: string;
    token: string;
    status: string;
};

type Submission = {
    id: number;
    invite_id: number;
    question_id: number;
    language: string;
    status: string;
    execution_time_ms: number;
    evaluation: Evaluation | null;
};

export default function ReportsPage() {
    const [submissions, setSubmissions] = useState<
        Submission[]
    >([]);

    const [invites, setInvites] = useState<Invite[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
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
                    "Unable to load reports."
                );
            }

            if (!invitesResponse.ok) {
                throw new Error(
                    "Unable to load candidate names."
                );
            }

            const submissionsData =
                await submissionsResponse.json();

            const invitesData =
                await invitesResponse.json();

            setSubmissions(
                Array.isArray(submissionsData)
                    ? submissionsData
                    : []
            );

            setInvites(
                Array.isArray(invitesData)
                    ? invitesData
                    : []
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load reports."
            );
        } finally {
            setLoading(false);
        }
    };

    const reports = submissions.filter(
        (submission) => submission.evaluation !== null
    );

    const inviteMap = new Map(
        invites.map((invite) => [
            invite.id,
            invite,
        ])
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <header className="border-b border-white/10 px-6 py-5 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Reports
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            AI-generated candidate evaluation
                            reports.
                        </p>
                    </div>

                    <Link
                        href="/interviewer/dashboard"
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Dashboard
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
                    <div className="border-b border-white/10 px-6 py-5">
                        <h2 className="text-lg font-semibold">
                            Completed Reports
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">
                            Loading reports...
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No completed reports yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-sm text-gray-500">
                                        <th className="px-6 py-4">
                                            Candidate
                                        </th>

                                        <th className="px-6 py-4">
                                            Submission
                                        </th>

                                        <th className="px-6 py-4">
                                            Score
                                        </th>

                                        <th className="px-6 py-4">
                                            Correctness
                                        </th>

                                        <th className="px-6 py-4">
                                            Efficiency
                                        </th>

                                        <th className="px-6 py-4">
                                            Quality
                                        </th>

                                        <th className="px-6 py-4">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {reports.map(
                                        (submission) => {
                                            const evaluation =
                                                submission.evaluation!;

                                            return (
                                                <tr
    key={submission.id}
    onClick={() => {
        window.location.href =
            `/interviewer/reports/${submission.id}`;
    }}
    className="cursor-pointer border-b border-white/5 transition hover:bg-white/[0.03]"
>
                                                    <td className="px-6 py-5">
                                                        <div className="font-medium">
                                                            {
                                                                inviteMap.get(
                                                                    submission.invite_id
                                                                )?.candidate_name ||
                                                                `Candidate #${submission.invite_id}`
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {
                                                                inviteMap.get(
                                                                    submission.invite_id
                                                                )?.candidate_email ||
                                                                `Invite #${submission.invite_id}`
                                                            }
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5 text-gray-400">
                                                        #
                                                        {
                                                            submission.id
                                                        }
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span className="font-bold">
                                                            {
                                                                evaluation.overall_score
                                                            }
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {" "}
                                                            / 100
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-5 text-gray-400">
                                                        {
                                                            evaluation.correctness_score
                                                        }
                                                    </td>

                                                    <td className="px-6 py-5 text-gray-400">
                                                        {
                                                            evaluation.efficiency_score
                                                        }
                                                    </td>

                                                    <td className="px-6 py-5 text-gray-400">
                                                        {
                                                            evaluation.code_quality_score
                                                        }
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                                evaluation.is_correct
                                                                    ? "bg-green-500/10 text-green-400"
                                                                    : "bg-red-500/10 text-red-400"
                                                            }`}
                                                        >
                                                            {evaluation.is_correct
                                                                ? "Passed"
                                                                : "Needs Review"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}