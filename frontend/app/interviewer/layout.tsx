"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InterviewerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            router.replace("/");
            return;
        }

        try {
            const user = JSON.parse(savedUser);

            if (user.role !== "interviewer") {
                router.replace("/");
                return;
            }

            setAuthorized(true);
        } catch {
            router.replace("/");
        }
    }, [router]);

    if (!authorized) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">
                Checking access...
            </main>
        );
    }

    return <>{children}</>;
}
