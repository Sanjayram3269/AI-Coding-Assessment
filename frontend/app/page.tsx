"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [role, setRole] = useState<"candidate" | "interviewer">(
        "candidate"
    );

    const handleSignIn = () => {
        if (!name.trim()) {
            return;
        }

        localStorage.setItem(
            "user",
            JSON.stringify({
                name: name.trim(),
                role,
            })
        );

        if (role === "interviewer") {
            router.push("/interviewer/dashboard");
        } else {
            router.push("/candidate/test");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">

            <div className="w-full max-w-md">

                <div className="mb-10 text-center">

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
                        C
                    </div>

                    <h1 className="text-4xl font-bold">
                        CodeAssess
                    </h1>

                    <p className="mt-3 text-gray-400">
                        AI-powered coding assessments
                    </p>

                </div>


                <div className="rounded-2xl border border-white/10 bg-[#111111] p-7">

                    <h2 className="text-xl font-semibold">
                        Sign in
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Enter your details to continue.
                    </p>


                    <div className="mt-6">

                        <label className="text-sm text-gray-400">
                            Name
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter your name"
                            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                        />

                    </div>


                    <div className="mt-5">

                        <label className="text-sm text-gray-400">
                            Continue as
                        </label>

                        <div className="mt-2 grid grid-cols-2 gap-3">

                            <button
                                onClick={() => setRole("candidate")}
                                className={`rounded-lg border px-4 py-3 text-sm transition ${
                                    role === "candidate"
                                        ? "border-blue-500 bg-blue-600/10 text-white"
                                        : "border-white/10 text-gray-400 hover:bg-white/5"
                                }`}
                            >
                                Candidate
                            </button>

                            <button
                                onClick={() => setRole("interviewer")}
                                className={`rounded-lg border px-4 py-3 text-sm transition ${
                                    role === "interviewer"
                                        ? "border-blue-500 bg-blue-600/10 text-white"
                                        : "border-white/10 text-gray-400 hover:bg-white/5"
                                }`}
                            >
                                Interviewer
                            </button>

                        </div>

                    </div>


                    <button
                        onClick={handleSignIn}
                        disabled={!name.trim()}
                        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Continue
                    </button>


                    <div className="my-6 flex items-center gap-3">

                        <div className="h-px flex-1 bg-white/10" />

                        <span className="text-xs text-gray-600">
                            DEMO LOGIN
                        </span>

                        <div className="h-px flex-1 bg-white/10" />

                    </div>


                    <button
                        disabled
                        className="w-full rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-500"
                    >
                        Continue with Google — Coming Soon
                    </button>

                </div>


                <p className="mt-6 text-center text-xs text-gray-600">
                    Secure coding assessment platform
                </p>

            </div>

        </main>
    );
}