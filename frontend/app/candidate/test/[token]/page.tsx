"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Invite = {
    id: number;
    test_id: number;
    candidate_name: string;
    candidate_email: string;
    token: string;
    status: string;
};

type Test = {
    id: number;
    title: string;
    description: string | null;
    interviewer_id: number;
};

type Question = {
    id: number;
    test_id: number;
    question_text: string;
    language: string;
};

export default function CandidateTestPage() {
    const params = useParams();
    const router = useRouter();

    const token = params.token as string;

    const [invite, setInvite] = useState<Invite | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [code, setCode] = useState(
        `def solution():
    # Write your solution here
    pass
`
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [runMessage, setRunMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);


    /*
     * Load invitation → test → questions
     */

    useEffect(() => {
        const loadAssessment = async () => {
            try {
                setLoading(true);
                setError("");

                // 1. Validate invite token

                const inviteResponse = await fetch(
                    `http://127.0.0.1:8000/tests/invites/${token}`
                );

                if (!inviteResponse.ok) {
                    throw new Error(
                        "This invitation link is invalid or expired."
                    );
                }

                const inviteData =
                    await inviteResponse.json();

                setInvite(inviteData);


                // 2. Load assessment

                const testResponse = await fetch(
                    `http://127.0.0.1:8000/tests/${inviteData.test_id}`
                );

                if (!testResponse.ok) {
                    throw new Error(
                        "Unable to load the assessment."
                    );
                }

                const testData =
                    await testResponse.json();

                setTest(testData);


                // 3. Load questions

                const questionsResponse = await fetch(
                    `http://127.0.0.1:8000/tests/${inviteData.test_id}/questions`
                );

                if (!questionsResponse.ok) {
                    throw new Error(
                        "Unable to load assessment questions."
                    );
                }

                const questionData =
                    await questionsResponse.json();

                if (questionData.length === 0) {
                    throw new Error(
                        "This assessment does not contain any questions."
                    );
                }

                setQuestions(questionData);

            } catch (err) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load assessment."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAssessment();
    }, [token]);


    /*
     * Loading state
     */

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">
                <div className="text-center">

                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

                    <p>
                        Loading assessment...
                    </p>

                </div>
            </main>
        );
    }


    /*
     * Error state
     */

    if (error || !invite || !test || questions.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">

                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                        !
                    </div>

                    <h1 className="mt-5 text-xl font-bold">
                        Unable to Open Assessment
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        {error ||
                            "The assessment could not be loaded."}
                    </p>

                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                    >
                        Back to Sign In
                    </button>

                </div>

            </main>
        );
    }


    const question = questions[currentQuestion];

    const language =
        question.language.toLowerCase() === "c++"
            ? "cpp"
            : question.language.toLowerCase() === "text"
              ? "plaintext"
              : question.language.toLowerCase();


    /*
     * Run Code
     *
     * Actual execution will be connected
     * in Milestone 8.
     */

    const handleRunCode = async () => {
    setRunMessage("Running code...");

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/submissions/run",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    code,
                    language: question.language,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail ||
                    "Code execution failed."
            );
        }

        if (result.status === "success") {
            setRunMessage(
                result.stdout ||
                    "Code executed successfully with no output."
            );
        } else {
            setRunMessage(
                result.stderr ||
                    "Code execution failed."
            );
        }

    } catch (err) {
        console.error(err);

        setRunMessage(
            err instanceof Error
                ? err.message
                : "Unable to run code."
        );
    }
};


    /*
     * Submit
     *
     * Actual submission API will be connected
     * in Milestone 8.
     */

    const handleSubmit = async () => {
        if (!invite) {
            setRunMessage(
                "Invalid assessment invitation."
            );

            return;
        }

        if (submitted) {
            return;
        }

        setRunMessage(
            "Submitting solution..."
        );

        try {
            // 1. Save the candidate submission
            const submissionResponse = await fetch(
                "http://127.0.0.1:8000/submissions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        invite_token: invite.token,
                        question_id: question.id,
                        code,
                        language: question.language,
                    }),
                }
            );

            const submission =
                await submissionResponse.json();

            if (!submissionResponse.ok) {
                throw new Error(
                    submission.detail ||
                        "Submission failed."
                );
            }

            // 2. Send the saved submission for AI evaluation
            setRunMessage(
                "Submission saved. AI is analyzing your code..."
            );

            const evaluationResponse = await fetch(
                `http://127.0.0.1:8000/submissions/${submission.id}/evaluate`,
                {
                    method: "POST",
                }
            );

            const evaluation =
                await evaluationResponse.json();

            if (!evaluationResponse.ok) {
                throw new Error(
                    evaluation.detail ||
                        "AI evaluation failed."
                );
            }

            // 3. Store the latest result for the result page
            sessionStorage.setItem(
                "latestEvaluation",
                JSON.stringify({
                    submission,
                    evaluation,
                })
            );

            // 4. Update the candidate page
            setSubmitted(true);

            setRunMessage(
                `Evaluation complete — Score: ${evaluation.overall_score}/100`
            );

            // Automatically open the candidate result page
            setTimeout(() => {
                window.location.href = "/candidate/result";
            }, 800);
        } catch (err) {
            console.error(err);

            setRunMessage(
                err instanceof Error
                    ? err.message
                    : "Unable to submit solution."
            );
        }
    };


    /*
     * Question navigation
     */

    const goToQuestion = (index: number) => {
        setCurrentQuestion(index);

        setRunMessage("");

        setSubmitted(false);

        setCode(
            `def solution():
    # Write your solution here
    pass
`
        );
    };


    return (
        <main className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-6">

                <div className="flex items-center gap-4">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
                        C
                    </div>

                    <div>

                        <h1 className="text-sm font-semibold">
                            CodeAssess
                        </h1>

                        <p className="text-xs text-gray-500">
                            {test.title}
                        </p>

                    </div>

                </div>


                <div className="flex items-center gap-5">

                    <div className="hidden text-right sm:block">

                        <p className="text-sm font-medium">
                            {invite.candidate_name}
                        </p>

                        <p className="text-xs text-gray-500">
                            Candidate
                        </p>

                    </div>


                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                        {invite.candidate_name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                </div>

            </header>


            {/* ================================================= */}
            {/* QUESTION NAVIGATION */}
            {/* ================================================= */}

            <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-white/10 px-6">

                <div className="flex items-center gap-2 overflow-x-auto">

                    {questions.map(
                        (item, index) => (

                            <button
                                key={item.id}
                                onClick={() =>
                                    goToQuestion(index)
                                }
                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition ${
                                    currentQuestion === index
                                        ? "bg-blue-600 text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {index + 1}
                            </button>

                        )
                    )}

                </div>


                <div className="hidden text-sm text-gray-500 sm:block">

                    Question{" "}
                    <span className="text-white">
                        {currentQuestion + 1}
                    </span>{" "}
                    of{" "}
                    <span className="text-white">
                        {questions.length}
                    </span>

                </div>

            </div>


            {/* ================================================= */}
            {/* MAIN SPLIT SCREEN */}
            {/* ================================================= */}

            <div className="grid min-h-0 flex-1 lg:grid-cols-2">


                {/* ================================================= */}
                {/* LEFT — QUESTION */}
                {/* ================================================= */}

                <section className="overflow-y-auto border-b border-white/10 p-6 lg:border-b-0 lg:border-r lg:p-8">

                    <div className="mx-auto max-w-2xl">

                        <div className="flex items-center justify-between">

                            <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-400">
                                Question {currentQuestion + 1}
                            </span>

                            <span className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-400">
                                {question.language}
                            </span>

                        </div>


                        <h2 className="mt-6 text-2xl font-bold">
                            Coding Problem
                        </h2>


                        <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                            {question.question_text}
                        </div>


                        <div className="mt-8 rounded-xl border border-white/10 bg-[#111111] p-5">

                            <h3 className="text-sm font-semibold text-white">
                                Assessment Information
                            </h3>

                            <div className="mt-4 space-y-3 text-sm">

                                <div className="flex justify-between gap-4">

                                    <span className="text-gray-500">
                                        Assessment
                                    </span>

                                    <span className="text-right text-gray-300">
                                        {test.title}
                                    </span>

                                </div>


                                <div className="flex justify-between gap-4">

                                    <span className="text-gray-500">
                                        Language
                                    </span>

                                    <span className="text-gray-300">
                                        {question.language}
                                    </span>

                                </div>


                                <div className="flex justify-between gap-4">

                                    <span className="text-gray-500">
                                        Candidate
                                    </span>

                                    <span className="text-gray-300">
                                        {invite.candidate_name}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* RIGHT — CODE EDITOR */}
                {/* ================================================= */}

                <section className="flex min-h-[600px] flex-col bg-[#0d0d0d]">


                    {/* Editor header */}

                    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">

                        <div className="flex items-center gap-3">

                            <span className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="h-3 w-3 rounded-full bg-yellow-500" />
                            <span className="h-3 w-3 rounded-full bg-green-500" />

                            <span className="ml-2 text-xs text-gray-500">
                                solution.
                                {language === "cpp"
                                    ? "cpp"
                                    : language === "java"
                                      ? "java"
                                      : language === "python"
                                        ? "py"
                                        : "txt"}
                            </span>

                        </div>


                        <span className="rounded-md bg-white/5 px-3 py-1 text-xs text-gray-400">
                            {question.language}
                        </span>

                    </div>


                    {/* Monaco */}

                    <div className="min-h-0 flex-1">

                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) =>
                                setCode(value || "")
                            }
                            options={{
                                fontSize: 14,

                                minimap: {
                                    enabled: false,
                                },

                                automaticLayout: true,

                                scrollBeyondLastLine: false,

                                padding: {
                                    top: 16,
                                    bottom: 16,
                                },

                                tabSize: 4,

                                wordWrap: "on",

                                lineNumbers: "on",

                                folding: true,

                                renderWhitespace: "selection",
                            }}
                        />

                    </div>


                    {/* Output message */}

                    {runMessage && (

                        <div className="border-t border-white/10 bg-[#111111] px-4 py-3">

                            <p className="text-xs text-gray-400">
                                {runMessage}
                            </p>

                        </div>

                    )}


                    {/* Editor actions */}

                    <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#111111] px-4 py-4">

                        <div className="text-xs text-gray-600">
                            Changes are saved locally until submission.
                        </div>


                        <div className="flex gap-3">

                            <button
                                onClick={handleRunCode}
                                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
                            >
                                ▶ Run Code
                            </button>


                            <button
                                onClick={handleSubmit}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
                            >
                                {submitted
                                    ? "Submitted"
                                    : "Submit Solution"}
                            </button>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}