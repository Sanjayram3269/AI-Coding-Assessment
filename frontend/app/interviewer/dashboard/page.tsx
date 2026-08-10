"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Assessment = {
    id: number;
    title: string;
    description: string | null;
    interviewer_id: number;
};

type Invite = {
    id: number;
    test_id: number;
    candidate_name: string;
    candidate_email: string;
    token: string;
    status: string;
};

type Evaluation = {
    overall_score: number;
    correctness_score: number;
    efficiency_score: number;
    code_quality_score: number;
    is_correct: boolean;
};

type Submission = {
    id: number;
    invite_id: number;
    question_id: number;
    language: string;
    status: string;
    evaluation: Evaluation | null;
};

export default function InterviewerDashboard() {
    const [assessments, setAssessments] = useState<
        Assessment[]
    >([]);

    const [submissions, setSubmissions] = useState<
        Submission[]
    >([]);

    const [invites, setInvites] = useState<Invite[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                testsResponse,
                submissionsResponse,
                invitesResponse,
            ] = await Promise.all([
                fetch(
                    "http://127.0.0.1:8000/tests",
                    {
                        cache: "no-store",
                    }
                ),

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


            if (!testsResponse.ok) {
                throw new Error(
                    "Unable to load assessments."
                );
            }


            if (!submissionsResponse.ok) {
                throw new Error(
                    "Unable to load candidate data."
                );
            }


            if (!invitesResponse.ok) {
                throw new Error(
                    "Unable to load candidate names."
                );
            }


            const testsData =
                await testsResponse.json();

            const submissionsData =
                await submissionsResponse.json();

            const invitesData =
                await invitesResponse.json();


            setAssessments(
                Array.isArray(testsData)
                    ? testsData
                    : []
            );


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
                    : "Unable to load dashboard."
            );

        } finally {
            setLoading(false);
        }
    };


    /*
     * Create a quick lookup:
     *
     * invite ID
     *      ↓
     * candidate name/email
     */
    const inviteMap = useMemo(() => {
        return new Map(
            invites.map((invite) => [
                invite.id,
                invite,
            ])
        );
    }, [invites]);


    /*
     * Count unique candidates.
     */
    const candidateCount = useMemo(() => {
        return new Set(
            submissions.map(
                (submission) =>
                    submission.invite_id
            )
        ).size;
    }, [submissions]);


    /*
     * Count completed AI reports.
     */
    const reportCount = useMemo(() => {
        return submissions.filter(
            (submission) =>
                submission.evaluation !== null
        ).length;
    }, [submissions]);


    /*
     * Get latest candidates for dashboard preview.
     */
    const recentCandidates = useMemo(() => {
        return submissions.slice(0, 5);
    }, [submissions]);


    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            {/* Header */}
            <header className="border-b border-white/10">

                <div className="flex items-center justify-between px-6 py-5 lg:px-8">

                    <div>

                        <h1 className="text-2xl font-bold">
                            CodeAssess
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Interviewer Dashboard
                        </p>

                    </div>


                    <div className="flex items-center gap-4">

                        <span className="hidden text-sm text-gray-300 sm:block">
                            Demo Interviewer
                        </span>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold">
                            D
                        </div>

                    </div>

                </div>

            </header>


            <div className="flex min-h-[calc(100vh-89px)]">

                {/* Sidebar */}
                <aside className="w-64 shrink-0 border-r border-white/10 p-4">

                    <nav className="space-y-2">

                        <Link
                            href="/interviewer/dashboard"
                            className="block rounded-lg bg-white/10 px-5 py-4 text-sm font-medium text-white"
                        >
                            Dashboard
                        </Link>


                        <Link
                            href="/interviewer/tests/create"
                            className="block rounded-lg px-5 py-4 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                        >
                            Create Assessment
                        </Link>


                        <Link
                            href="/interviewer/candidates"
                            className="block rounded-lg px-5 py-4 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                        >
                            Candidates
                        </Link>


                        <Link
                            href="/interviewer/reports"
                            className="block rounded-lg px-5 py-4 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                        >
                            Reports
                        </Link>

                    </nav>

                </aside>


                {/* Main */}
                <section className="min-w-0 flex-1 px-6 py-8 lg:px-10">

                    <div className="mx-auto max-w-6xl">

                        {/* Title */}
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                            <div>

                                <h2 className="text-4xl font-bold">
                                    Assessments
                                </h2>

                                <p className="mt-2 text-gray-500">
                                    Create and manage your coding
                                    assessments.
                                </p>

                            </div>


                            <Link
                                href="/interviewer/tests/create"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                            >
                                + Create Assessment
                            </Link>

                        </div>


                        {/* Error */}
                        {error && (
                            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                                {error}
                            </div>
                        )}


                        {/* Statistics */}
                        <div className="mt-8 grid gap-5 md:grid-cols-3">

                            <StatCard
                                title="Total Assessments"
                                value={
                                    loading
                                        ? "—"
                                        : assessments.length
                                }
                            />


                            <StatCard
                                title="Candidates"
                                value={
                                    loading
                                        ? "—"
                                        : candidateCount
                                }
                                subtitle="Unique candidates who submitted"
                            />


                            <StatCard
                                title="Reports"
                                value={
                                    loading
                                        ? "—"
                                        : reportCount
                                }
                                subtitle="Completed AI evaluations"
                            />

                        </div>


                        {/* Recent Candidates */}
                        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

                            <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">

                                <div>

                                    <h3 className="text-xl font-semibold">
                                        Recent Candidates
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Latest candidate submissions
                                    </p>

                                </div>


                                <Link
                                    href="/interviewer/candidates"
                                    className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                    View all
                                </Link>

                            </div>


                            {loading ? (

                                <div className="p-10 text-center text-gray-500">
                                    Loading candidates...
                                </div>

                            ) : recentCandidates.length === 0 ? (

                                <div className="p-10 text-center">

                                    <p className="text-gray-400">
                                        No candidates yet.
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">
                                        Candidates will appear here
                                        after submitting an assessment.
                                    </p>

                                </div>

                            ) : (

                                <div>

                                    {recentCandidates.map(
                                        (submission) => {

                                            const invite =
                                                inviteMap.get(
                                                    submission.invite_id
                                                );


                                            return (
                                                <div
                                                    key={
                                                        submission.id
                                                    }
                                                    className="flex flex-col gap-4 border-b border-white/10 px-7 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <div>

                                                        <h4 className="font-semibold">

                                                            {invite
                                                                ?.candidate_name ||
                                                                `Candidate #${submission.invite_id}`}

                                                        </h4>


                                                        <p className="mt-1 text-sm text-gray-500">

                                                            {invite
                                                                ?.candidate_email ||
                                                                "Email unavailable"}

                                                        </p>

                                                    </div>


                                                    <div className="flex items-center gap-4">

                                                        {submission.evaluation ? (

                                                            <div className="text-right">

                                                                <p className="text-lg font-bold">

                                                                    {
                                                                        submission
                                                                            .evaluation
                                                                            .overall_score
                                                                    }

                                                                    <span className="text-sm font-normal text-gray-500">
                                                                        {" "}
                                                                        / 100
                                                                    </span>

                                                                </p>


                                                                <p className="text-xs text-gray-500">
                                                                    AI Evaluated
                                                                </p>

                                                            </div>

                                                        ) : (

                                                            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                                                                Pending
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </div>


                        {/* Assessments */}
                        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

                            <div className="border-b border-white/10 px-7 py-5">

                                <h3 className="text-xl font-semibold">
                                    Your Assessments
                                </h3>

                            </div>


                            {loading ? (

                                <div className="p-10 text-center text-gray-500">
                                    Loading assessments...
                                </div>

                            ) : assessments.length === 0 ? (

                                <div className="p-10 text-center">

                                    <p className="text-gray-400">
                                        No assessments created yet.
                                    </p>


                                    <Link
                                        href="/interviewer/tests/create"
                                        className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500"
                                    >
                                        Create your first assessment
                                    </Link>

                                </div>

                            ) : (

                                <div>

                                    {assessments.map(
                                        (assessment) => (

                                            <div
                                                key={
                                                    assessment.id
                                                }
                                                className="flex flex-col gap-4 border-b border-white/10 px-7 py-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                                            >

                                                <div>

                                                    <h4 className="text-lg font-semibold">
                                                        {
                                                            assessment.title
                                                        }
                                                    </h4>


                                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">

                                                        {assessment.description ||
                                                            "No description provided."}

                                                    </p>

                                                </div>


                                                <div className="flex items-center gap-3">

                                                    <span className="rounded-full bg-white/5 px-4 py-2 text-xs text-gray-400">

                                                        Assessment #

                                                        {
                                                            assessment.id
                                                        }

                                                    </span>


                                                    <Link
                                                        href={`/interviewer/tests/${assessment.id}`}
                                                        className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
                                                    >
                                                        View
                                                    </Link>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* Bottom Actions */}
                        <div className="mt-6 flex flex-wrap gap-3">

                            <Link
                                href="/interviewer/candidates"
                                className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                            >
                                View Candidates
                            </Link>


                            <Link
                                href="/interviewer/reports"
                                className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                            >
                                View Reports
                            </Link>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}


function StatCard({
    title,
    value,
    subtitle,
}: {
    title: string;
    value: number | string;
    subtitle?: string;
}) {

    return (

        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">

            <p className="text-sm text-gray-500">
                {title}
            </p>


            <p className="mt-2 text-4xl font-bold">
                {value}
            </p>


            {subtitle && (
                <p className="mt-2 text-xs text-gray-600">
                    {subtitle}
                </p>
            )}

        </div>

    );
}