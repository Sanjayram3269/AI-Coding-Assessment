"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";

type Evaluation = {
    overall_score: number;
    correctness_score: number;
    efficiency_score: number;
    code_quality_score: number;
    is_correct: boolean;
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
    code: string;
    language: string;
    status: string;
    stdout: string;
    stderr: string;
    execution_time_ms: number;
    evaluation: Evaluation | null;
};

export default function CandidatesPage() {
    const [submissions, setSubmissions] = useState<
        Submission[]
    >([]);

    const [invites, setInvites] = useState<Invite[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {
        loadCandidates();
    }, []);


    const loadCandidates = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                submissionsResponse,
                invitesResponse,
            ] = await Promise.all([
                fetch(
                    `${API_URL}/submissions`,
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    `${API_URL}/tests/invites`,
                    {
                        cache: "no-store",
                    }
                ),
            ]);

            if (!submissionsResponse.ok) {
                throw new Error(
                    "Unable to load candidates."
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
                    : "Unable to load candidates."
            );

        } finally {
            setLoading(false);
        }
    };


    const inviteMap = useMemo(() => {
        return new Map(
            invites.map((invite) => [
                invite.id,
                invite,
            ])
        );
    }, [invites]);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            {/* Header */}
            <header className="border-b border-white/10 px-8 py-5">
                <div className="mx-auto max-w-7xl">

                    <h1 className="text-2xl font-bold">
                        Candidates
                    </h1>

                    <p className="mt-1 text-sm text-gray-400">
                        View candidate submissions and AI
                        evaluation results.
                    </p>

                </div>
            </header>


            {/* Main */}
            <section className="mx-auto max-w-7xl px-8 py-8">

                {/* Summary */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

                        <p className="text-sm text-gray-500">
                            Total Submissions
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {submissions.length}
                        </p>

                    </div>


                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

                        <p className="text-sm text-gray-500">
                            Evaluated
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {
                                submissions.filter(
                                    (submission) =>
                                        submission.evaluation !==
                                        null
                                ).length
                            }
                        </p>

                    </div>


                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

                        <p className="text-sm text-gray-500">
                            Average Score
                        </p>

                        <p className="mt-2 text-3xl font-bold">

                            {submissions.length > 0
                                ? Math.round(
                                      submissions.reduce(
                                          (
                                              total,
                                              submission
                                          ) =>
                                              total +
                                              (submission
                                                  .evaluation
                                                  ?.overall_score ??
                                                  0),
                                          0
                                      ) /
                                          submissions.length
                                  )
                                : 0}

                            <span className="ml-1 text-base text-gray-500">
                                / 100
                            </span>

                        </p>

                    </div>

                </div>


                {/* Candidates table */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111111]">

                    <div className="border-b border-white/10 px-6 py-5">

                        <h2 className="text-lg font-semibold">
                            Candidate Submissions
                        </h2>

                    </div>


                    {loading && (
                        <div className="p-10 text-center text-gray-400">
                            Loading candidates...
                        </div>
                    )}


                    {!loading && error && (
                        <div className="p-10 text-center">

                            <p className="text-red-400">
                                {error}
                            </p>

                            <button
                                onClick={loadCandidates}
                                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500"
                            >
                                Retry
                            </button>

                        </div>
                    )}


                    {!loading &&
                        !error &&
                        submissions.length === 0 && (
                            <div className="p-10 text-center">

                                <p className="text-gray-400">
                                    No candidate submissions yet.
                                </p>

                                <p className="mt-2 text-sm text-gray-600">
                                    Candidates will appear here
                                    after submitting an assessment.
                                </p>

                            </div>
                        )}


                    {!loading &&
                        !error &&
                        submissions.length > 0 && (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-sm text-gray-500">

                                            <th className="px-6 py-4 font-medium">
                                                Submission
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Assessment
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Language
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Score
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Status
                                            </th>

                                        </tr>
                                    </thead>


                                    <tbody>

                                        {submissions.map(
                                            (submission) => (

                                                <tr
                                                    key={
                                                        submission.id
                                                    }
                                                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                                                >

                                                    {/* Submission */}
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


                                                    {/* Assessment */}
                                                    <td className="px-6 py-5">

                                                        <div className="font-medium">
                                                            Question #
                                                            {
                                                                submission.question_id
                                                            }
                                                        </div>

                                                    </td>


                                                    {/* Language */}
                                                    <td className="px-6 py-5">

                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                                                            {
                                                                submission.language
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* Score */}
                                                    <td className="px-6 py-5">

                                                        {submission
                                                            .evaluation ? (

                                                            <div>

                                                                <span className="text-lg font-bold">
                                                                    {
                                                                        submission
                                                                            .evaluation
                                                                            .overall_score
                                                                    }
                                                                </span>

                                                                <span className="text-gray-500">
                                                                    {" "}
                                                                    / 100
                                                                </span>

                                                            </div>

                                                        ) : (

                                                            <span className="text-gray-500">
                                                                Pending
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* Status */}
                                                    <td className="px-6 py-5">

                                                        {submission
                                                            .evaluation ? (

                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                                    submission
                                                                        .evaluation
                                                                        .is_correct
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : "bg-red-500/10 text-red-400"
                                                                }`}
                                                            >
                                                                {
                                                                    submission
                                                                        .evaluation
                                                                        .is_correct
                                                                        ? "Evaluated"
                                                                        : "Needs Review"
                                                                }
                                                            </span>

                                                        ) : (

                                                            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                                                                Pending
                                                            </span>

                                                        )}

                                                    </td>

                                                </tr>

                                            )
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