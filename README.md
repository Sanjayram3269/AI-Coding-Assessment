# CodeAssess — AI-Powered Coding Assessment Platform

> A full-stack AI-powered coding assessment platform for creating programming assessments, inviting candidates, executing submitted code, and generating structured AI evaluation reports.

---

## Overview

**CodeAssess** is a full-stack coding assessment platform designed to simplify technical interviews and programming evaluations.

The platform provides two separate experiences:

- **Candidate Portal** — Candidates access an assessment through a unique invitation link, solve programming problems in an online editor, run their code, and submit their solution.- **Interviewer Portal** — Interviewers create assessments, generate candidate invitation links, monitor submissions, and review detailed AI-generated evaluation reports.

The system combines:

- Assessment management- Candidate invitation workflow- Online code editing- Code execution- REST APIs- Database persistence- AI-assisted code evaluation- Structured interviewer reports

into a single platform.

---

## Core Workflow

                         INTERVIEWER
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Create Assessment   │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Add Coding Question │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Generate Candidate  │
                   │ Invitation Link     │
                   └──────────┬──────────┘
                              │
                              ▼
                    UNIQUE TEST LINK
                              │
                              ▼
                         CANDIDATE
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Read Question       │
                   │ Write Code          │
                   │ Run Code            │
                   │ Submit Solution     │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    Code Runner      │
                   │                     │
                   │ Execute Code        │
                   │ Capture Output      │
                   │ Capture Errors      │
                   │ Measure Runtime     │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    AI Evaluator     │
                   │                     │
                   │ Correctness         │
                   │ Efficiency          │
                   │ Code Quality        │
                   │ Complexity          │
                   │ Issues              │
                   │ Improvements        │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Stored Evaluation   │
                   └──────────┬──────────┘
                              │
                              ▼
                         INTERVIEWER
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
            Dashboard     Candidates      Reports
                                             │
                                             ▼
                                      Full AI Report
Features
Candidate Features
Unique invitation-based assessment access
Candidate name and email identification
Programming question display
Online Python code editor
Code execution before submission
Program output display
Error display
Solution submission
Automatic AI evaluation
Candidate result page
Overall score
Detailed evaluation breakdown
Interviewer Features
Interviewer dashboard
Create coding assessments
Add programming questions
Generate unique candidate invitation links
Candidate management
Candidate name and email synchronization
Submission tracking
Assessment statistics
AI evaluation reports
Detailed candidate reports
Submitted source code viewing
Execution details
Strengths and weaknesses
Suggested improvements
AI Evaluation

The AI evaluator analyzes submitted code using the coding question, source code, program output, program errors, and execution time.

The evaluation considers:

Correctness
Algorithm quality
Efficiency
Time complexity
Space complexity
Code quality
Error handling
Edge-case handling
Overall quality

Each submission receives structured evaluation data.

AI Evaluation
│
├── Correctness Score
├── Efficiency Score
├── Code Quality Score
├── Overall Score
├── Is Correct
│
├── Time Complexity
├── Space Complexity
│
├── Detected Issues
├── Strengths
├── Improvements
│
└── Explanation

The system does not assume that successful execution automatically means the solution is correct. The AI evaluator also considers whether the submitted algorithm actually addresses the stated coding problem.

Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Monaco Editor
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Uvicorn
Database
SQLite
SQLAlchemy ORM
AI
OpenRouter API
Configurable AI model
Structured JSON evaluation
Code Execution
Python subprocess execution
Standard output capture
Standard error capture
Execution time measurement
Project Structure
AI-Coding-Assessment/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── routes/
│   │   │   ├── submissions.py
│   │   │   └── tests.py
│   │   │
│   │   ├── services/
│   │   │   ├── \_\_init\_\_.py
│   │   │   ├── ai\_evaluator.py
│   │   │   └── code\_runner.py
│   │   │
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   │
│   ├── app/
│   │   │
│   │   ├── candidate/
│   │   │   ├── result/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── test/
│   │   │       ├── page.tsx
│   │   │       └── [token]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── interviewer/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── candidates/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── tests/
│   │   │       ├── create/
│   │   │       │   └── page.tsx
│   │   │       │
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── page.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
Application Architecture
┌─────────────────────────────────────────────────────┐
│                    Next.js Frontend                  │
│                                                     │
│  Candidate Portal          Interviewer Portal       │
│  ├── Test Page             ├── Dashboard            │
│  ├── Code Editor           ├── Candidates           │
│  └── Result Page            └── Reports              │
└───────────────────────┬─────────────────────────────┘
                        │
                        │ REST API
                        ▼
┌─────────────────────────────────────────────────────┐
│                    FastAPI Backend                   │
│                                                     │
│  Tests       Invites       Submissions               │
│  Routes      Routes        Routes                   │
└───────────────┬───────────────────┬─────────────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐   ┌─────────────────────┐
       │   SQLite DB    │   │   Backend Services  │
       │                │   │                     │
       │ Tests          │   │ Code Runner         │
       │ Questions      │   │ AI Evaluator        │
       │ Invites        │   │                     │
       │ Submissions    │   └──────────┬──────────┘
       │ Evaluations    │              │
       └────────────────┘              ▼
                              ┌───────────────────┐
                              │   OpenRouter AI   │
                              └───────────────────┘
API Endpoints
Tests
Method  Endpoint    Description
POST    /tests  Create an assessment
GET /tests  Get all assessments
GET /tests/{test\_id}    Get a specific assessment
POST    /tests/{test\_id}/questions  Add a question
GET /tests/{test\_id}/questions  Get questions for an assessment
Candidate Invites
Method  Endpoint    Description
POST    /tests/{test\_id}/invites    Create candidate invitation
GET /tests/invites  Get candidate invitations
GET /tests/invites/{token}  Resolve invitation link
Submissions
Method  Endpoint    Description
POST    /submissions    Submit candidate solution
GET /submissions    Get submissions and AI evaluations
Candidate Flow

The candidate workflow is intentionally simple.

1\. Candidate receives unique invitation link
                     ↓
2\. Candidate opens the assessment
                     ↓
3\. Candidate sees coding question
                     ↓
4\. Candidate writes code
                     ↓
5\. Candidate runs code
                     ↓
6\. Output/errors are displayed
                     ↓
7\. Candidate submits solution
                     ↓
8\. Backend executes the submission
                     ↓
9\. AI evaluates the solution
                     ↓
10\. Candidate receives result
Interviewer Flow
1\. Interviewer opens dashboard
                     ↓
2\. Creates assessment
                     ↓
3\. Adds coding question
                     ↓
4\. Enters candidate information
                     ↓
5\. Generates unique invitation link
                     ↓
6\. Sends link to candidate
                     ↓
7\. Candidate completes assessment
                     ↓
8\. Interviewer sees candidate
                     ↓
9\. Interviewer opens report
                     ↓
10\. Interviewer reviews complete AI evaluation
Candidate Report

Each completed submission can provide:

Candidate
├── Name
├── Email
└── Submission ID

AI Evaluation
├── Overall Score
├── Correctness
├── Efficiency
└── Code Quality

Complexity
├── Time Complexity
└── Space Complexity

Analysis
├── Explanation
├── Strengths
├── Detected Issues
└── Suggested Improvements

Execution
├── Execution Time
├── Program Output
└── Program Errors

Submission
└── Complete Source Code
Getting Started
Prerequisites

Make sure you have installed:

Node.js
npm
Python 3.12+
Git
Backend Setup

Open a terminal in the project directory.

cd backend

Create a Python virtual environment.

Windows
python -m venv venv

Activate it:

venv\Scripts\activate
macOS / Linux
python3 -m venv venv
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt
Environment Variables

Create:

backend/.env

Add:

OPENROUTER\_API\_KEY=your\_openrouter\_api\_key\_here
OPENROUTER\_MODEL=openrouter/free

Do not commit the real .env file.

The repository should only contain an example file such as:

backend/.env.example

with:

OPENROUTER\_API\_KEY=your\_openrouter\_api\_key\_here
OPENROUTER\_MODEL=openrouter/free
Start Backend

From the backend directory:

uvicorn app.main\:app --reload --port 8000

Backend:

http\://127.0.0.1:8000

FastAPI documentation:

http\://127.0.0.1:8000/docs
Frontend Setup

Open another terminal.

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend:

http\://localhost:3000
Application Routes
Candidate
Candidate Test
/candidate/test/{token}

The candidate accesses the assessment using the unique invitation token.

Candidate Result
/candidate/result

Displays the candidate's evaluation result.

Interviewer
Dashboard
/interviewer/dashboard

Provides:

Assessment count
Candidate count
Report count
Recent candidates
Assessment management
Create Assessment
/interviewer/tests/create

Create assessments and generate candidate invitations.

Candidates
/interviewer/candidates

View candidate submissions, names, emails, scores, and status.

Reports
/interviewer/reports

View completed AI evaluation reports.

Detailed Report
/interviewer/reports/{id}

View the complete evaluation for a specific candidate submission.

Example Evaluation

A completed submission may produce a report similar to:

Overall Score: 95 / 100

Correctness: 95 / 100
Efficiency: 90 / 100
Code Quality: 92 / 100

Time Complexity:
O(n)

Space Complexity:
O(1)

Status:
Passed

The exact scores depend on the submitted solution and AI evaluation.

Database Models

The backend persists the core assessment workflow using SQLAlchemy models.

The system stores information related to:

Test
│
├── Questions
└── Candidate Invites
        │
        └── Submissions
                │
                └── AI Evaluation

This allows candidate submissions and AI evaluation results to remain associated with the correct assessment and candidate.

Security Considerations

This project is currently an academic/MVP implementation.

The code execution component should not be considered a production-grade secure sandbox for arbitrary untrusted code.

For production deployment, additional isolation should be implemented.

Recommended improvements include:

Containerized code execution
CPU limits
Memory limits
Strict execution timeouts
Process isolation
Filesystem restrictions
Network isolation
Authentication
Authorization
Role-based access control
Rate limiting
Secure secret management
HTTPS
Production database
Docker-based execution sandbox
Current Implementation Status
Completed
 Next.js frontend
 React/TypeScript UI
 Tailwind CSS styling
 Monaco code editor
 FastAPI backend
 SQLAlchemy database layer
 Assessment creation
 Question creation
 Candidate invitation generation
 Unique candidate links
 Candidate test interface
 Code execution
 Program output capture
 Program error capture
 Execution time measurement
 Submission storage
 AI code evaluation
 Structured AI evaluation
 Candidate result page
 Interviewer dashboard
 Dynamic assessment statistics
 Candidate management
 Candidate name synchronization
 Candidate email synchronization
 AI reports
 Detailed candidate report
 Submitted code display
 Execution details
 GitHub project structure
 Environment variable configuration
Future Improvements

Possible future extensions include:

Multi-language support
C++
Java
JavaScript
Hidden test cases
Automated test-case generation
Multiple questions per assessment
Assessment timers
Candidate authentication
Google OAuth
Interviewer authentication
Role-based access control
PostgreSQL
Docker sandbox execution
Real-time assessment monitoring
Plagiarism detection
Code similarity detection
Interview analytics
CSV report export
PDF report export
Email invitation delivery
Advanced interviewer analytics
Production deployment
Development Philosophy

The project was developed around a simple principle:

Make technical assessment easier for interviewers
without making the candidate experience complicated.

The system separates the two experiences:

Candidate
    ↓
Simple assessment interface
    ↓
Code → Run → Submit → Result

while giving interviewers:

Assessment Management
        ↓
Candidate Management
        ↓
AI Evaluation
        ↓
Detailed Reports
Project Goal

CodeAssess aims to bring together the major components of a modern coding assessment workflow:

Assessment Creation
        +
Candidate Invitations
        +
Online Coding
        +
Code Execution
        +
AI Evaluation
        +
Structured Reporting

into a single full-stack platform.

Author

Sanjayram

Full-stack AI coding assessment project built using:

Next.js
React
TypeScript
Tailwind CSS
Python
FastAPI
SQLAlchemy
SQLite
OpenRouter
License

This project is currently developed as an academic/software engineering project.

License information can be added when the project is prepared for public distribution.


\### Then save it as exactly:

```text
AI-Coding-Assessment/
└── README.md