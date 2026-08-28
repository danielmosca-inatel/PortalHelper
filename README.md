# Academic Portal Helper

AI-assisted web app for managing institutional academic-portal tasks (classes,
grades, exam dates, attendance) — see [ROADMAP.md](./ROADMAP.md) for the design,
architecture decisions, and phased plan.

## Structure

- `frontend/` — React + Vite + TypeScript, Tailwind, TanStack Query
- `backend/` — Express + TypeScript

## Running locally

```bash
# backend (http://localhost:3001)
cd backend && npm install && npm run dev

# frontend (http://localhost:5173, proxies /api to the backend)
cd frontend && npm install && npm run dev
```

Backend routes currently return mock data — the real portal-automation layer
(Playwright) gets built in the discovery-spike phase of the roadmap.
