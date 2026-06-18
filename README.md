# Final Project – Web Application Development and Security

Course Code: COMP6703001
Course Name: Web Application Development and Security
Institution: BINUS University International

---

## 1. Project Information

**Project Title:** Orbot: Homework Question & Answer Assistant

**Project Domain:** Homework Question & Answer Assistant

**Class:** L4BC – B4BC

**Group Members (Max 3 – same class only):**

| Name | Student ID | Role | GitHub Username |
|------|-----------|------|-----------------|
| Jovanney Rafael Husni | 2802523105 | Backend & AI | RafaelJo28 |
| Catherine Isabelle Ong | 2802501035 | Frontend & UI | catheisabelle |

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

Orbot is a full-stack web application that allows students to submit homework questions as text or image input. The system extracts text from images via OCR, then generates a step-by-step explanation using an AI language model. Students can ask follow-up questions to deepen their understanding.

**Main features:**
* User authentication with email/password and Google sign-in.
* Homework question submission with subject selection.
* AI-generated step-by-step explanations (Groq LLaMA 3.3-70b).
* OCR image upload — extract text from homework photos automatically.
* Follow-up Q&A threads for iterative clarification.
* User dashboard, question history, bookmarking, and profile management.

**Why this solution is appropriate:**
* It teaches students how to solve problems, not just what the answer is.
* It supports image-based homework through OCR, removing barriers for handwritten work.
* It enables iterative learning via follow-up questions with full context retention.

**Where AI is used:**
* Generating step-by-step homework explanations (NLP via Groq LLaMA).
* Answering follow-up clarification questions with original context (NLP via Groq LLaMA).
* Extracting text from uploaded question images (OCR via Tesseract.js).

---

## 4. Technology Stack (MANDATORY)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS, TypeScript |
| Backend | Next.js API Routes, Node.js |
| API | REST API (JSON) |
| Database | PostgreSQL with Prisma ORM (hosted on Neon) |
| Containerization | Docker, Docker Compose |
| Deployment | Docker + csbihub.id (HTTPS via Cloudflare) |
| Version Control | GitHub |

---

## 5. System Architecture

### 5.1 Architecture Diagram

```
┌─────────────────────────────────────────┐
│              User Browser               │
└──────────────────┬──────────────────────┘
                   │ HTTP/HTTPS
┌──────────────────▼──────────────────────┐
│     Frontend (Next.js pages +           │
│     React components + TailwindCSS)     │
└──────────────────┬──────────────────────┘
                   │ fetch() to /api/*
┌──────────────────▼──────────────────────┐
│     Backend (Next.js API Routes)        │
│  Auth │ Questions │ OCR │ Profile       │
└────┬─────────────────────────┬──────────┘
     │                         │
┌────▼──────────┐   ┌──────────▼──────────┐
│  PostgreSQL   │   │    AI Services      │
│  via Prisma   │   │  Groq LLaMA 3.3-70b │
│  (Neon)       │   │  Tesseract.js OCR   │
└───────────────┘   └─────────────────────┘
```

### 5.2 Architecture Explanation

**Frontend ↔ API ↔ Database interaction:**
* The browser calls `/api/*` endpoints via fetch.
* API routes verify JWT from HTTP-only cookies, then read/write data using Prisma.
* AI calls happen inside backend API routes; results are persisted in the database and returned to the frontend.

**Separation of concerns:**
* UI logic lives in React/Next.js pages and components.
* Business logic (validation, AI orchestration, auth) lives in API route handlers.
* Data persistence is managed exclusively by Prisma models.

**Where security is enforced:**
* Protected routes validate JWT from HTTP-only cookies before any logic runs.
* Input validation and rate limiting are applied at the API layer.
* API keys are kept in server-side environment variables and never exposed to the client bundle.

---

## 6. API Design (MANDATORY)

### 6.1 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Authenticate user and set JWT cookie | No |
| POST | /api/auth/google | Authenticate via Firebase Google ID token | No |
| POST | /api/auth/logout | Log out current user and clear cookie | Yes |
| POST | /api/ocr | Upload an image and return extracted text | Yes |
| GET | /api/questions | Get all questions for current user | Yes |
| POST | /api/questions | Submit a question and generate AI answer | Yes |
| GET | /api/questions/{id} | Get a specific question with its answer | Yes |
| DELETE | /api/questions/{id} | Delete a question and all related data | Yes |
| PATCH | /api/questions/{id} | Update question content | Yes |
| GET | /api/questions/{id}/followup | Get all follow-up entries for a question | Yes |
| POST | /api/questions/{id}/followup | Submit a follow-up question | Yes |
| PUT | /api/users/profile | Update user profile and password | Yes |

### 6.2 API Documentation

* Swagger UI available at: `/api-docs`
* Swagger JSON available at: `/api/swagger`

**Example request:** `POST /api/questions`
```json
{
  "content": "What is photosynthesis and why is it important?",
  "subject": "Biology"
}
```

**Example response:**
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

PostgreSQL was chosen for its structured relational model, strong consistency guarantees, and native Prisma compatibility. It stores users, questions, answers, and follow-ups with enforced foreign key relationships. Neon is used as the serverless PostgreSQL hosting provider to minimize infrastructure cost.

### 7.2 Schema / Data Structure

```
┌─────────────────────┐          ┌──────────────────────────┐
│        User         │          │         Question          │
├─────────────────────┤          ├──────────────────────────┤
│ id       String PK  │──────┐   │ id         String PK     │
│ name     String     │      └──▶│ userId     String FK     │
│ email    String     │  1:N     │ content    String        │
│ password String     │          │ imageUrl   String?       │
│ role     String     │          │ subject    String        │
│ createdAt DateTime  │          │ status     String        │
└─────────────────────┘          │ createdAt  DateTime      │
                                 └────────────┬─────────────┘
                                              │
                          ┌───────────────────┼──────────────────────┐
                          │ 1:1                                       │ 1:N
                          ▼                                           ▼
              ┌───────────────────────┐             ┌───────────────────────┐
              │        Answer         │             │        FollowUp       │
              ├───────────────────────┤             ├───────────────────────┤
              │ id         String PK  │             │ id         String PK  │
              │ questionId String FK  │             │ questionId String FK  │
              │ content    String     │             │ question   String     │
              │ createdAt  DateTime   │             │ answer     String     │
              └───────────────────────┘             │ createdAt  DateTime   │
                                                    └───────────────────────┘

Relationships:
  User      1 ──▶ N  Question
  Question  1 ──▶ 1  Answer
  Question  1 ──▶ N  FollowUp
```

---

## 8. AI Features (MANDATORY)

### 8.1 AI Feature List

| AI Feature | Purpose | AI Type |
|------------|---------|---------|
| Question explanation generation | Generate step-by-step homework answers with subject awareness | NLP (Groq LLaMA 3.3-70b) |
| Follow-up response generation | Answer student clarifications using original Q&A as context | NLP (Groq LLaMA 3.3-70b) |
| OCR image text extraction | Convert uploaded homework photos into text for submission | OCR (Tesseract.js) |

### 8.2 AI Integration Flow

**Question explanation:**
* Student submits question text + subject via `POST /api/questions`.
* Backend validates input, saves question with status `"pending"`, then constructs a tutor prompt including the subject and question content. The prompt instructs the model to first verify the question matches the subject, then explain step by step.
* Groq LLaMA 3.3-70b generates the explanation.
* Answer is saved to the `Answer` table; question status updated to `"answered"`.
* Frontend navigates to the question detail page to display the answer.

**Follow-up questions:**
* Student submits a follow-up via `POST /api/questions/{id}/followup`.
* Backend fetches the original question and its answer from the database.
* The prompt sent to Groq includes: the original question, the prior AI answer, and the new follow-up — giving the model full conversational context.
* AI response is saved as a new `FollowUp` record.

**OCR pipeline:**
* Student uploads a homework image on the Ask page.
* Tesseract.js runs the English OCR model and extracts text from the image.
* Extracted text is returned and pre-fills the question input field.
* Before processing, the server validates file MIME type (allowlist) and file size (5MB cap).

---

## 9. Security Implementation (MANDATORY)

* **Authentication:** JWT stored in HTTP-only cookies, signed with `NEXTAUTH_SECRET`. HTTP-only prevents JavaScript from reading the token, mitigating XSS-based token theft.
* **Authorization:** All protected routes call `getUserFromToken()` to verify the JWT and extract `userId`. Database queries filter by `userId` so users can only access their own data.
* **Input validation:** Every API route trims and validates required fields and enforces character limits (question content: 1–10,000 chars, subject: 1–100 chars, email: 5–254 chars).
* **Protection against SQL injection:** Prisma ORM generates parameterized queries — user input is never concatenated into SQL strings.
* **Protection against XSS:** React escapes all rendered content by default. No `dangerouslySetInnerHTML` is used anywhere in the project.
* **Protection against CSRF:** Cookies use `SameSite=Lax`, which prevents the browser from sending cookies on cross-origin POST requests. All API calls are same-origin JSON requests.
* **Secure API key handling:** `GROQ_API_KEY`, `NEXTAUTH_SECRET`, and Firebase admin credentials are stored in environment variables and only accessed in server-side API routes — never in the client bundle.
* **Rate limiting:** IP/user-based rate limiting on all sensitive endpoints using `rate-limiter-flexible`:
  - Login & register: 10 requests per 15 minutes (brute force protection)
  - Question submission: 20 requests per hour
  - Follow-up questions: 30 requests per hour
  - OCR uploads: 10 requests per hour
* **Secure image upload handling:** `/api/ocr` validates uploaded file MIME type against an allowlist (JPEG, PNG, WebP, GIF) and enforces a 5MB size limit before any processing occurs, preventing malicious or oversized file uploads.

---

## 10. Testing Documentation (VERY IMPORTANT)

### 10.1 Frontend Testing

| Test Case | Scenario | Expected Result | Status |
|-----------|----------|-----------------|--------|
| FE-01 | Login page renders correctly | Email, password fields and Sign In button visible | Pass |
| FE-02 | Login shows Orbot branding | "Orbot" and "Welcome Back" text visible | Pass |
| FE-03 | Login shows error on invalid credentials | "Invalid credentials" error message displayed | Pass |
| FE-04 | Login shows loading state during sign in | "Signing in..." text appears | Pass |
| FE-05 | Login has link to register page | "Register" link visible | Pass |
| FE-06 | Register page renders correctly | Name, email, password fields and Create Account button visible | Pass |
| FE-07 | Register shows error on duplicate email | "Email already exists" error displayed | Pass |
| FE-08 | Register redirects to login on success | Router navigates to /login | Pass |
| FE-09 | Register shows loading state during account creation | "Creating account..." text appears | Pass |
| FE-10 | Ask page renders heading and all subjects | "Ask Orbot" and 8 subject buttons visible | Pass |
| FE-11 | Ask page submit button disabled with no subject | Get Explanation button is disabled | Pass |
| FE-12 | Ask page submit button enabled after subject selection | Button becomes active after clicking a subject | Pass |
| FE-13 | Ask page shows loading state on submission | "Orbot is thinking..." text appears | Pass |
| FE-14 | Ask page shows error on failed submission | Error message displayed to user | Pass |
| FE-15 | Ask page renders image upload zone | Upload area visible on page | Pass |
| FE-16 | History page renders question list | Previously submitted questions displayed | Pass |
| FE-17 | History page filters questions by search | Only matching questions shown | Pass |
| FE-18 | History page filters by status | Only pending/answered questions shown | Pass |
| FE-19 | History page toggles bookmark | Star changes from ☆ to ⭐ on click | Pass |
| FE-20 | History page shows empty state | "No questions found." shown when list is empty | Pass |
| FE-21 | History page deletes question on confirm | DELETE request sent to API | Pass |
| FE-22 | History page enters rename mode | Input field appears with current question text | Pass |
| FE-23 | Navbar renders all navigation links | Dashboard, Ask, History, Profile, Logout visible | Pass |
| FE-24 | Navbar highlights active page | Active link has purple styling | Pass |
| FE-25 | Navbar logout calls API and redirects | POST /api/auth/logout called, redirects to /login | Pass |

### 10.2 Backend & API Testing

| Test Case | Endpoint | Input | Expected Output | Status |
|-----------|----------|-------|-----------------|--------|
| API-01 | POST /api/auth/register | Valid name, email, password | 201 User created | Pass |
| API-02 | POST /api/auth/register | Duplicate email | 409 Email already exists | Pass |
| API-03 | POST /api/auth/register | Missing fields | 400 Validation error | Pass |
| API-04 | POST /api/auth/login | Valid credentials | 200 JWT cookie set | Pass |
| API-05 | POST /api/auth/login | Invalid password | 401 Unauthorized | Pass |
| API-06 | GET /api/questions | No JWT token | 401 Unauthorized | Pass |
| API-07 | POST /api/questions | Valid question + subject | 201 AI answer generated and saved | Pass |
| API-08 | POST /api/questions | Empty content | 400 Validation error | Pass |
| API-09 | POST /api/questions | Content exceeding 10,000 chars | 400 Validation error | Pass |
| API-10 | GET /api/questions/{id} | Valid question ID belonging to user | 200 Question with answer returned | Pass |
| API-11 | GET /api/questions/{id} | Question ID belonging to another user | 404 Not found | Pass |
| API-12 | POST /api/questions/{id}/followup | Valid follow-up question | 201 Contextual AI answer returned | Pass |
| API-13 | DELETE /api/questions/{id} | Valid question ID | 200 Question and related records deleted | Pass |

### 10.3 Security Testing

| Test Case | Attack Type | Expected Behavior | Result |
|-----------|-------------|-------------------|--------|
| SEC-01 | XSS | Submit `<script>alert('xss')</script>` as question content | React escapes content, script does not execute | Pass |
| SEC-02 | SQL injection | Submit `' OR 1=1; --` as email on login | Prisma parameterized query blocks injection, 401 returned | Pass |
| SEC-03 | Rate limiting (auth) | Exceed 10 login attempts in 15 minutes | 11th request blocked with 429 Too Many Requests | Pass |
| SEC-04 | Rate limiting (questions) | Exceed 20 question submissions in 1 hour | 21st request blocked with 429 | Pass |
| SEC-05 | Rate limiting (OCR) | Exceed 10 OCR uploads in 1 hour | 11th request blocked with 429 | Pass |
| SEC-06 | Invalid file upload | Upload .html file to /api/ocr | 400 Invalid file type returned | Pass |
| SEC-07 | Oversized file upload | Upload file larger than 5MB to /api/ocr | 400 File too large returned | Pass |
| SEC-08 | Unauthorized access | Call /api/questions without JWT cookie | 401 Unauthorized returned | Pass |
| SEC-09 | Cross-user data access | Request another user's question by ID | 404 Not found (userId mismatch) | Pass |

### 10.4 AI Functionality Testing (MANDATORY)

**AI Feature: Question Explanation** (`ai-integration.test.ts`)

| Test Case | Input | Expected Output | Actual Result | Status |
|-----------|-------|-----------------|---------------|--------|
| AI-01 | Valid question with matching subject ("What is 2+2?" / Math) | Prompt contains tutor role, subject, question, step-by-step instruction | All required elements found in prompt | Pass |
| AI-02 | Empty string input | Validation fails — `trim().length < 1` | isValid returns false, no Groq call made | Pass |
| AI-03 | Whitespace-only input ("   ") | Validation fails after trim | isValid returns false | Pass |
| AI-04 | Input exceeding 10,000 characters | Validation fails — length > 10,000 | isValid returns false | Pass |
| AI-05 | Input exactly 10,000 characters | Validation passes — at boundary | isValid returns true | Pass |
| AI-06 | Subject exceeding 100 characters | Subject validation fails | isValid returns false | Pass |
| AI-07 | Correct AI model configuration | Model is `llama-3.3-70b-versatile`, role is `"user"` | Configuration verified | Pass |

**AI Feature: Follow-up Questions** (`ai-followup.test.ts`)

| Test Case | Input | Expected Output | Actual Result | Status |
|-----------|-------|-----------------|---------------|--------|
| AI-08 | Valid follow-up with original Q&A context | Prompt contains original question, original answer, and new follow-up | All context elements found in prompt | Pass |
| AI-09 | Empty follow-up input | Validation fails — trim().length < 1 | isValid returns false | Pass |
| AI-10 | Follow-up input exceeding 10,000 chars | Validation fails | isValid returns false | Pass |
| AI-11 | Empty question ID | ID validation fails | isValid returns false | Pass |

**AI Feature: Rate Limiting** (`ratelimit.test.ts`)

| Test Case | Input | Expected Output | Actual Result | Status |
|-----------|-------|-----------------|---------------|--------|
| AI-12 | Requests within limit (3 of 3) | All requests succeed | resolves for all 3 | Pass |
| AI-13 | Requests exceeding limit (3rd of 2) | Excess request rejected | rejects on 3rd request | Pass |
| AI-14 | Two different user keys | Keys tracked independently | User B unaffected by User A's limit | Pass |

**Failure Handling:**
* If Groq is unavailable or times out: `POST /api/questions` wraps the Groq call in a try-catch and returns HTTP 500 with the error message.
* The question is saved to the database with status `"pending"` before the AI call — if AI fails, the record is preserved and can be retried.
* If OCR fails (unreadable image or unsupported format): caught in try-catch, returns HTTP 500, frontend displays "OCR failed. Please type your question manually."
* Frontend displays all error responses to the user with clear messaging.

---

## 11. Deployment & Production Setup

### 11.1 Docker Setup

* Dockerfile included ✅
* docker-compose.yml included ✅
* docker-compose.deploy.yml included ✅

The Dockerfile uses a multi-stage build:
1. `base` — Node 20 Alpine with OpenSSL
2. `deps` — installs dependencies via `npm ci`
3. `builder` — runs `prisma generate` and `npm run build` with Firebase public keys as build args
4. `runner` — copies only the built output, runs as a non-root `nodejs` user for security

### 11.2 Production Environment

* Environment variables required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `GROQ_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`.
* Secrets are stored outside source control in `.env` / `.env.production` and injected at runtime via Docker.
* HTTPS is active on the production domain via Cloudflare, provided by the lab instructor as part of the deployment infrastructure.
* A non-root Docker user (`nodejs`) is used in production to limit container privileges.

### 11.3 Live Application URL

**https://e2526-wads-b4bc-06.csbihub.id/**

---

## 12. GitHub Contribution Summary (INDIVIDUAL)

**Student Name: Catherine Isabelle Ong**
* Features implemented:
  - Question history management with search, filter, and bookmark
  - User profile management
  - UI polish and responsive design across all pages
  - Dashboard bookmark preview
  - Navigation and page flow improvements
  - CI/CD pipeline and deployment support
  - Frontend design and UI/UX, including landing page visuals and animation stability
* API endpoints handled:
  - Frontend integration with `/api/auth/*`, `/api/questions`, `/api/questions/{id}`, `/api/questions/{id}/followup`
* Tests written:
  - Component rendering and interaction tests: login, register, ask, history, navbar (`login.test.tsx`, `register.test.tsx`, `ask.test.tsx`, `history.test.tsx`, `navbar.test.tsx`)
  - Rate limit tests (`ratelimit.test.ts`)
  - Ensured all tests pass in CI before deployment
* Security work:
  - Client-side input validation
  - Secure request handling
  - Correct split of public vs private environment variables
  - Rate limiting on all sensitive endpoints using `rate-limiter-flexible` (auth, questions, follow-ups, OCR)
* AI-related work:
  - Follow-up question UI flow
  - Explanation presentation and UX for AI responses
  - Documenting AI behavior and testing in the README

**Student Name: Jovanney Rafael Husni**
* Features implemented:
  - User authentication and authorization (email/password + Google OAuth)
  - AI-powered homework assistant with Groq LLaMA 3.3-70b integration
  - Subject-aware prompt engineering
  - OCR-based image upload and text extraction
  - Follow-up question system with context injection
  - API documentation via Swagger
  - Overall system architecture, monorepo design, and backend structure
* API endpoints handled:
  - `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/logout`
  - `/api/questions`, `/api/questions/{id}`, `/api/questions/{id}/followup`
  - `/api/ocr`, `/api/users/profile`
* Tests written:
  - AI integration tests (`ai-integration.test.ts`)
  - AI follow-up tests (`ai-followup.test.ts`)
  - Auth flow validation and protected route checks
* Security work:
  - JWT HTTP-only cookie authentication
  - Protected routes and per-user resource ownership enforcement
  - Server-side-only environment variable handling for Firebase and Groq
  - Input validation and length enforcement on all API routes
  - Secure image upload handling: MIME type allowlist and 5MB size cap on `/api/ocr`
* AI-related work:
  - Groq LLaMA 3.3-70b prompt engineering with subject-check guardrails
  - Follow-up context injection (original question + answer + follow-up in prompt)
  - AI response structuring and database persistence

---

## 13. AI Usage Disclosure (MANDATORY)

* **AI tools used:** Groq LLaMA 3.3-70b via Groq SDK (integrated as a core feature), Tesseract.js OCR (integrated as a core feature), GitHub Copilot (development assistance), ChatGPT (documentation assistance).
* **Purpose of usage:** generate homework explanations, answer follow-up questions, extract text from images, assist with code suggestions, and help with README formatting.
* **Which parts were assisted:** backend AI orchestration, prompt design, AI test documentation, and README structure.

All AI-generated code suggestions were reviewed, understood, and modified by the team before use.

---

## 14. Known Limitations & Future Improvements

**Current limitations:**
* AI output may vary in accuracy and may not always align with curriculum expectations.
* OCR accuracy decreases with handwritten or low-quality images.
* Rate limiting uses in-memory storage — limits reset on server restart.
* No role-based admin panel for content moderation.

**Future enhancements:**
* Multi-language OCR support.
* Persistent rate limiting using Redis.
* Admin dashboard for monitoring AI usage and flagged content.
* AI answer quality scoring based on student feedback.
* Integration with additional AI models for subject-specific accuracy.

**AI limitations and risks:**
* Dependency on external AI services (Groq) — downtime affects core functionality.
* LLM responses are non-deterministic — identical questions may get different answers.
* Prompt injection is an ongoing research area; current guardrails are not fully immune.

---

## 15. Final Declaration

We declare that:
* This project is our own work.
* AI usage is disclosed honestly.
* All group members understand the full system and can explain any part.

Signed by Group Members:
* Jovanney Rafael Husni
* Catherine Isabelle Ong

---

## 16. SETUP

1. Clone the repository:
```bash
git clone https://github.com/RafaelJo28/WADSProject.git
cd WADSProject
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` with required variables:
```
DATABASE_URL=your_neon_postgres_url
NEXTAUTH_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
NEXT_PUBLIC_FIREBASE_API_KEY=your_public_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

4. Generate Prisma client and push schema:
```bash
npx prisma generate
npx prisma db push
```

5. Run locally:
```bash
npm run dev
```

6. Run tests:
```bash
npm test
```

---

## 17. DEPLOYMENT INSTRUCTIONS

1. Build the Docker image:
```bash
docker compose build
```

2. Start the stack locally:
```bash
docker compose up -d
```

3. For production deployment:
```bash
docker compose -f docker-compose.deploy.yml up -d
```

4. Configure all environment variables securely in the host environment before starting the production container.

5. HTTPS is handled by Cloudflare on the production domain — no additional SSL configuration required in the container.
