# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillsHub is an AI-Powered Skills Intelligence Platform for a hackathon. The two AI-centerpiece features are:
1. **Smart Profile Ingestion** — upload a PDF resume → Claude extracts structured skill data → HR review queue
2. **Semantic Natural Language Search** — HR types a natural language query → Claude returns ranked matches with plain-English reasoning

## Preferred Tech Stack

- **Backend:** NestJS
- **Frontend:** TanStack Router (React)
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** Better-auth
- **File Storage:** MinIO (S3-compatible)
- **AI:** OpenAI API (gpt-4o for extraction and semantic search)

## Repository Structure

```
skills-hub/
├── backend/                  # NestJS API (port 3001)
│   ├── src/
│   │   ├── auth/             # Token-based auth (register/login/logout + AuthGuard + @Roles)
│   │   ├── users/            # Employee list/detail endpoints
│   │   ├── profiles/         # Resume upload, AI extraction, review queue, approve/reject
│   │   ├── search/           # HR natural language search (delegates to AiService)
│   │   ├── files/            # MinIO upload/download via AWS S3 client
│   │   ├── ai/               # Claude API: extractProfile() + semanticSearch()
│   │   └── db/               # Drizzle schema (schema.ts), client (index.ts), DbModule
│   ├── drizzle/              # Generated migration files
│   ├── drizzle.config.ts
│   └── package.json
├── frontend/                 # Vite + React + TanStack Router (port 5173)
│   ├── src/
│   │   ├── pages/            # LoginPage, RegisterPage, DashboardPage, SearchPage,
│   │   │                     # QueuePage, EmployeesPage, EmployeeDetailPage, ProfilePage
│   │   ├── components/       # Layout.tsx (nav + outlet)
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios client + authApi, profilesApi, employeesApi, searchApi
│   │   │   └── auth.ts       # localStorage helpers (getUser, setAuth, clearAuth)
│   │   ├── router.tsx        # TanStack Router tree with auth/protected route groups
│   │   └── main.tsx
│   └── package.json
├── docker-compose.yml        # PostgreSQL 16 + MinIO (auto-creates 'resumes' bucket)
└── requirements.md
```

## Commands

### Backend
```bash
cd backend
npm run start:dev        # Run NestJS in watch mode
npm run build            # Compile TypeScript
npm run test             # Run Jest tests
npm run test:e2e         # End-to-end tests
npx drizzle-kit generate # Generate migration from schema changes
npx drizzle-kit migrate  # Apply migrations
npx drizzle-kit studio   # Open Drizzle Studio UI
```

### Frontend
```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run typecheck        # tsc --noEmit
```

### Infrastructure
```bash
docker-compose up -d     # Start PostgreSQL + MinIO
docker-compose down      # Stop services
```

## Architecture Notes

### Database Schema (Drizzle)
Key tables:
- `users` — id, email, passwordHash, role (`hr` | `employee`), createdAt
- `profiles` — id, userId, status (`pending` | `approved` | `rejected`), rawResumeText, fileKey (MinIO)
- `skills` — id, name, category (`language` | `framework` | `platform` | `tool` | `domain`), normalized name
- `profile_skills` — profileId, skillId, proficiency (`novice` | `intermediate` | `expert`), yearsExperience, inferredFrom
- `projects` — linked to profiles; title, description, skills used

### Auth (Better-auth)
- Two roles: `hr` and `employee`
- Better-auth handles session management; role stored on the user record
- Guards on NestJS routes check role from session

### AI Integration (Claude API)

**Resume Extraction** (`ai/extraction.service.ts`):
- Receive PDF → extract text → send to Claude with a structured extraction prompt
- Claude returns JSON: `{ skills: [{name, category, proficiency, yearsExperience}], projects: [...], inferredSkills: [...] }`
- Store raw result, put profile in `pending` status for review

**Semantic Search** (`search/search.service.ts`):
- Take HR's natural language query
- Build context from all approved profiles (or use embeddings for scale)
- Send to Claude: query + profile summaries → Claude returns ranked list with match scores and plain-English reasoning
- Return `{ results: [{userId, matchScore, reasoning}] }`

### File Upload Flow
- Frontend uploads PDF directly to backend
- Backend streams to MinIO, stores the object key on the profile
- Extraction is triggered after upload completes

### API Structure
All API routes under `/api/v1/`:
- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`
- `POST /profiles/upload` — resume upload (employee or HR)
- `GET /profiles/queue` — pending review queue (HR only)
- `PATCH /profiles/:id/approve` / `/reject` — HR review actions
- `GET /profiles/:id` — view a profile
- `GET /employees` — employee directory
- `GET /search?q=...` — natural language search (HR only)

### Frontend Routes (TanStack Router)
- `/login`, `/register`
- `/dashboard` — role-aware home (HR sees queue + search; employee sees own profile)
- `/employees` — directory (HR)
- `/employees/:id` — profile view
- `/profile/edit` — employee self-edit
- `/search` — HR natural language search interface
- `/queue` — HR review queue with approve/reject actions

## Key Implementation Decisions

- Use `pdf-parse` or `pdfjs-dist` on the backend to extract text from uploaded PDFs before sending to Claude
- For semantic search at hackathon scale (10–50 profiles), send all approved profile summaries in one Claude prompt rather than using vector embeddings — simpler and produces better reasoning
- Skill inference (bonus): include in the extraction prompt — ask Claude to list skills that are strongly implied but not explicitly mentioned, with a confidence score
- Seed the database with 10–15 realistic employee profiles so the search demo works convincingly
