# Final Project – Web Application Development and Security

Course Name: Web Application Development and Security
Institution: BINUS University International

---

## 1. Project Information

Project Title:  
Orbot: Homework Question & Answer Assistant

Project Domain:  
Homework Question & Answer Assistant

Class:
- LEC: L4BC
- LAB: B4BC

Group Members:
- Jovanney Rafael Husni – Backend & AI Implementing
- Catherine Isabelle Ong – Frontend & UI

---

## 3. Project Overview

### 3.1 Problem Statement

Many students experience difficulty understanding homework questions, especially when
studying independently outside of classroom hours. Existing tools often provide only
final answers without clear step-by-step explanations, which limits students’ ability
to learn the underlying concepts. Additionally, students may struggle to ask follow-up
questions when they do not understand certain solution steps.

---

### 3.2 Solution Overview

This project is a Homework Question & Answer Assistant web application that allows
students to submit homework questions in text or image format. The system analyzes the
submitted question and generates step-by-step explanations to help students understand
the solution process.

The application supports image-based questions by using OCR to convert images into text
before processing. Users may also submit follow-up clarification questions based on the
initial explanation. AI functionality is treated as a core component of the system and
is securely integrated through backend APIs.

---

## 4. Technology Stack (Mandatory)

Frontend:  
- Next.js 16 (React 19)
- TailwindCSS with TypeScript
- React Hook Form for form management
- Swagger UI for API documentation

Backend:  
- Node.js (Next.js API Routes)
- Next-Auth for authentication
- Firebase Admin SDK for additional auth support

API:  
- RESTful API (JSON)
- Swagger/OpenAPI documentation

Database:  
- PostgreSQL with Prisma ORM
- Neon Serverless PostgreSQL adapter

AI Services:  
- Google Generative AI for explanation generation
- Groq SDK for alternative AI processing
- OpenAI for additional AI capabilities
- Tesseract.js for OCR (image-to-text conversion)

Authentication:  
- Firebase Authentication
- Next-Auth with Prisma adapter
- JWT token support
- bcryptjs for password hashing

Deployment:  
- Docker containerization (Node.js 20 Alpine)
- Docker Compose for local and production environments

Cloud Hosting:
- Managed PostgreSQL Service (Neon)
- Docker-based deployment ready

Testing:  
- Jest testing framework
- React Testing Library for component tests
- TypeScript for type safety

Version Control:  
- GitHub

---

## 5. System Architecture

### 5.1 Architecture Diagram (Text-Based)

User (Browser)
->
Frontend (Next.js)
->
REST API (Node.js / Next.js API Routes)
->
Database (PostgreSQL)
->
AI Services (OCR & NLP)

---

### 5.2 Architecture Explanation

The frontend is implemented using Next.js 16 with React 19 and handles user interactions such as question submission, viewing answers, and tracking question history. All communication between the frontend and backend is performed using RESTful API calls. The UI is styled with TailwindCSS and uses React Hook Form for robust form validation.

The backend is responsible for business logic, input validation, authentication, and database operations. Multiple AI services (Google Generative AI, Groq, OpenAI) are integrated to provide flexible explanation generation capabilities. OCR processing via Tesseract.js converts image-based questions into text. All AI services are accessed only through the backend to ensure secure API key handling and controlled usage.

Authentication is handled through Firebase Authentication and Next-Auth, with JWT token support and bcrypt password hashing for local authentication methods. User sessions are managed securely through Prisma adapter integration.

The database stores user profiles, submitted questions (with optional image URLs), generated answers, and follow-up Q&A threads. Data modeling includes User, Question, Answer, and FollowUp entities. Security controls such as input validation, access control, and secure authentication are enforced at the backend API layer.

The system follows a Modular Monolithic Architecture. All components are deployed as a single Docker container, but internally structured into separate modules (REST API endpoints, AI service layer, database layer with Prisma ORM, authentication layer with Firebase/Next-Auth) to maintain scalability and maintainability. The application supports both local development and cloud deployment via Docker Compose.

---

## Notes

This README now reflects the current implementation, including authentication, OCR-based question entry, AI-driven explanation generation, follow-up threading, and user dashboard/history management.
