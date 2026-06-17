# Final Project – Web Application Development and Security

Course Code: COMP6703001
Course Name: Web Application Development and Security
Institution: BINUS University International

---

## 1. Project Information

Project Title:
Orbot: Homework Question & Answer Assistant

Project Domain (choose one):
Homework Assistance / Education

Class:
L4BC – B4BC

Group Members (Max 3 – same class only):
Name Student ID Role GitHub Username
- Jovanney Rafael Husni 2802523105 Backend & AI Implementing RafaelJo28
- Catherine Isabelle Ong 2802501035 Frontend & UI catheisabelle

---

## 2. Instructor & Repository Access

This repository must be shared with:
* Instructor: Ida Bagus Kerthyayana Manuaba
  - Email: imanuaba@binus.edu
  - GitHub: bagzcode
* Instructor Assistant: Juwono
  - Email: juwono@binus.edu
  - GitHub: Juwono136

---

## 3. Project Overview

### 3.1 Problem Statement

Many students struggle to understand homework questions when studying independently. Existing tools often provide only final answers without clear step-by-step explanations, and they do not support follow-up clarification questions.

Target users are high school and university students who need assistance understanding homework problems in a guided, educational way.

### 3.2 Solution Overview

Orbot is a web application that allows students to submit homework questions as text or image input. The system converts images into text via OCR, then generates an explanation using AI. Students can also ask follow-up questions to clarify answers.

Main features:
* User authentication with email/password and Google sign-in.
* Homework question submission with subject selection.
* AI-generated step-by-step explanations.
* Follow-up Q&A threads for clarification.
* User dashboard and history.

Why this solution is appropriate:
* It helps students learn by explaining solutions instead of only giving answers.
* It supports image-based homework through OCR.
* It enables iterative learning with follow-up questions.

Where AI is used:
* Generating step-by-step homework explanations.
* Answering follow-up clarification questions.
* Extracting text from uploaded question images.

---

## 4. Technology Stack (MANDATORY)

Layer Technology
Frontend Next.js 16, React 19, TailwindCSS, TypeScript
Backend Next.js API Routes, Node.js
API REST API (JSON)
Database PostgreSQL with Prisma
Containerization Docker, Docker Compose
Deployment Docker-ready / hosting via Docker Compose
Version Control GitHub

---

## 5. System Architecture

### 5.1 Architecture Diagram

```
User Browser
  ↓
Frontend (Next.js pages + components)
  ↓
API (Next.js / Node.js routes)
  ↓
Database (PostgreSQL via Prisma)
  ↘
   AI Services (Groq Llama, Tesseract.js)
```

### 5.2 Architecture Explanation

The frontend renders the UI and sends authenticated requests to API routes. API routes handle authentication, validation, database operations, and AI orchestration.

Frontend ↔️ API ↔️ Database interaction:
* The browser calls `/api/*` endpoints.
* API routes verify JWT cookies, then read/write data using Prisma.
* AI calls happen inside backend routes, and results are persisted in the database.

Separation of concerns:
* UI logic lives in React/Next.js pages and components.
* Business logic lives in API route handlers.
* Persistence is managed by Prisma models.

Where security is enforced:
* Protected routes validate JWT from HTTP-only cookies.
* Input validation is applied at the API layer.
* API keys are kept in environment variables and only accessed on the server.

---

## 6. API Design (MANDATORY)

### 6.1 API Endpoints

Method Endpoint Description Auth Required
POST /api/auth/register Register a new user No
POST /api/auth/login Authenticate user and set JWT cookie No
POST /api/auth/google Authenticate via Firebase Google ID token No
POST /api/auth/logout Log out current user Yes
POST /api/ocr Upload an image and return extracted text No
GET /api/questions Get current user questions Yes
POST /api/questions Submit a question and generate AI answer Yes
GET /api/questions/{id} Get a question and answer Yes
DELETE /api/questions/{id} Delete a question and related data Yes
PATCH /api/questions/{id} Update question content Yes
GET /api/questions/{id}/followup Get follow-up entries Yes
POST /api/questions/{id}/followup Submit follow-up question Yes
PUT /api/users/profile Update user profile and password Yes

### 6.2 API Documentation

* Swagger UI: `/api-docs`
* Swagger JSON: `/api/swagger`

Example request: POST `/api/questions`
```json
{
  "content": "What is photosynthesis and why is it important?",
  "subject": "Biology"
}
```
Example response:
```json
{
  "id": "cjx123...",
  "content": "What is photosynthesis and why is it important?",
  "subject": "Biology",
  "status": "answered",
  "createdAt": "2026-06-15T12:34:56.000Z"
}
```

---

## 7. Database Design

### 7.1 Database Choice

PostgreSQL was chosen for structured relational data, strong consistency, and compatibility with Prisma. It stores users, questions, answers, and follow-ups in a reliable, scalable way.

### 7.2 Schema / Data Structure

The Prisma schema defines:
* `User` — id, name, email, password hash, role, createdAt.
* `Question` — id, content, subject, status, user relation.
* `Answer` — id, content, question relation.
* `FollowUp` — id, question, answer, parent question relation.

ERD concept:
* User 1 → many Questions
* Question 1 → 1 Answer
* Question 1 → many FollowUps

---

## 8. AI Features (MANDATORY)

### 8.1 AI Feature List

AI Feature Purpose AI Type
Question explanation generation Generate step-by-step homework answers NLP
Follow-up response generation Answer student clarifications NLP
OCR image text extraction Convert uploaded question images into searchable text OCR

### 8.2 AI Integration Flow

* Input: student submits question text or uploads an image.
* AI processing: backend converts image to text using Tesseract.js, then sends prompt to Groq Llama via Groq SDK.
* Output: AI returns a structured answer that is saved and displayed to the student.
* Follow-up: previous question and answer context are included in the prompt to generate follow-up responses.

---

## 9. Security Implementation (MANDATORY)

* Authentication: JWT stored in HTTP-only cookies, signed with `NEXTAUTH_SECRET`.
* Authorization: protected routes verify token and enforce user ownership of resources.
* Input validation: API routes enforce required fields and size limits.
* Protection against SQL injection: Prisma ORM parameterizes queries and avoids raw SQL.
* Protection against XSS: React escapes rendered content and no unsafe innerHTML is used.
* Protection against CSRF: same-origin requests and `SameSite=Lax` cookie settings reduce CSRF risk.
* Secure API key handling: AI keys and Firebase credentials are kept in environment variables and only used on the server.
* Rate limiting: IP/user-based rate limiting applied to all sensitive endpoints using `rate-limiter-flexible` — login and register (10 req/15 min), question submission (20 req/hr), follow-up questions (30 req/hr), and OCR uploads (10 req/hr) — to prevent brute force and abuse.
* Secure image upload handling: `/api/ocr` validates the uploaded file's MIME type against an allowlist (JPEG, PNG, WebP, GIF) and enforces a 5MB size limit before processing, preventing malicious or oversized file uploads.
---

## 10. Testing Documentation (VERY IMPORTANT)

### 10.1 Frontend Testing

Test Case Scenario Expected Result Status
FE-01 Login page renders and validates form Login page renders with validation Pass
FE-02 Question submission completes successfully Question is submitted and result appears Pass

### 10.2 Backend & API Testing

Test Case Endpoint Input Expected Output Status
API-01 POST /api/auth/register Valid details New user created Pass
API-02 POST /api/questions Valid homework prompt AI answer generated Pass

### 10.3 Security Testing

Test Case Attack Type Expected Behavior Result
SEC-01 XSS Attempt to inject script Input is escaped and not executed Pass
SEC-02 SQL injection Attempt to inject SQL Query is blocked by ORM Pass
SEC-03 Rate limiting (auth) Exceed 10 login attempts in 15 min 11th request blocked with 429 Pass
SEC-04 Rate limiting (questions) Exceed 20 question submissions in 1 hr 21st request blocked with 429 Pass
SEC-05 Rate limiting (OCR) Exceed 10 OCR uploads in 1 hr 11th request blocked with 429 Pass
SEC-06 Invalid file upload Upload non-image file to /api/ocr 400 Invalid file type returned Pass
SEC-07 Oversized file upload Upload file >5MB to /api/ocr 400 File too large returned Pass

### 10.4 AI Functionality Testing (MANDATORY)

AI Feature: Question Explanation
Test Case Input Expected Output Actual Result
AI-01 Valid input Clear explanation returned Pass
AI-02 Invalid input Validation error or fallback Pass
AI-03 Prompt injection Related prompt safely handled Pass

Failure Handling:
* If AI services are unavailable, the backend returns an error and the client displays a failure state.
* Timeouts are handled by backend request libraries and reported to the user.

---

## 11. Deployment & Production Setup

### 11.1 Docker Setup

* Dockerfile included
* docker-compose.yml included
* docker-compose.deploy.yml included

Status: Pass

### 11.2 Production Environment

* Environment variables required for database, authentication, AI keys, and Firebase admin credentials.
* Secrets are stored outside source control in `.env` / `.env.production`.
* HTTPS should be configured by the deployment platform or reverse proxy.

### 11.3 Live Application URL

https://e2526-wads-b4bc-06.csbihub.id/

---

## 12. GitHub Contribution Summary (INDIVIDUAL)

Student Name: Catherine Isabelle Ong
* Features implemented:
  - Question history management
  - User profile management
  - UI polish and responsive design
  - Dashboard bookmark preview
  - Navigation and page flow improvements
  - CI/CD pipeline and deployment support
  - Frontend design and UI/UX, including landing page visuals and animation stability
* API endpoints handled:
  - Frontend integration with `/api/auth/*`, `/api/questions`, `/api/questions/{id}`, `/api/questions/{id}/followup`
* Tests written:
  - Component rendering and interaction tests for login, registration, ask flow, history, navbar, and AI integration
  - Helped ensure tests run in CI before deployment
* Security work:
  - Client-side validation
  - Secure request handling
  - Ensuring public vs private env vars are split correctly
  - Rate limiting on all sensitive endpoints using rate-limiter-flexible (auth, questions, follow-ups, OCR)
  - Rate limit tests written in __tests__/ratelimit.test.ts
* AI-related work:
  - Follow-up question UI flow
  - Explanation presentation and UX for AI responses
  - Editing and documenting AI behavior in the app

Student Name: Jovanney Rafael Husni
* Features implemented:
  - User authentication and authorization
  - AI-powered homework assistant and Groq integration
  - Ask a question interface and subject-aware prompts
  - OCR-based image upload and text extraction
  - Follow-up question system
  - API documentation via Swagger
  - Overall system architecture, monorepo design, and backend structure
* API endpoints handled:
  - `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/logout`
  - `/api/questions`, `/api/questions/{id}`, `/api/questions/{id}/followup`
  - `/api/ocr`, `/api/users/profile`
* Tests written:
  - Backend route coverage and AI integration dispatch tests
  - Auth flow validation and protected route checks
* Security work:
  - JWT cookie auth
  - Protected user routes and resource ownership
  - Server-side-only env var handling for Firebase and Groq
  - Input validation and secure API key handling
  - Secure image upload handling: MIME type allowlist and 5MB size cap on /api/ocr
* AI-related work:
  - Groq Llama 3.3 70B prompt engineering and answer formatting
  - Follow-up context preservation
  - Ensuring AI responses are structured and stored correctly

---

## 13. AI Usage Disclosure (MANDATORY)

* AI tools used: Groq Llama model via Groq SDK, Tesseract.js OCR, GitHub Copilot.
* Purpose of usage: generate homework explanations, answer follow-up questions, extract text from images, and help with the code.
* Which parts were assisted: backend AI orchestration, prompt design, and AI documentation.

ChatGPT was used to assist with README structure and documentation formatting only. All code was reviewed and modified by the team.

---

## 14. Known Limitations & Future Improvements

* Current limitations: AI output may vary in accuracy and may not always align with curriculum expectations.
* Future enhancements: support multi-language OCR, add richer answer validation, extend grading/role features, integrate additional AI models.
* AI limitations and risks: dependency on external AI services and potential for incorrect or incomplete responses.

---

## 15. Final Declaration

We declare that:
* This project is our own work.
* AI usage is disclosed honestly.
* All group members understand the system.

Signed by Group Members:
* Jovanney Rafael Husni
* Catherine Isabelle Ong

---

## 16. SETUP

1. Install dependencies:
```bash
npm install
```
2. Create `.env.local` or `.env.production` with required variables:
   * `DATABASE_URL`
   * `NEXTAUTH_SECRET`
   * `GROQ_API_KEY`
   * `FIREBASE_PROJECT_ID`
   * `FIREBASE_PRIVATE_KEY`
   * `FIREBASE_CLIENT_EMAIL`
3. Generate Prisma client and build:
```bash
npx prisma generate
npm run build
```
4. Run locally:
```bash
npm run dev
```

---

## 17. DEPLOYMENT INSTRUCTIONS

1. Build the Docker image:
```bash
docker compose build
```
2. Start the stack:
```bash
docker compose up -d
```
3. For production, use `docker-compose.deploy.yml` with your hosting platform.
4. Configure environment variables securely in the host environment.
