"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function extractToken(input: string): string {
    const trimmed = input.trim();

    if (!trimmed) {
        return "";
    }

    const match = trimmed.match(
        /\/candidate\/test\/([^/?#]+)/
    );

    if (match) {
        return match[1];
    }

    return trimmed;
}

export default function CandidateJoinPage() {
    const router = useRouter();

    const [userName, setUserName] = useState("");
    const [linkOrToken, setLinkOrToken] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            const user = JSON.parse(savedUser);

            if (user.role === "candidate") {
                setUserName(user.name);
            }
        }
    }, []);

    const handleContinue = () => {
        const token = extractToken(linkOrToken);

        if (!token) {
            setError(
                "Please paste the invite link or code your interviewer sent you."
            );
            return;
        }

        router.push(`/candidate/test/${token}`);
    };

    return (
        <main className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">

            <header className="border-b border-white/10">
                <div className="flex items-center justify-between px-8 py-5">
                    <div>
                        <h1 className="text-xl font-bold">
                            CodeAssess
                        </h1>

                        <p className="mt-1 text-xs text-gray-500">
                            Candidate Access
                        </p>
                    </div>

                    {userName && (
                        <div className="text-sm text-gray-400">
                            {userName}
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center px-6">

                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-8">

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
                        C
                    </div>

                    <h2 className="text-center text-2xl font-bold">
                        Join Your Assessment
                    </h2>

                    <p className="mt-3 text-center text-sm leading-6 text-gray-400">
                        You need an invitation link from your
                        interviewer to start a coding assessment.
                        Paste the link, or just the invite code,
                        below.
                    </p>

                    <div className="mt-6">
                        <label className="text-sm text-gray-400">
                            Invitation link or code
                        </label>

                        <input
                            value={linkOrToken}
                            onChange={(event) => {
                                setLinkOrToken(event.target.value);
                                setError("");
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleContinue();
                                }
                            }}
                            placeholder="https://.../candidate/test/xxxxxxxx"
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="mt-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleContinue}
                        disabled={!linkOrToken.trim()}
                        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Open Assessment
                    </button>

                    <p className="mt-6 text-center text-xs text-gray-600">
                        Haven&apos;t received a link? Ask your
                        interviewer to invite you from their
                        dashboard.
                    </p>

                </div>

            </div>

        </main>
    );
}
