# Final Project – Web Application Development and Security

Course Code: COMP6703001  
Course Name: Web Application Development and Security  
Institution: BINUS University International  

---

## 1. Project Information

Project Title:  
Homework Question & Answer Assistant

Project Domain:  
Homework Question & Answer Assistant

Class:  
L4AC

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

Version Control:  
- GitHub

---

## 5. System Architecture

### 5.1 Architecture Diagram (Text-Based)

User (Browser)
↓
Frontend (Next.js)
↓
REST API (Node.js / Next.js API Routes)
↓
Database (PostgreSQL)
↓
AI Services (OCR & NLP)
