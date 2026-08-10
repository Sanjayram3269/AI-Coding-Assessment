# CodeAssess — AI-Powered Coding Assessment Platform

> A full-stack AI-powered coding assessment platform for creating programming assessments, inviting candidates, executing submitted code, and generating structured AI evaluation reports.

---

## 📌 Overview

**CodeAssess** is a full-stack coding assessment platform designed to simplify technical interviews and programming evaluations.

The platform provides two separate experiences:

- **Candidate Portal** — Candidates access an assessment through a unique invitation link, solve programming problems in an online editor, run their code, and submit their solution.
- **Interviewer Portal** — Interviewers create assessments, generate candidate invitation links, monitor submissions, and review detailed AI-generated evaluation reports.

The system combines:

- Assessment management
- Candidate invitation workflow
- Online code editing
- Code execution
- REST APIs
- Database persistence
- AI-assisted code evaluation
- Structured interviewer reports

into a single platform.

---

## 🚀 Core Workflow

```text
                    ┌─────────────────────┐
                    │     INTERVIEWER     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Create Assessment   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Add Coding Question │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Generate Candidate  │
                    │ Invitation Link     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   UNIQUE TEST LINK  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      CANDIDATE      │
                    │                     │
                    │ Read Question       │
                    │ Write Code          │
                    │ Run Code            │
                    │ Submit Solution     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     CODE RUNNER     │
                    │                     │
                    │ Execute Code        │
                    │ Capture Output      │
                    │ Capture Errors      │
                    │ Measure Runtime     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    AI EVALUATOR     │
                    │                     │
                    │ Correctness         │
                    │ Efficiency          │
                    │ Code Quality        │
                    │ Complexity          │
                    │ Issues              │
                    │ Improvements        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ STORED EVALUATION   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     INTERVIEWER     │
                    │                     │
                    │ Dashboard           │
                    │ Candidates          │
                    │ Reports             │
                    │ Full AI Report      │
                    └─────────────────────┘