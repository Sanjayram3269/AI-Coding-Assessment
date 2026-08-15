"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

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

type QuestionResult = {
    questionId: number;
    questionIndex: number;
    questionText: string;
    language: string;
    submission: {
        id: number;
        code: string;
        language: string;
        stdout: string | null;
        stderr: string | null;
        execution_time_ms: number | null;
    };
    evaluation: {
        overall_score: number;
        correctness_score: number;
        efficiency_score: number;
        code_quality_score: number;
        is_correct: boolean;
        time_complexity: string;
        space_complexity: string;
        detected_issues: string[];
        strengths: string[];
        improvements: string[];
        explanation: string;
    };
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

    const [stdin, setStdin] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [runMessage, setRunMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [submittedResults, setSubmittedResults] = useState<
        Record<number, QuestionResult>
    >({});


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
                    `${API_URL}/tests/invites/${token}`
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
                    `${API_URL}/tests/${inviteData.test_id}`
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
                    `${API_URL}/tests/${inviteData.test_id}/questions`
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

    const canRunCode =
        question.language.toLowerCase() === "python";


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
            `${API_URL}/submissions/run`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    code,
                    language: question.language,
                    stdin,
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
     * Submit the current question's solution.
     *
     * Assessments can have multiple questions, so this only
     * records the result for this question — it does not end
     * the assessment. The candidate finishes explicitly via
     * finishAssessment() once they're done with all questions
     * they want to answer.
     */

    const handleSubmit = async () => {
        if (!invite) {
            setRunMessage(
                "Invalid assessment invitation."
            );

            return;
        }

        if (submitting) {
            return;
        }

        setSubmitting(true);

        setRunMessage(
            "Submitting solution..."
        );

        try {
            // 1. Save the candidate submission
            const submissionResponse = await fetch(
                `${API_URL}/submissions`,
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
                        stdin,
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
                `${API_URL}/submissions/${submission.id}/evaluate`,
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

            // 3. Record this question's result locally
            setSubmittedResults((current) => ({
                ...current,
                [question.id]: {
                    questionId: question.id,
                    questionIndex: currentQuestion,
                    questionText: question.question_text,
                    language: question.language,
                    submission,
                    evaluation,
                },
            }));

            const isLastQuestion =
                currentQuestion === questions.length - 1;

            setRunMessage(
                `Evaluation complete — Score: ${evaluation.overall_score}/100. ` +
                    (isLastQuestion
                        ? "You can finish the assessment now."
                        : "Move to the next question, or finish the assessment when you're done.")
            );
        } catch (err) {
            console.error(err);

            setRunMessage(
                err instanceof Error
                    ? err.message
                    : "Unable to submit solution."
            );
        } finally {
            setSubmitting(false);
        }
    };


    /*
     * Finish the assessment.
     *
     * Bundles every question the candidate submitted a result
     * for into one combined report and hands off to the result
     * page. Questions left unanswered are simply excluded.
     */

    const finishAssessment = () => {
        const results = Object.values(submittedResults).sort(
            (a, b) => a.questionIndex - b.questionIndex
        );

        if (results.length === 0 || !invite || !test) {
            return;
        }

        sessionStorage.setItem(
            "assessmentResults",
            JSON.stringify({
                testTitle: test.title,
                candidateName: invite.candidate_name,
                totalQuestions: questions.length,
                results,
            })
        );

        window.location.href = "/candidate/result";
    };


    /*
     * Question navigation
     */

    const goToQuestion = (index: number) => {
        setCurrentQuestion(index);

        setRunMessage("");
        setStdin("");

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

            <div className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-white/10 px-6">

                <div className="flex items-center gap-2 overflow-x-auto">

                    {questions.map(
                        (item, index) => {
                            const isAnswered = Boolean(
                                submittedResults[item.id]
                            );

                            return (
                                <button
                                    key={item.id}
                                    onClick={() =>
                                        goToQuestion(index)
                                    }
                                    title={
                                        isAnswered
                                            ? "Answered"
                                            : undefined
                                    }
                                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm transition ${
                                        currentQuestion === index
                                            ? "bg-blue-600 text-white"
                                            : isAnswered
                                              ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    {isAnswered
                                        ? "✓"
                                        : index + 1}
                                </button>
                            );
                        }
                    )}

                </div>


                <div className="flex shrink-0 items-center gap-4">

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

                    <button
                        onClick={finishAssessment}
                        disabled={
                            Object.keys(submittedResults)
                                .length === 0
                        }
                        className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Finish Assessment (
                        {
                            Object.keys(submittedResults)
                                .length
                        }
                        /{questions.length})
                    </button>

                </div>

            </div>


            {/* ================================================= */}
            {/* STACKED LAYOUT — QUESTION / LANGUAGE / SOLUTION */}
            {/* ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">

                    {/* Question — only for interviewer */}
                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6">

                        <div className="flex items-center justify-between">

                            <label className="text-sm font-semibold text-gray-300">
                                Question{" "}
                                <span className="font-normal text-gray-600">
                                    (only for interviewer)
                                </span>
                            </label>

                            <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-400">
                                Question {currentQuestion + 1}
                            </span>

                        </div>

                        <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                            {question.question_text}
                        </div>

                    </div>

                    {/* Select Language */}
                    <div className="mt-5 flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                            Select Language (Text, Python, C++, Java)
                        </span>

                        <span className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                            {question.language}
                        </span>
                    </div>

                    {/* Solution — only for user */}
                    <div className="mt-5 flex flex-col rounded-xl border border-white/10 bg-[#0d0d0d]">

                        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">

                            <label className="text-sm font-semibold text-gray-300">
                                Solution{" "}
                                <span className="font-normal text-gray-600">
                                    (only for user)
                                </span>
                            </label>

                            <span className="text-xs text-gray-500">
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

                        <div className="h-[420px]">
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

                        {/* Program input — only relevant if the code reads from stdin */}

                        {canRunCode && (

                            <div className="border-t border-white/10 px-4 py-3">

                                <label className="text-xs text-gray-500">
                                    Program input{" "}
                                    <span className="text-gray-600">
                                        (optional — one value per line, for
                                        code that uses input())
                                    </span>
                                </label>

                                <textarea
                                    value={stdin}
                                    onChange={(event) =>
                                        setStdin(event.target.value)
                                    }
                                    placeholder={"5\n3\n9\n1\n7"}
                                    rows={2}
                                    className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-gray-300 outline-none transition focus:border-blue-500"
                                />

                            </div>

                        )}

                        {/* Non-runnable language notice */}

                        {!canRunCode && (

                            <div className="border-t border-white/10 bg-yellow-500/5 px-4 py-3">

                                <p className="text-xs text-yellow-400">
                                    Only Python code can be auto-executed
                                    right now. You can still submit your{" "}
                                    {question.language} solution — the AI
                                    will review it directly.
                                </p>

                            </div>

                        )}

                        {/* Output message */}

                        {runMessage && (

                            <div className="border-t border-white/10 bg-[#111111] px-4 py-3">

                                <pre className="whitespace-pre-wrap break-words font-mono text-xs text-gray-400">
                                    {runMessage}
                                </pre>

                            </div>

                        )}

                    </div>

                    {/* Actions */}

                    <div className="mt-5 flex items-center justify-between">

                        <div className="text-xs text-gray-600">
                            Changes are saved locally until submission.
                        </div>

                        <div className="flex gap-3">

                            <button
                                onClick={handleRunCode}
                                disabled={!canRunCode}
                                title={
                                    canRunCode
                                        ? undefined
                                        : "Only Python code can be run automatically."
                                }
                                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5"
                            >
                                ▶ Run Code
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="rounded-lg bg-blue-600 px-7 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : submittedResults[
                                          question.id
                                      ]
                                      ? "Resubmit"
                                      : "Submit"}
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}