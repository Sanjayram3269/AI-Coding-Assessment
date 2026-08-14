"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

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
    const [candidateRows, setCandidateRows] = useState<
        CandidateRow[]
    >([]);

    const [search, setSearch] = useState("");
    const [copiedToken, setCopiedToken] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [interviewerName, setInterviewerName] =
        useState("Interviewer");

    // Create Test modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [testName, setTestName] = useState("");
    const [candidateName, setCandidateName] = useState("");
    const [candidateEmail, setCandidateEmail] = useState("");
    const [profileId, setProfileId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createdLinks, setCreatedLinks] = useState<{
        testId: number;
        inviteLink: string;
        joinLink: string;
    } | null>(null);

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

            const candidatesResponse = await fetch(
                `${API_URL}/tests/candidates/overview`,
                {
                    cache: "no-store",
                }
            );

            if (!candidatesResponse.ok) {
                throw new Error(
                    "Unable to load candidate data."
                );
            }

            const candidatesData =
                await candidatesResponse.json();

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


    const copyLink = (link: string, key: string) => {
        navigator.clipboard.writeText(link);

        setCopiedToken(key);

        setTimeout(() => {
            setCopiedToken((current) =>
                current === key ? "" : current
            );
        }, 1500);
    };


    const openCreateModal = () => {
        setTestName("");
        setCandidateName("");
        setCandidateEmail("");
        setProfileId("");
        setScheduledAt("");
        setCreateError("");
        setCreatedLinks(null);
        setShowCreateModal(true);
    };


    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreatedLinks(null);

        if (createdLinks) {
            loadDashboard();
        }
    };


    /*
     * Creates the test and the candidate invite in a single
     * step — the coding question itself is added afterward by
     * the interviewer from the "Join link" on the new row.
     */
    const handleCreateTest = async () => {
        setCreateError("");

        if (!testName.trim()) {
            setCreateError("Please enter a test name.");
            return;
        }

        if (!candidateName.trim()) {
            setCreateError("Please enter the candidate's name.");
            return;
        }

        if (!candidateEmail.trim()) {
            setCreateError("Please enter the candidate's email.");
            return;
        }

        try {
            setCreating(true);

            const userData = localStorage.getItem("user");

            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.role !== "interviewer") {
                        router.push("/");
                        return;
                    }
                } catch {
                    // ignore malformed local storage
                }
            }

            const testResponse = await fetch(
                `${API_URL}/tests`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: testName.trim(),
                        description: null,
                        interviewer_id: 1,
                    }),
                }
            );

            if (!testResponse.ok) {
                throw new Error("Failed to create test.");
            }

            const test = await testResponse.json();

            const inviteResponse = await fetch(
                `${API_URL}/tests/${test.id}/invites`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        candidate_name: candidateName.trim(),
                        candidate_email: candidateEmail.trim(),
                        profile_id: profileId.trim() || null,
                        scheduled_at: scheduledAt || null,
                    }),
                }
            );

            if (!inviteResponse.ok) {
                throw new Error("Failed to invite candidate.");
            }

            const invite = await inviteResponse.json();

            setCreatedLinks({
                testId: test.id,
                inviteLink: `${window.location.origin}/candidate/test/${invite.token}`,
                joinLink: `${window.location.origin}/interviewer/tests/${test.id}`,
            });

        } catch (err) {
            console.error(err);

            setCreateError(
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

                <div className="flex items-center justify-between px-6 py-5 lg:px-10">

                    <div>

                        <h1 className="text-2xl font-bold">
                            CodeAssess
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Interviewer Dashboard
                        </p>

                    </div>


                    <div className="flex items-center gap-5">

                        <Link
                            href="/interviewer/candidates"
                            className="hidden text-sm text-gray-400 transition hover:text-white sm:block"
                        >
                            Candidates
                        </Link>

                        <Link
                            href="/interviewer/reports"
                            className="hidden text-sm text-gray-400 transition hover:text-white sm:block"
                        >
                            Reports
                        </Link>

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


            {/* Main */}
            <section className="px-6 py-8 lg:px-10">

                <div className="mx-auto max-w-6xl">

                    {/* Top row: Create Test + Search user */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                        >
                            + Create Test
                        </button>

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search user..."
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500 sm:w-72"
                        />

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                            {error}
                        </div>
                    )}


                    {/* Unified table */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

                        {loading ? (

                            <div className="p-10 text-center text-gray-500">
                                Loading...
                            </div>

                        ) : filteredRows.length === 0 ? (

                            <div className="p-10 text-center">

                                <p className="text-gray-400">
                                    {candidateRows.length === 0
                                        ? "No tests created yet."
                                        : "No results match your search."}
                                </p>

                                {candidateRows.length === 0 && (
                                    <button
                                        onClick={openCreateModal}
                                        className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-500"
                                    >
                                        Create your first test
                                    </button>
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
                                                Total Question Asked
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Invite Link
                                                <span className="block font-normal text-gray-600">
                                                    (only for user)
                                                </span>
                                            </th>

                                            <th className="px-6 py-4 font-medium">
                                                Join Link
                                                <span className="block font-normal text-gray-600">
                                                    (only for interviewer)
                                                </span>
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
                                                    key={row.invite_id}
                                                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                                                >

                                                    <td className="px-6 py-5 font-medium">
                                                        {row.test_title}
                                                    </td>


                                                    <td className="px-6 py-5">
                                                        <div>
                                                            {row.candidate_name}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {row.candidate_email}
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
                                                        {row.question_count}
                                                    </td>


                                                    <td className="px-6 py-5">
                                                        <button
                                                            onClick={() =>
                                                                copyLink(
                                                                    `${window.location.origin}/candidate/test/${row.token}`,
                                                                    `invite-${row.token}`
                                                                )
                                                            }
                                                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                                                        >
                                                            {copiedToken ===
                                                            `invite-${row.token}`
                                                                ? "Copied!"
                                                                : "Copy link"}
                                                        </button>
                                                    </td>


                                                    <td className="px-6 py-5">
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={`/interviewer/tests/${row.test_id}`}
                                                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                                                            >
                                                                Join
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    copyLink(
                                                                        `${window.location.origin}/interviewer/tests/${row.test_id}`,
                                                                        `join-${row.test_id}`
                                                                    )
                                                                }
                                                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
                                                            >
                                                                {copiedToken ===
                                                                `join-${row.test_id}`
                                                                    ? "Copied!"
                                                                    : "Copy"}
                                                            </button>
                                                        </div>
                                                    </td>


                                                    <td className="px-6 py-5">
                                                        {row.average_score !==
                                                        null ? (
                                                            <span className="font-bold">
                                                                {row.average_score}
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

                </div>

            </section>


            {/* Create Test modal */}
            {showCreateModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-7">

                        {createdLinks ? (

                            <>
                                <h3 className="text-lg font-semibold text-green-400">
                                    Test created
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    Share the invite link with the candidate,
                                    and use the join link yourself to add the
                                    question.
                                </p>

                                <div className="mt-5 space-y-4">

                                    <div>
                                        <label className="text-xs text-gray-500">
                                            Invite link (candidate)
                                        </label>
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                readOnly
                                                value={createdLinks.inviteLink}
                                                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 outline-none"
                                            />
                                            <button
                                                onClick={() =>
                                                    copyLink(
                                                        createdLinks.inviteLink,
                                                        "modal-invite"
                                                    )
                                                }
                                                className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/5"
                                            >
                                                {copiedToken === "modal-invite"
                                                    ? "Copied!"
                                                    : "Copy"}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500">
                                            Join link (you)
                                        </label>
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                readOnly
                                                value={createdLinks.joinLink}
                                                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 outline-none"
                                            />
                                            <button
                                                onClick={() =>
                                                    copyLink(
                                                        createdLinks.joinLink,
                                                        "modal-join"
                                                    )
                                                }
                                                className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/5"
                                            >
                                                {copiedToken === "modal-join"
                                                    ? "Copied!"
                                                    : "Copy"}
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={closeCreateModal}
                                        className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
                                    >
                                        Done
                                    </button>

                                    <Link
                                        href={`/interviewer/tests/${createdLinks.testId}`}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                                    >
                                        Add question now
                                    </Link>
                                </div>
                            </>

                        ) : (

                            <>
                                <h3 className="text-lg font-semibold">
                                    Create Test
                                </h3>

                                <div className="mt-5 space-y-4">

                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Test name
                                        </label>
                                        <input
                                            value={testName}
                                            onChange={(event) =>
                                                setTestName(event.target.value)
                                            }
                                            placeholder="e.g. Python Developer Assessment"
                                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400">
                                            User details
                                        </label>
                                        <div className="mt-2 grid grid-cols-2 gap-3">
                                            <input
                                                value={candidateName}
                                                onChange={(event) =>
                                                    setCandidateName(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Candidate name"
                                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                                            />
                                            <input
                                                type="email"
                                                value={candidateEmail}
                                                onChange={(event) =>
                                                    setCandidateEmail(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Candidate email"
                                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Time and date{" "}
                                            <span className="text-gray-600">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(event) =>
                                                setScheduledAt(
                                                    event.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500 [color-scheme:dark]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Profile id{" "}
                                            <span className="text-gray-600">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            value={profileId}
                                            onChange={(event) =>
                                                setProfileId(event.target.value)
                                            }
                                            placeholder="Your internal reference/ID"
                                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                                        />
                                    </div>

                                </div>

                                {createError && (
                                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {createError}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                        className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium transition hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleCreateTest}
                                        disabled={creating}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {creating ? "Creating..." : "Submit"}
                                    </button>
                                </div>
                            </>

                        )}

                    </div>

                </div>

            )}

        </main>
    );
}
