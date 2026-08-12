"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

type Assessment = {
    id: number;
    title: string;
    description: string | null;
    interviewer_id: number;
};

type CandidateRow = {
    invite_id: number;
    test_id: number;
    test_title: string;
    candidate_name: string;
    candidate_email: string;
    profile_id: string | null;
    scheduled_at: string | null;
    token: string;
    status: string;
    question_count: number;
    submitted_count: number;
    average_score: number | null;
    latest_submission_id: number | null;
};

export default function InterviewerDashboard() {
    const [assessments, setAssessments] = useState<
        Assessment[]
    >([]);

    const [candidateRows, setCandidateRows] = useState<
        CandidateRow[]
    >([]);

    const [search, setSearch] = useState("");
    const [copiedToken, setCopiedToken] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [interviewerName, setInterviewerName] =
        useState("Interviewer");

    const router = useRouter();


    useEffect(() => {
        loadDashboard();

        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);

                if (user.role === "interviewer" && user.name) {
                    setInterviewerName(user.name);
                }
            } catch {
                // ignore malformed local storage
            }
        }
    }, []);


    const handleSignOut = () => {
        localStorage.removeItem("user");
        router.push("/");
    };


    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                testsResponse,
                candidatesResponse,
            ] = await Promise.all([
                fetch(
                    `${API_URL}/tests`,
                    {
                        cache: "no-store",
                    }
                ),

                fetch(
                    `${API_URL}/tests/candidates/overview`,
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


            if (!candidatesResponse.ok) {
                throw new Error(
                    "Unable to load candidate data."
                );
            }


            const testsData =
                await testsResponse.json();

            const candidatesData =
                await candidatesResponse.json();


            setAssessments(
                Array.isArray(testsData)
                    ? testsData
                    : []
            );


            setCandidateRows(
                Array.isArray(candidatesData)
                    ? candidatesData
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


    const reportCount = useMemo(() => {
        return candidateRows.filter(
            (row) => row.average_score !== null
        ).length;
    }, [candidateRows]);


    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return candidateRows;
        }

        return candidateRows.filter((row) =>
            [
                row.candidate_name,
                row.candidate_email,
                row.profile_id ?? "",
                row.test_title,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [candidateRows, search]);


    const copyInviteLink = (token: string) => {
        const link = `${window.location.origin}/candidate/test/${token}`;

        navigator.clipboard.writeText(link);

        setCopiedToken(token);

        setTimeout(() => {
            setCopiedToken((current) =>
                current === token ? "" : current
            );
        }, 1500);
    };


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
                            {interviewerName}
                        </span>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold">
                            {interviewerName.charAt(0).toUpperCase()}
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="text-sm text-gray-400 transition hover:text-white"
                        >
                            Sign Out
                        </button>

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
                                    Create tests, invite candidates,
                                    and track results.
                                </p>

                            </div>


                            <Link
                                href="/interviewer/tests/create"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                            >
                                + Create Test
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
                                        : candidateRows.length
                                }
                                subtitle="Invited candidates"
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


                        {/* Candidates table */}
                        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

                            <div className="flex flex-col gap-4 border-b border-white/10 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h3 className="text-xl font-semibold">
                                        Candidates
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Every invited candidate across
                                        all assessments.
                                    </p>

                                </div>


                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search user, email, or test..."
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 sm:w-72"
                                />

                            </div>


                            {loading ? (

                                <div className="p-10 text-center text-gray-500">
                                    Loading candidates...
                                </div>

                            ) : filteredRows.length === 0 ? (

                                <div className="p-10 text-center">

                                    <p className="text-gray-400">
                                        {candidateRows.length === 0
                                            ? "No candidates invited yet."
                                            : "No candidates match your search."}
                                    </p>

                                    {candidateRows.length === 0 && (
                                        <p className="mt-2 text-sm text-gray-600">
                                            Open an assessment below
                                            and generate an invite
                                            link to get started.
                                        </p>
                                    )}

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full">

                                        <thead>
                                            <tr className="border-b border-white/10 text-left text-sm text-gray-500">

                                                <th className="px-6 py-4 font-medium">
                                                    Test Name
                                                </th>

                                                <th className="px-6 py-4 font-medium">
                                                    User Details
                                                </th>

                                                <th className="px-6 py-4 font-medium">
                                                    Questions
                                                </th>

                                                <th className="px-6 py-4 font-medium">
                                                    Invite Link
                                                </th>

                                                <th className="px-6 py-4 font-medium">
                                                    Join Link
                                                </th>

                                                <th className="px-6 py-4 font-medium">
                                                    Score
                                                </th>

                                                <th className="px-6 py-4 font-medium">
                                                    Report
                                                </th>

                                            </tr>
                                        </thead>


                                        <tbody>

                                            {filteredRows.map(
                                                (row) => (

                                                    <tr
                                                        key={
                                                            row.invite_id
                                                        }
                                                        className="border-b border-white/5 transition hover:bg-white/[0.03]"
                                                    >

                                                        <td className="px-6 py-5 font-medium">
                                                            {
                                                                row.test_title
                                                            }
                                                        </td>


                                                        <td className="px-6 py-5">
                                                            <div>
                                                                {
                                                                    row.candidate_name
                                                                }
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    row.candidate_email
                                                                }
                                                            </div>
                                                            {row.profile_id && (
                                                                <div className="mt-1 text-xs text-gray-600">
                                                                    ID: {row.profile_id}
                                                                </div>
                                                            )}
                                                            {row.scheduled_at && (
                                                                <div className="mt-1 text-xs text-gray-600">
                                                                    {new Date(
                                                                        row.scheduled_at
                                                                    ).toLocaleString(
                                                                        undefined,
                                                                        {
                                                                            dateStyle: "medium",
                                                                            timeStyle: "short",
                                                                        }
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>


                                                        <td className="px-6 py-5 text-gray-400">
                                                            {
                                                                row.question_count
                                                            }
                                                        </td>


                                                        <td className="px-6 py-5">
                                                            <button
                                                                onClick={() =>
                                                                    copyInviteLink(
                                                                        row.token
                                                                    )
                                                                }
                                                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                                                            >
                                                                {copiedToken ===
                                                                row.token
                                                                    ? "Copied!"
                                                                    : "Copy link"}
                                                            </button>
                                                        </td>


                                                        <td className="px-6 py-5">
                                                            <Link
                                                                href={`/interviewer/tests/${row.test_id}`}
                                                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                                                            >
                                                                Manage
                                                            </Link>
                                                        </td>


                                                        <td className="px-6 py-5">
                                                            {row.average_score !==
                                                            null ? (
                                                                <span className="font-bold">
                                                                    {
                                                                        row.average_score
                                                                    }
                                                                    <span className="font-normal text-gray-500">
                                                                        {" "}
                                                                        / 100
                                                                    </span>
                                                                </span>
                                                            ) : row.submitted_count >
                                                              0 ? (
                                                                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                                                                    Evaluating
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500">
                                                                    Not started
                                                                </span>
                                                            )}
                                                        </td>


                                                        <td className="px-6 py-5">
                                                            {row.latest_submission_id !==
                                                            null ? (
                                                                <a
                                                                    href={`${API_URL}/submissions/${row.latest_submission_id}/report`}
                                                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                                                                >
                                                                    Download
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-600">
                                                                    —
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


                        {/* Assessments quick access */}
                        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

                            <div className="border-b border-white/10 px-7 py-5">

                                <h3 className="text-lg font-semibold">
                                    Your Assessments
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Open an assessment to add
                                    questions or invite candidates.
                                </p>

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
                                                className="flex flex-col gap-4 border-b border-white/10 px-7 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                                            >

                                                <div>

                                                    <h4 className="text-sm font-semibold">
                                                        {
                                                            assessment.title
                                                        }
                                                    </h4>

                                                    <p className="mt-1 max-w-2xl text-xs text-gray-500">

                                                        {assessment.description ||
                                                            "No description provided."}

                                                    </p>

                                                </div>


                                                <Link
                                                    href={`/interviewer/tests/${assessment.id}`}
                                                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium transition hover:bg-white/5"
                                                >
                                                    Manage
                                                </Link>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

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
