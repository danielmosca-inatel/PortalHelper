# Academic Portal Helper — Design & Roadmap

An AI-assisted web app that lets professors manage institutional academic-portal
tasks (classes, grades, exam dates, attendance) through a normal dashboard *and*
through a natural-language assistant — replicating the experience of driving the
portal with Claude in Chrome, but built into the app itself.

## Context / key constraint

The target institutional portal is **web-UI only — no public API**. This means
the "AI-assisted" layer has to be a browser-automation agent (Playwright)
orchestrated by our backend, not a REST client. This is the single decision that
shapes the whole architecture below.

## Architecture decision: structured tools over vision/computer-use

Two ways to let an LLM drive the portal:

- **Vision/computer-use** (screenshots + coordinate clicks) — flexible, but a
  misclick on a grade field is a real risk, and it's slower and costlier per action.
- **Structured tools** (recommended) — a thin, hand-written Playwright layer
  exposing specific functions (`listClasses()`, `getStudents(classId)`,
  `setGrade(studentId, value)`, `getExamDates(classId)`, `getAttendance(classId)`).
  Claude's job is only to map the professor's request to the right function +
  arguments (standard tool-use), never to guess coordinates. Deterministic,
  auditable, cheap.

Rule of thumb: **read** tools run freely; **write** tools always return a
confirmation step to the professor before actually submitting to the real portal.
Vision-based automation is kept only as a fallback for pages we haven't mapped yet.

## Main functionalities

1. **Auth** — professor logs into the app; institute portal credentials are
   provided once and stored encrypted server-side (never in plaintext, never
   exposed to the frontend).
2. **Classes** — list and register classes, view rosters.
3. **Grades** — read current grades; register/update grades (confirm-before-submit).
4. **Exam dates** — read the institutional exam calendar per class.
5. **Attendance** — read attendance records (feeds the evaluation feature).
6. **AI chat assistant** — natural-language interface over functionalities 2–5
   ("what's João's grade in Algoritmos I?", "register 8.5 for Maria").
7. **AI performance evaluation** — Claude analyzes cached grades + attendance per
   student/class, flags at-risk students, produces a narrative summary and
   suggested interventions.
8. **Audit log** — every write action recorded: who, what changed, old → new
   value, timestamp. Required once we're touching official records.

## Stack

- **Frontend**: React + Vite + TypeScript, TanStack Query, Tailwind/shadcn.
  Dashboard views + a chat panel for the AI assistant.
- **Backend**: Express + TypeScript.
  - **Playwright** — browser-automation layer (structured tool functions).
  - **BullMQ + Redis** — job queue for automation tasks (Playwright runs take
    seconds, shouldn't block HTTP requests).
  - **Postgres (Prisma)** — cache of scraped classes/grades/attendance, users,
    encrypted portal credentials, audit log.
  - **Anthropic SDK** — agent brain (tool-use for the assistant, completion for
    the evaluation feature).
- **Deployment**: Docker Compose (backend container needs Playwright's Chromium
  deps, plus Postgres and Redis containers).

**Open item to confirm before wider rollout:** check the institute's IT/
acceptable-use policy on automated portal access — not a blocker for building,
but worth confirming before anyone besides us uses it.

## Roadmap

1. **Discovery spike** (few days) — log into the real portal manually, map the
   DOM for grades/classes/exam-dates/attendance pages, note selectors and form
   field names. Prototype one Playwright script that logs in and scrapes the
   grades table. Highest-uncertainty step — do this before committing further.
2. **Read-only MVP** — Express + Playwright read tools, Postgres cache, React
   dashboard showing classes/grades/exam dates/attendance. No AI yet — prove the
   automation layer is reliable.
3. **Write operations** — `setGrade` / `registerClass` tools + confirm-before-
   submit UI + audit log.
4. **AI chat assistant** — wire Claude's tool-use over the tools from steps 2–3,
   so natural language drives the same actions the Chrome extension does today.
5. **AI performance evaluation** — aggregate grades + attendance, Claude-generated
   at-risk flags and narrative, dashboard view.
6. **Hardening** — multi-professor support, alerts when the portal's DOM changes
   and a selector breaks, rate-limiting so automation doesn't trip the portal's
   own bot defenses.
