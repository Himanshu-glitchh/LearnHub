# LearnHub — All-in-One EdTech Platform

A full-stack learning platform that combines **courses**, **quizzes**, **classrooms**, **coding practice**, and **1-on-1 chat** into one product.

Built with **Spring Boot 3** (Java 21), **React 19** (Vite + Tailwind), and **PostgreSQL 16**.

---

## Features

### For Students
- Browse and enroll in **free courses** (with auto-generated Udemy-style thumbnails)
- Watch inline **YouTube-embedded lessons** or uploaded videos/PDFs
- Take **timed quizzes** (5 min, 5 questions) with auto-grading and retry on failure
- Practice **DSA problems** with 25+ seeded questions linked to LeetCode
- Join **classrooms**, submit assignments (text + PDF/video upload)
- **1-on-1 chat** with instructors (polling-based real-time)
- Live **notifications** (bell icon with unread count)

### For Instructors
- Create courses with **recorded video sections** or link to **external courses** (YouTube/Coursera/Udemy)
- Upload lesson videos/PDFs directly (up to 500 MB)
- Build quizzes with MCQ / True-False / Short Answer questions
- Create classrooms and add students from your course enrollments pool
- Assign **description-based** work (with PDF resource) **or link a quiz** as an assignment
- Grade submissions with marks and feedback
- **Track record** — see all enrolled students and quiz attempts per course
- Auto-notified when students enroll, submit quizzes, or send messages

---

## Tech Stack

| Layer      | Tech                                                           |
| ---------- | -------------------------------------------------------------- |
| Backend    | Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, Java 21 |
| Database   | PostgreSQL 16, Flyway migrations                               |
| Frontend   | React 19, Vite, Tailwind CSS 3, React Router, React Query, Zustand |
| File uploads | Local disk (`uploads/` folder)                               |
| Auth       | JWT (access + refresh tokens)                                  |

---

## Prerequisites

- **Java 21** (OpenJDK or similar)
- **Maven 3.9+** (or use the included `./mvnw` wrapper)
- **Node.js 20+** and npm
- **PostgreSQL 16+** (local install or Postgres.app on macOS)

---

## Setup

### 1. Database

Create a Postgres database named `learnhub`:

```bash
createdb learnhub
```

(or via `psql`: `CREATE DATABASE learnhub;`)

Flyway will auto-run all migrations on first backend startup, seeding:
- 3 demo users (Alice — Instructor, Bob — Tutor, Carol — Student, password: `password`)
- 10 sample courses with sections and 30+ YouTube-linked lessons
- 6 quizzes with 5 questions each
- 25 DSA problems

### 2. Backend

```bash
cd backend
cp .env.example .env          # edit DB credentials in .env
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env          # optional; defaults to localhost:8080
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Demo Accounts

All demo accounts use the password `password`.

| Email                  | Role       |
| ---------------------- | ---------- |
| `alice@learnhub.com`   | Instructor |
| `bob@learnhub.com`     | Tutor      |
| `carol@learnhub.com`   | Student    |

---

## Project Structure

```
learnhub/
├── backend/
│   ├── src/main/java/com/learnhub/
│   │   ├── auth/          # JWT, users, login/register
│   │   ├── course/        # Courses, sections, lessons, enrollments, reviews
│   │   ├── quiz/          # Quizzes, questions, attempts
│   │   ├── classroom/     # Classrooms, assignments, submissions
│   │   ├── batch/         # Student batches + course/quiz assignments
│   │   ├── coding/        # DSA problems + attempts
│   │   ├── chat/          # Chat rooms + messages
│   │   ├── notification/  # In-app notifications
│   │   └── common/        # Config, security, exceptions, file upload
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/  # Flyway SQL migrations (V1..V6)
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API modules
│   │   ├── components/    # Layout, Navbar, shared components
│   │   ├── pages/         # Route pages (courses, quiz, classroom, etc.)
│   │   ├── store/         # Zustand stores (auth)
│   │   └── App.jsx        # Router
│   └── package.json
│
└── README.md
```

---

## API Overview

Base URL: `http://localhost:8080/api/v1`

| Group          | Endpoint examples                                         |
| -------------- | --------------------------------------------------------- |
| Auth           | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` |
| Users          | `GET /users/me`, `PUT /users/me`, `PATCH /users/me/password`  |
| Courses        | `GET /courses`, `POST /courses`, `POST /courses/{id}/enroll`   |
| Quizzes        | `GET /quizzes`, `POST /quizzes/{id}/submit`                    |
| Classrooms     | `POST /classrooms`, `POST /classrooms/{id}/assignments`       |
| Chat           | `GET /chat/rooms`, `POST /chat/rooms/{id}/send`               |
| Notifications  | `GET /notifications`, `PATCH /notifications/read-all`         |
| Problems       | `GET /problems`, `POST /problems/{id}/attempt`                |
| Files          | `POST /files/upload` (multipart), `GET /files/{filename}`     |

All non-public endpoints require `Authorization: Bearer <JWT>` header.

---

## Environment Variables

### Backend (`backend/.env`)
```
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-me-to-a-random-256-bit-secret-string
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Development Notes

- **File uploads** are stored in `backend/uploads/` (gitignored). This folder is auto-created on first upload.
- **JWT expiration**: 24h access token, 7d refresh token (configurable in `application.yml`).
- **Chat** uses simple polling (every 2s) — no WebSocket dependency.
- **Notifications bell** polls unread count every 15s.
- **Flyway** validates schema on startup, so entity changes must be paired with a matching `V*.sql` migration.

---

## License

MIT
