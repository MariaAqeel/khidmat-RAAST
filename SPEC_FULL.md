# RAST Schooling System — Student, Therapist & Parent Management Platform (Full Original Spec)

Build a complete, production-quality web application for **RAST Schooling System**, a special-needs education and therapy management platform.

The existing prototype is primarily student-facing. Expand it into a complete system with **three user roles: Student, Therapist, and Parent**, plus an internal Admin role.

The application should be functional, responsive, database-backed, and polished — not just a static UI mockup.

---

## 1. Existing App Reference

A video shows the existing application (login, student profile, informal assessment checklist, progress reports, calendar/date records, daily coverage reports, Behavior/OT/Speech/Remedial therapy, student progress info). Use it as UI/UX reference — preserve the useful design language and workflow while expanding into a complete role-based platform. Feel like the next, much more complete version of the existing app; do not simply copy the existing student interface.

## 2–5. User Roles

**Student** — limited view: own profile, attendance, therapy schedule, upcoming/completed sessions, progress, goals, assessment results, therapist info, shared reports, daily therapy info, achievements over time. Cannot edit therapist-entered clinical info.

**Therapist** (Behavior/OT/Speech/Remedial/Teacher/Administrator types) — sees only assigned students unless admin. Can view/search students and their case history, health info, assessments, therapy history; create daily coverage reports; edit own reports; record observations/activities/progress/goals/recommendations/attendance; upload documents; view prior reports and progress over time; create/update progress reports; view and add Parent/Teacher meeting minutes; see other therapists' relevant info on shared students; message parents; track goals/milestones. Cannot modify another therapist's historical report without admin permission.

**Parent** — clean dashboard for their child(ren); may be linked to multiple students. Views: profile, attendance, schedule, upcoming/completed sessions, progress, goals, assessments, therapist info, progress reports, home recommendations, meeting minutes; receives notifications/announcements; messages assigned therapists where enabled. Cannot edit official therapist records. May add clearly-labeled **Parent Input**: home observations, comments, questions, updates — never mixed with therapist observations.

**Admin** (internal role) — create students/parents/therapists; assign therapists to students and students to programs; manage classes/departments/schedules/attendance; view all reports; edit/correct records; manage assessments/documents/users/permissions/school info; view analytics; export reports.

## 6. Main Dashboard
Role-dependent. Therapist dashboard shows: total assigned students, today's sessions, completed sessions, pending daily reports, upcoming sessions, students needing attention, recent progress, quick actions (Add Daily Coverage Report, View Students, Record Session, Add Assessment, Add Progress Note, View Calendar), plus a session calendar.

## 7–8. Student Profile
Basic info (name, student ID, age, DOB, gender, program, class/shift, enrollment date, parent/guardian, contact, photo); medical/health info (history, allergies, medication, emergency contact — access-restricted); assigned therapists by department with contact option. Tabs: Overview, Case History, Assessments, Therapy, Attendance, Goals, Progress, Reports, Meetings, Documents.

## 9. Case History
Structured (not one text blob) — Health and Case History Form categories: basic info, family info, medical history, developmental history, birth history, communication history, educational history, behavioral history, previous therapy, current concerns, parent concerns, other. Authorized staff can edit/update with timestamps preserved.

## 10. Assessments
Informal Assessment Checklist: assessment name, student, date, assessor, department, category, skill, rating/status, notes, recommendations. Categorized skills:
- **Communication:** vocabulary, receptive language, expressive language, object recognition, following commands
- **Behavior:** attention, sitting tolerance, eye contact, compliance, emotional regulation
- **Occupational Therapy:** fine motor, gross motor, sensory processing, pencil grip, balance, eye-hand coordination, ADLs
- **Academic/Remedial:** tracing, writing, letter formation, number recognition, matching, joining dots, pencil control

Therapists can add new categories/skills.

## 11. Therapy Module
Unified module for Behavior, OT, Speech, Remedial departments, each with its own report template.

## 12–17. Daily Coverage Reports (convert existing Google Docs into structured digital forms)

**ADL:** student, date, therapist, session duration, activities, feeding, toilet training, dressing, buttoning, grooming, independence level, assistance required, observations, progress, recommendations. Ratings: Independent / Minimal / Moderate / Maximum Assistance / Not Attempted.

**Behavior Therapy:** student, date, therapist, session duration, focus areas, activities, attention, eye contact, command following, compliance, sitting tolerance, emotional regulation, behavior observations, prompts required, reinforcement used, progress, challenges, recommendations.

**Occupational Therapy:** student, date, therapist, goals, activities, fine motor, gross motor, sensory processing, eye-hand coordination, balance, pencil grip, ADLs, sensory issues, assistance required, performance rating, observations, progress, recommendations. Activities include compression therapy, puzzle tasks, swing therapy, pipe activities — therapists can add custom activities.

**Speech Therapy:** student, date, therapist, session duration, communication goals, receptive/expressive language, vocabulary, object/animal recognition, sound imitation, sitting tolerance, attention, pronunciation, communication behavior, activities, progress, challenges, recommendations.

**Remedial Therapy:** student, date, therapist, academic goals, tracing, writing, pencil grip, letter formation, number recognition, matching, joining dots, eye contact, classwork tolerance, task completion, assistance required, progress, challenges, recommendations.

## 18. Therapy Session History
Per-student timeline (date, department, therapist, focus, progress, report link), filterable by department/therapist/date/goal/progress status.

## 19. Goals
Title, department, therapist, type (short-term/long-term), description, start/target date, status, progress %, notes. Displayed with progress bars.

## 20. Progress Tracking
Overall progress, by-department, over-time, goals completed/in-progress, areas needing support — via simple charts, all values from real DB data, updatable by therapists/admins.

## 21. Progress Report
Auto-generated from underlying data: Introduction, Behavior/OT/Speech/Remedial Therapy Progress, General Observations, Recommendations — combining daily reports, assessments, goals, therapist notes. Preview, Edit, Save, PDF, Print, Share with parent, Share with student. Internal notes never exposed to parents.

## 22. Parent/Teacher Minutes of Meeting
Date, student, parent(s), teacher, therapists present, purpose, discussion points, parent concerns, teacher concerns, therapist observations, decisions, action items, follow-up date, notes. Authorized staff create; parents view finalized records only.

## 23. Attendance
Student, date, status (present/absent/late/excused), session/therapy attendance. Monthly calendar, attendance %, history, department-wise breakdown. Base on Attendance Monitoring data.

## 24. Daily Log
Date, student, staff member, department, activity, session, observation, incident, progress, notes. Filterable by date/student/department.

## 25–26. Student & Staff Database / Shift Data
Use reference Excel data for students/staff/therapists/departments/programs/classes/shifts — normalize into a proper relational schema rather than importing raw columns. Students carry shift/program/class/assigned teachers/therapists; UI filters by Morning/Afternoon.

## 27. Database Design (recommended models)
Users(id, name, email, password_hash, role, status) · Students(id, student_id, name, date_of_birth, gender, program, class, shift, enrollment_date) · Parents(id, user_id, contact_information) · StudentParents(student_id, parent_id, relationship) · Therapists(id, user_id, department) · StudentTherapists(student_id, therapist_id, department) · CaseHistory(id, student_id, data, created_by, updated_at) · Assessments(id, student_id, therapist_id, department, date, type) · AssessmentItems(id, assessment_id, skill, rating, notes) · TherapySessions(id, student_id, therapist_id, department, date, start_time, end_time, status) · DailyReports(id, session_id, report_type, therapist_id, student_id, date, data, notes) · Goals(id, student_id, therapist_id, department, title, description, goal_type, status, progress) · ProgressReports(id, student_id, date, created_by, status, content) · Meetings(id, student_id, date, created_by, notes) · Attendance(id, student_id, date, status, department) · Documents(id, student_id, uploaded_by, document_type, file_path, created_at) · Notifications(id, user_id, title, message, read, created_at). Proper FKs/relationships throughout.

## 28. Role-Based Access Control
Students see only their own data. Parents see only linked children's data. Therapists see only assigned students. Admins see everything. Therapists don't automatically see private parent info they don't need. Parents never see internal therapist/admin notes, private staff discussions, or drafts — only finalized/shareable info.

## 29. Notifications
Examples — Parent: "X's progress report is now available.", "Speech Therapy session scheduled for tomorrow." Therapist: "You have 2 pending daily coverage reports.", "New student assigned to you." Admin: "Attendance report requires review."

## 30. Calendar
Therapy sessions, meetings, assessments, important dates, follow-ups; click an event for details. Therapists create/edit sessions; parents view child's schedule.

## 31. Document Management
Case history docs, assessment docs, progress reports, therapy reports, meeting docs, other files. Fields: name, type, date, uploaded by, student, visibility (Internal/Therapist only/Parent/Student/Admin).

## 32. Search
Global search by student name/ID/parent name/class/program/therapist; therapists get quick access to assigned students.

## 33. UI/UX
Modern, professional, clean, accessible, friendly, suitable for a school/therapy environment, responsive across desktop/tablet/mobile, consistent design system.

Navigation — **Therapist:** Dashboard, Students, Calendar, Sessions, Assessments, Reports, Goals, Meetings, Attendance, Notifications, Profile. **Parent:** Dashboard, My Children, Schedule, Progress, Reports, Attendance, Goals, Meetings, Messages, Notifications, Profile. **Student:** Dashboard, My Profile, My Schedule, My Progress, My Reports, Attendance, Goals, Notifications. **Admin:** Dashboard, Students, Parents, Staff, Therapists, Programs, Classes, Sessions, Attendance, Assessments, Reports, Meetings, Documents, Analytics, Settings.

## 34–36. Dashboards
**Student:** "Welcome, [Name]" — profile summary, today's schedule, upcoming therapy, overall progress, goals, attendance, recent reports.
**Parent:** "Good afternoon, Parent" — child selector (if multiple), today's schedule, progress by department, recent updates, upcoming (e.g. Parent/Teacher meeting date), home recommendations.
**Therapist student view:** header (photo, name, age, program, class, shift); quick actions (Start Session, Add Daily Report, Add Assessment, Add Goal, Add Progress Note); tabs (Overview, Case History, Assessments, Therapy, Goals, Progress, Attendance, Reports, Meetings, Documents).

## 37–38. Data Import & Sample Student
Reference files: Afternoon Shift Data.xlsx, Case History.xlsx, Daily Log Sheet.xlsx, Student & Staff Data Sheet.xlsx, Attendance Monitoring.xlsx, plus Google Forms/Docs for ADL/Behavior/OT/Remedial/Speech Daily Coverage Reports, Health and Case History Form, Informal Assessment Checklist, Parent/Teacher Minutes of Meeting, Progress Report. Design DB/forms around these; build a safe import mechanism (not hardcoded data); if files unavailable, build CSV/Excel import + sample seed data.

Sample seed student: **Abdul Ahad**, age 5, RAST School Readiness Program, Special Needs, Afternoon shift. Therapists — Behavior: Marukh; OT: Dr. Atiya; Speech: Ayesha Imran. Seed data only — never hardcoded into UI.

## 39–40. Security & Audit Log
Secure auth, password hashing, RBAC, protected endpoints, input validation, secure uploads, document access control, audit logs, session management, no sensitive info in URLs, no unrestricted frontend DB access — authorization always enforced server-side.

Audit log tracks who created/edited/viewed sensitive info/generated/shared a report, with timestamp and action, e.g.: "Marukh updated Behavior Therapy report for Abdul Ahad — 5 Dec 2025 4:32 PM."

## 41. Report Generation
Dynamically combine assessment data, therapy reports, goals, attendance, therapist observations, recommendations into a professional report — not one hardcoded template. Provide HTML preview, PDF generation, print, share with parent.

## 42. Analytics (Admin)
Total students, by program/shift/department, attendance rate, therapy sessions, completed/pending reports, progress trends — with charts.

## 43–44. Backend/API
React + TypeScript frontend; Node.js + Express (or equivalent) backend; PostgreSQL; Prisma (or equivalent ORM); secure session/JWT auth; Tailwind CSS; Recharts; server-side PDF library. Clean REST API, e.g.: POST /auth/login · GET /students · GET /students/:id · GET /students/:id/progress · GET /students/:id/assessments · GET /students/:id/therapy · POST /therapy/sessions · POST /therapy/reports · GET /reports/:id · POST /assessments · POST /goals · POST /meetings · GET/POST /attendance · GET /notifications.

## 45. UX Requirement — Multi-Step Forms
Break complex forms into logical steps (e.g. OT report: Session Info → Goals → Activities → Skill Performance → Observations → Progress → Recommendations) with Save Draft / Previous / Next / Submit.

## 46–49. Visualization, Responsiveness, Empty/Loading/Error States
Progress bars, skill ratings, attendance calendars, goal % , therapy timelines, progress charts with accessible labels. Fully responsive (desktop/laptop/tablet/mobile) — therapists may enter reports on tablets/phones. Every page has a meaningful empty state with an action button where relevant. Proper loading skeletons, error messages, success notifications, form validation, confirmation dialogs — never a blank screen.

## 50. Final Quality Bar
Should feel like a real SaaS product used by an actual special-needs school — not a CRUD demo, static prototype, disconnected forms, or generic hospital dashboard. One integrated ecosystem: Student → Therapist → Therapy Data → Assessments → Goals → Progress → Parent.

## 51. Development Order
1. Project architecture 2. DB schema 3. Auth 4. RBAC 5. Admin/user mgmt 6. Student database 7. Therapist/student assignments 8. Student profile 9. Case history 10. Assessments 11. Therapy sessions 12. Daily coverage reports 13. Goals 14. Progress tracking 15. Progress report generation 16. Parent dashboard 17. Student dashboard 18. Meetings 19. Attendance 20. Notifications 21. Documents 22. Analytics 23. Data import 24. Audit logging 25. Responsive/mobile optimization 26. Testing 27. Final UI polish.

## 52. Most Important Requirement
Not frontend-only — a working full-stack app. All data in the database. Creating a daily coverage report must connect: Student record → Therapy session → Daily report → Goals/progress → Progress analytics → Parent-visible update (if shared). Parent profile view reflects real DB data. Admin therapist-assignment changes affect what that therapist sees.

## 53. Demo Accounts
admin@rast.local · therapist@rast.local · parent@rast.local · student@rast.local — secure dev passwords, documented only in dev seed/setup docs.

## 54. Deliverable / Acceptance Checklist
Run in Replit. Log in as Admin → create/manage students & therapists → assign therapists to students. Log in as Therapist → see assigned students → open a student profile → create a therapy session → fill out and save a Daily Coverage Report → update goals → view progress → generate a progress report. Log in as Parent → see child's appropriately-shared info, progress, reports, attendance, meetings, recommendations. Log in as Student → see own limited info.

## 55. Building Instructions
Inspect existing project/code and reference Excel files before replacing anything; don't rebuild what already works. Schema and migrations first, then backend APIs, then frontend. Reusable components, not duplicated pages. Real DB data, not hardcoded UI values. Realistic seed data. Modular, maintainable code. Test after each module; fix TS/build/runtime errors before moving on. Final verification: auth works, RBAC works, CRUD works, DB relationships work, forms save, reports load, parent/student permissions hold, therapist assignments work, PDF generation works, mobile works, no major console errors. Build the actual working application — not mockups.
