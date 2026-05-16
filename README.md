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
| File storage | Cloudflare R2 (S3-compatible) |
| AI | OpenAI GPT-4o |
| Infrastructure | Docker Compose (local dev) |

## Prerequisites

- Node.js 18+
- Docker + Docker Compose
- An OpenAI API key

## Local development

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 and MinIO on port 9000 (R2-compatible local stand-in). The `resumes` bucket is created automatically.

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

The storage defaults point to the local MinIO instance — no changes needed for local dev.

### 3. Run database migrations

```bash
cd backend
npm install
npx drizzle-kit migrate
```

### 4. Seed sample employees (optional)

```bash
# still in backend/
npm run seed
```

Seeds 15 realistic employee profiles, all approved and immediately searchable. Login password for all: `password123`.

### 5. Start the backend

```bash
npm run start:dev
```

The API runs on **http://localhost:3001**.

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173**.

## Deploying for free

| Service | What it hosts | Free tier |
|---|---|---|
| [Vercel](https://vercel.com) | Frontend | Unlimited personal projects |
| [Railway](https://railway.app) | Backend + PostgreSQL | $5/month credit |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | File storage | 10 GB, zero egress fees |

### Frontend → Vercel

```bash
cd frontend && npm run build   # confirm build passes first
```

Import the repo into Vercel, set the root directory to `frontend`, and deploy.

### Backend → Railway

1. Create a new Railway project and add a **PostgreSQL** plugin — copy the `DATABASE_URL` it gives you.
2. Deploy the `backend/` directory (Railway auto-detects NestJS).
3. Set these environment variables in Railway:

```
DATABASE_URL=<from Railway PostgreSQL plugin>
OPENAI_API_KEY=sk-...
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=<r2-access-key-id>
STORAGE_SECRET_KEY=<r2-secret-access-key>
STORAGE_BUCKET=resumes
STORAGE_FORCE_PATH_STYLE=false
PORT=3001
```

### File storage → Cloudflare R2

1. In the Cloudflare dashboard, go to **R2** and create a bucket named `resumes`.
2. Go to **R2 → Manage API tokens** and create a token with *Object Read & Write* on the `resumes` bucket.
3. Use the token's Access Key ID and Secret Access Key as `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY`.
4. Your account ID is in the R2 overview URL: `dash.cloudflare.com/<account-id>/r2`.

## Environment variables

| Variable | Local default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/skillshub` | PostgreSQL connection string |
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI API key |
| `STORAGE_ENDPOINT` | `http://localhost:9000` | MinIO (local) or R2 endpoint |
| `STORAGE_REGION` | `us-east-1` | `auto` for R2 |
| `STORAGE_ACCESS_KEY` | `minioadmin` | Storage access key |
| `STORAGE_SECRET_KEY` | `minioadmin` | Storage secret key |
| `STORAGE_BUCKET` | `resumes` | Bucket name |
| `STORAGE_FORCE_PATH_STYLE` | `true` | `true` for MinIO, `false` for R2 |
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

## Local MinIO console

When running locally, the MinIO web console is available at **http://localhost:9001** (credentials: `minioadmin` / `minioadmin`) to browse uploaded resumes.
