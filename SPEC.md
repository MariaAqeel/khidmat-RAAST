# RAST Schooling System — Build Spec

Special-needs education & therapy management platform. Three primary user roles (**Student, Therapist, Parent**) plus an internal **Admin** role. Full-stack, database-backed, production-quality — not a mockup.

**Stack:** React + TypeScript (frontend) · Node.js + Express (backend) · PostgreSQL + Prisma (data) · Tailwind CSS (styling) · Recharts (charts) · server-side PDF generation.

**How to use this file:** Work top to bottom through PHASES 1–14. Each phase has a checklist — do not move to the next phase until the current one's checkboxes are all true and the app builds/runs with no console or TypeScript errors. Re-read the relevant section below before building it; don't build from memory of the summary alone.

---

## Reference material in this project

- `/data/Afternoon_Shift_Data.xlsx` — real student roster: shift, admission date, name, father's name, class, address, contact info, status. Use as seed source for `Students` + `Parents` + contact fields.
- `/data/Daily_Log_Sheet_-_10062026.xlsx` — Sheet1: free-text daily log entries per student (date, student, note). Sheet2: student × department matrix (Speech/Behavior/OT/Remedial/Sport/Computer/Arts/Physio) — use to seed `StudentTherapists` department assignments.
- `/data/Case_History.xlsx` — mostly blank template; use it only to confirm section headings for the Case History form (§9), not as row data.
- Google Forms (linked separately) — mirror these forms' exact field names and order for: ADL Daily Coverage Report, Behavior Therapy Daily Coverage Report, Health and Case History Form, Informal Assessment Checklist, Occupational Therapy Daily Coverage Report, Parent/Teacher Minutes of Meeting, Remedial Therapy Daily Coverage Report, Speech Therapy Daily Coverage Report, Progress Report. Open each and transcribe fields before building the corresponding form — don't guess field names.
- Seed student: **Abdul Ahad**, age 5, RAST School Readiness Program, Special Needs, Afternoon shift. Therapists: Behavior — Marukh; OT — Dr. Atiya; Speech — Ayesha Imran. He's seed data only, never hardcoded into UI.

---

## PHASE 1 — Architecture & Schema
- [ ] Inspect any existing project code before replacing anything; reuse what already works
- [ ] Set up monorepo/project structure (frontend, backend, prisma)
- [ ] Design full Prisma schema (see §27 model list below) with proper FKs/relations
- [ ] Run initial migration

## PHASE 2 — Auth & RBAC
- [ ] Secure auth (password hashing, session or JWT)
- [ ] Roles: Student, Therapist, Parent, Admin
- [ ] All authorization enforced server-side — never trust frontend for access control
- [ ] Protected API middleware per role/resource
- [ ] Demo accounts seeded: admin@rast.local, therapist@rast.local, parent@rast.local, student@rast.local (dev-only passwords, documented in seed docs only)

## PHASE 3 — Admin: Users & Assignments
- [ ] Admin CRUD: students, parents, therapists, programs, classes, shifts
- [ ] Assign therapists ↔ students (`StudentTherapists`)
- [ ] Assign parents ↔ students (`StudentParents`)
- [ ] Manage departments/programs/classes

## PHASE 4 — Student Profile & Case History
- [ ] Student profile: basic info, health/medical (access-restricted), assigned therapists list
- [ ] Tabbed profile UI: Overview, Case History, Assessments, Therapy, Attendance, Goals, Progress, Reports, Meetings, Documents
- [ ] Structured Case History form (categories per §9, fields mirrored from Health and Case History Form) with edit history/timestamps

## PHASE 5 — Assessments
- [ ] Assessment model: name, student, date, assessor, department, category, skill, rating, notes, recommendations
- [ ] Seed skill categories: Communication, Behavior, Occupational Therapy, Academic/Remedial (see §10 for full skill lists)
- [ ] Allow therapists to add new categories/skills
- [ ] Build against Informal Assessment Checklist form fields

## PHASE 6 — Therapy Sessions & Daily Coverage Reports
- [ ] `TherapySessions` CRUD (start/end time, status, department, therapist, student)
- [ ] Multi-step forms (Save Draft / Previous / Next / Submit) for each report type, fields mirrored exactly from each Google Form:
  - [ ] ADL Daily Coverage Report (§13)
  - [ ] Behavior Therapy Daily Report (§14)
  - [ ] Occupational Therapy Daily Report (§15) — include custom activity support (compression therapy, puzzle tasks, swing therapy, pipe activities, +custom)
  - [ ] Speech Therapy Daily Report (§16)
  - [ ] Remedial Therapy Daily Report (§17)
- [ ] Rating scale: Independent / Minimal / Moderate / Maximum Assistance / Not Attempted where applicable
- [ ] Therapist can edit own reports only; Admin can edit any
- [ ] Therapy timeline view per student, filterable by department/therapist/date/goal/progress status

## PHASE 7 — Goals & Progress
- [ ] Goals model: title, department, therapist, type (short/long-term), description, dates, status, progress %, notes
- [ ] Progress bars per goal
- [ ] Progress page: overall + by-department + over-time, computed from real DailyReports/Assessments/Goals data (never hardcoded)

## PHASE 8 — Progress Report Generation
- [ ] Auto-generate report sections (Behavior/OT/Speech/Remedial progress, General Observations, Recommendations) from underlying DB records
- [ ] Preview, Edit, Save, PDF export, Print, Share-with-parent, Share-with-student
- [ ] Internal notes never exposed to parent/student views

## PHASE 9 — Meetings (Parent/Teacher MoM)
- [ ] Meeting model per §22 fields, mirrored from the Google Form
- [ ] Admin/therapist create; parent views only finalized records

## PHASE 10 — Attendance & Daily Log
- [ ] Attendance CRUD, monthly calendar, % calculation, department-wise breakdown
- [ ] Import baseline from `Afternoon_Shift_Data.xlsx` status column where applicable
- [ ] Daily Log module (date, student, staff, department, activity, observation, incident, notes), filterable — seed from `Daily_Log_Sheet_-_10062026.xlsx`

## PHASE 11 — Notifications, Calendar, Documents, Search
- [ ] Notification model + role-appropriate triggers (§29)
- [ ] Shared calendar (sessions, meetings, assessments, follow-ups) with click-through detail
- [ ] Document upload/management with visibility levels (Internal/Therapist/Parent/Student/Admin)
- [ ] Global search (student by name/ID/parent/class/program/therapist)

## PHASE 12 — Role Dashboards
- [ ] Therapist dashboard (§6): assigned students, today's sessions, pending reports, quick actions, calendar
- [ ] Student dashboard (§34)
- [ ] Parent dashboard (§35) with child selector for multi-child parents
- [ ] Admin analytics dashboard (§42): counts, attendance rate, sessions, pending/completed reports, trend charts

## PHASE 13 — Data Import & Audit Log
- [ ] Safe importer for the Excel files in `/data` → relational tables (don't blindly import every column — normalize first)
- [ ] Audit log: who created/edited/viewed/shared what, with timestamp, human-readable entries (§40 example format)

## PHASE 14 — Polish & Verification
- [ ] Empty states on every list/page
- [ ] Loading skeletons, error states, form validation, confirmation dialogs, success toasts
- [ ] Full responsive pass (desktop/tablet/mobile) — daily report forms usable one-handed on tablet
- [ ] Manual verification against the checklist in §54 of the original spec (login as each role, create session → report → goal → progress → generated report, parent sees only shared data, etc.)
- [ ] No console errors, no TypeScript errors, no unrestricted frontend DB access

---

## Data model (Prisma models to implement)

Users · Students · Parents · StudentParents · Therapists · StudentTherapists · CaseHistory · Assessments · AssessmentItems · TherapySessions · DailyReports · Goals · ProgressReports · Meetings · Attendance · Documents · Notifications

(Full field lists for each are in the detailed section reference below — pull exact fields from there when generating the Prisma schema, don't abbreviate.)

---

## Full detailed reference

Your original full spec (the 55-section document with every field list, example report, dashboard mockup text, API endpoint list, and DB model — §1 through §55) should sit alongside this file as `SPEC_FULL.md` in the same project root. This file's phase checklists reference it by §number; when a checklist item cites a section, pull the exact field names/copy from there rather than paraphrasing.

Key sections to have open most often while building:
- §27 — full field list for every Prisma model
- §12–17 — exact fields for each daily coverage report template
- §21 — progress report structure
- §22 — meeting minutes fields
- §44 — REST endpoint list
- §51 — development order (mirrors the Phase numbering above)
- §54 — end-to-end acceptance checklist

