"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/*
 * Test creation now happens in one step from the dashboard's
 * "Create Test" modal (test + candidate invite together). This
 * route is kept only so old links/bookmarks don't 404.
 */
export default function CreateAssessmentRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/interviewer/dashboard");
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">
            Redirecting to the dashboard...
        </main>
    );
}
