"use client";

import { useEffect, useState } from "react";

export default function CandidateTestPage() {
    const [userName, setUserName] = useState("Candidate");

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            const user = JSON.parse(savedUser);

            if (user.role !== "candidate") {
                window.location.href = "/";
                return;
            }

            setUserName(user.name);
        }
    }, []);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            <header className="border-b border-white/10">

                <div className="flex items-center justify-between px-8 py-5">

                    <div>
                        <h1 className="text-xl font-bold">
                            CodeAssess
                        </h1>

                        <p className="mt-1 text-xs text-gray-500">
                            Coding Assessment
                        </p>
                    </div>

                    <div className="text-sm text-gray-400">
                        {userName}
                    </div>

                </div>

            </header>


            <div className="grid min-h-[calc(100vh-85px)] lg:grid-cols-2">

                {/* Question */}

                <section className="border-r border-white/10 p-8">

                    <div className="mb-8 flex items-center justify-between">

                        <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs text-blue-400">
                            Question 1 of 1
                        </span>

                        <span className="text-sm text-gray-500">
                            Python
                        </span>

                    </div>


                    <h2 className="text-2xl font-bold">
                        Find Duplicate Elements
                    </h2>

                    <div className="mt-6 space-y-5 text-sm leading-7 text-gray-400">

                        <p>
                            Write a Python function that finds all
                            duplicate elements in a list.
                        </p>

                        <div>

                            <h3 className="font-semibold text-white">
                                Example
                            </h3>

                            <pre className="mt-3 rounded-lg bg-white/5 p-4 text-gray-300">
{`Input:
[1, 2, 3, 2, 4, 1]

Output:
[1, 2]`}
                            </pre>

                        </div>

                        <div>

                            <h3 className="font-semibold text-white">
                                Requirements
                            </h3>

                            <ul className="mt-3 list-disc space-y-2 pl-5">
                                <li>Return each duplicate only once.</li>
                                <li>Maintain reasonable efficiency.</li>
                                <li>Handle an empty list.</li>
                            </ul>

                        </div>

                    </div>

                </section>


                {/* Editor */}

                <section className="flex flex-col p-6">

                    <div className="mb-4 flex items-center justify-between">

                        <h3 className="font-semibold">
                            Your Solution
                        </h3>

                        <span className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-400">
                            Python
                        </span>

                    </div>


                    <textarea
                        defaultValue={`def find_duplicates(numbers):
    duplicates = []

    for number in numbers:
        if numbers.count(number) > 1 and number not in duplicates:
            duplicates.append(number)

    return duplicates
`}
                        className="min-h-[500px] flex-1 resize-none rounded-xl border border-white/10 bg-[#111111] p-5 font-mono text-sm leading-6 text-gray-200 outline-none focus:border-blue-500"
                        spellCheck={false}
                    />


                    <div className="mt-4 flex justify-end gap-3">

                        <button className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10">
                            Run Code
                        </button>

                        <button className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500">
                            Submit Solution
                        </button>

                    </div>

                </section>

            </div>

        </main>
    );
}