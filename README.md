# SkillsHub

An AI-powered skills intelligence platform that lets HR teams search for talent using plain English and automatically extracts structured skill profiles from resumes.

## What it does

**For HR:**
- Search across all employee skills using natural language — _"Who can lead a React project that also needs WebSocket experience?"_ — and get back ranked matches with plain-English reasoning and match scores
- Review and approve AI-extracted profiles before they enter the database

**For Employees:**
- Upload a PDF resume — the system extracts skills, proficiency levels, years of experience, and project history automatically using GPT-4o
- Inferred skills are flagged separately (e.g. someone with Next.js has React inferred with a confidence score)

## Tech stack

| Layer | Technology |
|---|---|
| Backend | NestJS (TypeScript) |
| Frontend | React + Vite + TanStack Router |
| UI | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL + Drizzle ORM |
| File storage | MinIO (S3-compatible) |
| AI | OpenAI GPT-4o |
| Infrastructure | Docker Compose |

## Prerequisites

- Node.js 18+
- Docker + Docker Compose
- An OpenAI API key

## Setup

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432, MinIO on port 9000 (console at 9001), and automatically creates the `resumes` bucket.

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

The other defaults work out of the box with the Docker Compose setup.

### 3. Run database migrations

```bash
cd backend
npm install
npx drizzle-kit migrate
```

### 4. Start the backend

```bash
# still in backend/
npm run start:dev
```

The API runs on **http://localhost:3001**.

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173**.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/skillshub` | PostgreSQL connection string |
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI API key |
| `MINIO_ENDPOINT` | `localhost` | MinIO host |
| `MINIO_PORT` | `9000` | MinIO port |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `resumes` | Bucket name for uploaded resumes |
| `PORT` | `3001` | Backend port |

## API overview

All routes are prefixed with `/api/v1/`. Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Sign in, returns token |
| POST | `/auth/logout` | Auth | Invalidate token |
| POST | `/profiles/upload` | Auth | Upload PDF resume, triggers AI extraction |
| GET | `/profiles/my` | Auth | Get own profile |
| GET | `/profiles/queue` | HR | Pending profiles awaiting review |
| PATCH | `/profiles/:id/approve` | HR | Approve a profile |
| PATCH | `/profiles/:id/reject` | HR | Reject a profile |
| GET | `/employees` | Auth | List all employees |
| GET | `/employees/:id` | Auth | Employee profile detail |
| GET | `/search?q=...` | HR | Natural language search |

## How the AI works

**Resume extraction** — the raw text extracted from the uploaded PDF is sent to GPT-4o with a structured prompt. The model returns a JSON object containing skills (with category, proficiency, and years of experience), inferred skills (e.g. Next.js → React), and project history. The profile lands in a review queue before being made searchable.

**Semantic search** — all approved profile summaries are sent to GPT-4o alongside the HR's natural language query. The model returns a ranked list with a match score (0–100) and a one-sentence explanation for each result. No vector embeddings — the reasoning quality is better with a single well-structured prompt at this scale.

## MinIO console

The MinIO web console is available at **http://localhost:9001** (credentials: `minioadmin` / `minioadmin`) to browse uploaded resumes.
