# RAST Schooling System

Special-needs education & therapy management platform — Student, Therapist,
Parent and Admin roles, backed by a real relational database.

This repo is a **scaffold**, not a finished app: the schema, auth, RBAC
middleware, and route structure are real and wired together, but most
business-logic routes are minimal, and the frontend (`frontend/src/App.tsx`)
is still the mock-data prototype — it hasn't been connected to
`frontend/src/lib/api.ts` yet. Use `SPEC.md`'s phase checklist as the build
order, ideally with Claude Code driving the actual implementation from here.

## Project layout

```
rast-schooling-system/
├── SPEC.md              ← phased build checklist (start here)
├── SPEC_FULL.md          ← full original spec, unabridged
├── assets/
│   └── data/             ← real Excel files (roster, case history, daily log)
├── database/
│   ├── prisma/schema.prisma   ← full data model (17 models)
│   └── seed/                  ← demo seed script + Excel importer
├── backend/               ← Node + Express + TypeScript API
│   └── src/
│       ├── middleware/    ← JWT auth + RBAC (ownership checks per role)
│       ├── routes/        ← one file per resource
│       └── lib/           ← prisma client, audit log helper
└── frontend/               ← Vite + React + TypeScript
    └── src/
        ├── App.tsx         ← UI prototype (mock data — wire to lib/api.ts)
        └── lib/api.ts       ← typed fetch client for the backend above
```

## First-time setup

**Prerequisites:** Node.js 20+, Docker (for local Postgres) or your own Postgres instance.

```bash
# 1. Start a local database
docker compose up -d

# 2. Install and set up the database package
cd database
npm install
cp ../backend/.env.example .env   # edit DATABASE_URL if not using docker-compose defaults
npm run migrate                    # creates tables from schema.prisma
npm run seed                       # demo accounts + sample student (Abdul Ahad)
npm run import:excel               # optional: import real roster from /assets/data

# 3. Backend
cd ../backend
npm install
cp .env.example .env
npm run dev                        # http://localhost:4000

# 4. Frontend (separate terminal)
cd ../frontend
npm install
npm run dev                        # http://localhost:5173
```

## Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@rast.local | RastDev!2026 |
| Therapist | therapist@rast.local | RastDev!2026 |
| Parent | parent@rast.local | RastDev!2026 |
| Student | student@rast.local | RastDev!2026 |

Change `DEV_PASSWORD` in `database/seed/seed.ts` before any real deployment,
and never commit a real `.env` file.

## What's real vs. stubbed right now

**Real and working:**
- Full Prisma schema matching SPEC.md §27
- JWT login (`POST /auth/login`)
- Role-scoped `GET /students` (admin sees all, therapist sees assigned, parent sees own children, student sees self)
- Ownership-enforced `requireAssignedStudent` middleware used across student sub-resources
- Audit logging on every write route
- Seed script + Excel importer

**Stubbed / needs building out (see SPEC.md phases for order):**
- Frontend isn't calling the backend yet — `App.tsx` still runs on the in-memory mock data from the original prototype
- Daily report templates: only a generic `data: Json` field exists — the ADL/Behavior/OT/Speech/Remedial field-specific validation (SPEC.md §12–17) isn't enforced yet
- Progress report generation (SPEC.md §21), PDF export, document upload/storage, notifications triggers, and the analytics dashboard queries are not implemented
- No automated tests yet

## Suggested next steps in Claude Code

1. Open this folder in Claude Code.
2. Point it at `SPEC.md` and ask it to continue from Phase 1's remaining items — verify the schema against `SPEC_FULL.md` §27, run the first migration, and confirm auth + RBAC work end-to-end with the seeded accounts.
3. Then work through `frontend/src/App.tsx`: replace the mock arrays with calls to `frontend/src/lib/api.ts`, one view at a time (start with the therapist student list, since that's the shortest path through login → RBAC → real data).
4. Before importing the real roster, open `assets/data/Afternoon_Shift_Data.xlsx` and confirm the column headers match what `database/seed/import-excel.ts` expects — adjust the mapping if they don't.
