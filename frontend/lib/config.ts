// Backend API base URL. Set NEXT_PUBLIC_API_URL in production
// (e.g. your Render backend URL). Falls back to local dev.
export const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
