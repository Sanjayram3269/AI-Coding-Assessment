# CodeAssess — AI-Powered Coding Assessment Platform

> Create coding assessments, invite candidates with a unique link, run and submit their code, and get structured AI-generated evaluation reports — all in one platform.

---

## Overview

**CodeAssess** is a full-stack coding assessment platform built for technical interviews and programming evaluations. It has two portals:

- **Interviewer Portal** — create assessments, add coding questions (Python / C++ / Java / Text), generate per-candidate invite links, track every candidate in one dashboard, and open AI-generated evaluation reports.
- **Candidate Portal** — open an assessment via a private invite link, read the question, write and run code in an in-browser Monaco editor, and submit for evaluation.

Under the hood, a submitted solution is executed (where supported), sent to an LLM via **OpenRouter** for evaluation, and scored on correctness, efficiency, and code quality — with the result stored and rendered as a full report for the interviewer.

---

## Core Workflow

```text
                    ┌─────────────────────┐
                    │     INTERVIEWER     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Create Assessment    │
                    │ + Coding Question(s) │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Generate Candidate   │
                    │ Invitation Link      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   UNIQUE TEST LINK   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      CANDIDATE       │
                    │                      │
                    │ Read Question        │
                    │ Write Code           │
                    │ Run Code             │
                    │ Submit Solution      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     CODE RUNNER      │
                    │                      │
                    │ Execute Code         │
                    │ Capture Output       │
                    │ Capture Errors       │
                    │ Measure Runtime      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  AI EVALUATOR (LLM)  │
                    │  via OpenRouter      │
                    │                      │
                    │ Correctness          │
                    │ Efficiency           │
                    │ Code Quality         │
                    │ Complexity           │
                    │ Issues / Strengths   │
                    │ Improvements         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  STORED EVALUATION   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     INTERVIEWER      │
                    │                      │
                    │ Dashboard            │
                    │ Candidates Table     │
                    │ Full AI Report       │
                    │ Downloadable Report  │
                    └─────────────────────┘
```

---

## Features

**Interviewer**
- Create assessments with one or more coding questions
- Per-question language: Python, C++, Java, or Text (free-form/theory answer)
- Generate a unique, single-use invite link per candidate
- Dashboard with search across all candidates, invite links, and scores
- Per-submission AI evaluation report (score breakdown, complexity, strengths, issues, improvements)
- Downloadable, print-ready HTML report per submission

**Candidate**
- Access an assessment only via a private invite link (no open sign-up)
- Monaco-based code editor with syntax highlighting per language
- Run code and see stdout/stderr before submitting (Python)
- Submit for instant AI evaluation and view a detailed results page

**AI Evaluation**
- Uses OpenRouter to call an LLM with the question, submitted code, program output, and execution time
- Returns a structured score: correctness, efficiency, code quality, overall, plus time/space complexity, detected issues, strengths, and improvement suggestions

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Monaco Editor |
| Backend    | FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database   | SQLite locally (zero setup) / Postgres in production |
| AI         | OpenRouter (LLM evaluation) |
| Code exec  | Python `subprocess` sandboxed with a timeout |
| Hosting    | Frontend → Vercel · Backend → Render |

---

## Project Structure

```
AI-Coding-Assessment/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + CORS + router registration
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # User, Test, Question, TestInvite, Submission, AIEvaluation
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── tests.py       # Assessments, questions, invites, candidates overview
│   │   │   └── submissions.py # Run code, submit, AI-evaluate, download report
│   │   └── services/
│   │       ├── code_runner.py   # Sandboxed Python execution
│   │       └── ai_evaluator.py  # OpenRouter evaluation call
│   ├── requirements.txt
│   └── .env                   # OPENROUTER_API_KEY (not committed)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                       # Sign-in (Interviewer / Candidate)
│   │   ├── interviewer/
│   │   │   ├── dashboard/                 # Candidates table + search + stats
│   │   │   ├── tests/create/              # Create assessment + questions
│   │   │   ├── tests/[id]/                # Assessment detail + invite generator
│   │   │   ├── candidates/                # All candidate submissions
│   │   │   └── reports/[id]/              # Full AI evaluation report
│   │   └── candidate/
│   │       ├── test/                      # Enter invite link/code
│   │       ├── test/[token]/              # Question + Monaco editor + run/submit
│   │       └── result/                    # Post-submission result summary
│   └── lib/
│       ├── api.ts              # Fetch helpers for test/question CRUD
│       └── config.ts           # API_URL (NEXT_PUBLIC_API_URL, falls back to localhost)
│
├── render.yaml                 # Render Blueprint: backend web service + Postgres
└── docs/                       # architecture / API / database notes
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- An [OpenRouter](https://openrouter.ai/) API key
- `g++` on PATH if you want C++ code to run (Python is required for Python execution; Java execution requires a JDK — see [Known Limitations](#known-limitations))

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
```

Run the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is now live at `http://127.0.0.1:8000` (interactive docs at `/docs`). A local `assessment.db` SQLite file is created automatically on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

### 3. Try it end-to-end
1. Sign in as **Interviewer** → Create Assessment → add a question.
2. Open the created assessment → generate an invite link for a candidate.
3. Open that invite link in a new tab/incognito window (or sign in as **Candidate** and paste it) → solve → Run → Submit.
4. Back on the interviewer Dashboard, find the candidate row → view the score → download the report.

---

## Deployment

The frontend deploys cleanly to **Vercel**. The backend needs a host that runs a real, persistent process — not a serverless function — because it spawns subprocesses to execute submitted code and needs a filesystem that doesn't get wiped between requests. **Render** is used here, with Postgres replacing SQLite for production storage.

### 1. Backend → Render

This repo includes a `render.yaml` Blueprint.

1. On [Render](https://render.com), click **New → Blueprint** and connect this GitHub repository. Render reads `render.yaml` and provisions:
   - A **web service** for the FastAPI backend (root directory `backend/`)
   - A free **Postgres** database, automatically wired to the backend via `DATABASE_URL`
2. When prompted for the secret env vars:
   - `OPENROUTER_API_KEY` — your OpenRouter key
   - `FRONTEND_URL` — leave blank for now; you'll set it in step 3
3. Deploy, then note the backend's URL (e.g. `https://ai-coding-assessment-backend.onrender.com`).

*No Blueprint support on your plan? Deploy manually instead: **New → Web Service** → connect this repo → Root Directory `backend` → Build Command `pip install -r requirements.txt` → Start Command `uvicorn app.main:app --host 0.0.0.0 --port $PORT` → add a Postgres instance → set `DATABASE_URL` to its connection string.*

### 2. Frontend → Vercel

1. On [Vercel](https://vercel.com), **New Project** → import this repository.
2. Set **Root Directory** to `frontend`.
3. Add an environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL from step 1.
4. Deploy, then note the frontend's URL (e.g. `https://ai-coding-assessment.vercel.app`).

### 3. Connect them

Back on Render → your backend service → **Environment** → set `FRONTEND_URL` to your Vercel URL from step 2 (comma-separate multiple origins if you also want to allow Vercel preview URLs) → the service redeploys automatically. This is what lets the backend's CORS policy accept requests from your live frontend.

**Free-tier note:** Render's free web services spin down after inactivity — the first request after idling can take ~30–60s while it wakes back up.

---

## API Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/tests` | Create an assessment |
| `GET`  | `/tests` | List assessments |
| `GET`  | `/tests/{id}` | Get one assessment |
| `POST` | `/tests/{id}/questions` | Add a question to an assessment |
| `GET`  | `/tests/{id}/questions` | List an assessment's questions |
| `POST` | `/tests/{id}/invites` | Generate a candidate invite link |
| `GET`  | `/tests/invites` | List all invites |
| `GET`  | `/tests/invites/{token}` | Resolve an invite token |
| `GET`  | `/tests/candidates/overview` | Joined candidate/test/score table (dashboard) |
| `POST` | `/submissions/run` | Run code without submitting (Python only) |
| `POST` | `/submissions` | Submit a solution |
| `POST` | `/submissions/{id}/evaluate` | Run AI evaluation on a submission |
| `GET`  | `/submissions` | List submissions with evaluation |
| `GET`  | `/submissions/{id}/report` | Download a formatted HTML report |

Full interactive documentation is available at `http://127.0.0.1:8000/docs` while the backend is running.

---

## Known Limitations

- **Code execution** currently runs Python only. C++ and Java questions can be created, solved, and submitted, and are still fully AI-evaluated — they just aren't auto-compiled/run yet, so the "Run Code" button is disabled for them with an explanatory note.
- **Text-type questions** are for free-form/theory answers and are never executed, only AI-evaluated.
- **No real backend authentication.** Signing in as "Interviewer" vs "Candidate" is a client-side preference (`localStorage`), and every interviewer currently shares one hardcoded `interviewer_id`. There's a client-side route guard on `/interviewer/*` pages, but it's not a substitute for real accounts/sessions if this were to handle real candidate data in production.

---

## License

This project is provided as-is for educational and assessment purposes.
