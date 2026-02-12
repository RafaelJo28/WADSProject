# Final Project – Web Application Development and Security

Course Name: Web Application Development and Security  
Institution: BINUS University International  

---

## 1. Project Information

Project Title:  
Homework Question & Answer Assistant

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
- Next.js (React)

Backend:  
- Node.js (Next.js API Routes)

API:  
- RESTful API (JSON)

Database:  
- PostgreSQL with Prisma ORM

AI:  
- OCR for image-based questions  
- NLP for question understanding and explanation generation

Deployment:  
- Docker and cloud-based hosting

Cloud Hosting:
- Vercel (Frontend & API Deployment)
- Managed PostgreSQL Service

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

The frontend is implemented using Next.js and handles user interactions such as question
submission and displaying results. All communication between the frontend and backend
is performed using RESTful API calls.

The backend is responsible for business logic, input validation, authentication, and
database operations. AI services, including OCR and NLP-based explanation generation,
are accessed only through the backend to ensure secure API key handling and controlled
AI usage.

The database stores user data, submitted questions, and solution history. Security
controls such as input validation, rate limiting, and access control are enforced at
the backend API layer to protect the system from misuse and attacks.

The system follows a Modular Monolithic Architecture. All components are deployed as a single application, but internally structured into separate modules (API, AI service layer, database layer, authentication layer) to maintain scalability and maintainability.

---

## Notes

This README serves as the submission for **Weekly Final Project Checkpoint 01**, covering:
- Project selection  
- Technology stack  
- System architecture  

Further features, testing, security implementation, AI testing, and deployment details
will be completed and documented in later project checkpoints.


