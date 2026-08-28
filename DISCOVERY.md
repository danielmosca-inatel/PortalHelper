# Portal Discovery Notes

Findings from mapping the real portal (`siteseguro.inatel.br/PortalAcademico`)
via a read-only walkthrough on 2026-08-28. No writes were performed — only
navigation and DOM inspection.

**No real student data (names, matrícula numbers) is recorded here** — the
live pages do show it, but it never belongs in the repo. Grades/attendance
pages are described structurally only.

## Platform

Classic ASP.NET WebForms app running on a MOSS/SharePoint-era shell (CSS
classes like `ms-banner`, `ms-topNavContainer`). Confirms the "browser
automation, not API" call from the roadmap:

- Pages use `__VIEWSTATE` / `__EVENTTARGET` postbacks; many widgets are
  `UpdatePanel`s (partial/AJAX postbacks), not full page loads.
- Server controls (GridView, etc.) get positional generated IDs per row
  (`ctl02`, `ctl03`, ...) — not stable across page loads. Scrape by
  structural CSS selector (`table#id tr`) and cell position, not per-row id.
- Some actions (`ImageButton` controls, e.g. "Incluir Avaliação") submit the
  form on click and may open a **new browser window** (`window.open`) rather
  than navigating in place — Playwright will need
  `context.waitForEvent('page')` for those, not just `page.goto`.
- Entry point after login: `Docentes/WebMenuDocente.aspx` — the main menu,
  useful as a "did login succeed" check.

## Page map

| Feature | Page | Notes |
|---|---|---|
| Classes list | `Docentes/WebListarDisciplinasDocentes.aspx` | Plain listing per discipline (code, name, turma count, workload), not a grid — one block per course. Includes a "Professor/Instrutor" dropdown (relevant if a coordinator views other profs' classes). |
| Grades | `Docentes/WebRegistrarNotas.aspx` | Requires selecting a **Turma** (class section, e.g. "C02 B") from a dropdown. Student roster renders as a GridView `#ctl00_Corpo_UCRelDisciplinasSemestre1_GridDados`-style table (curso/período/matrícula/nome). Grades are **not** a flat column — entry works through an "avaliação" (assessment) workflow per student (icons: incluir/remover avaliação, avaliação em elaboração vs. publicada). Needs a deeper, careful pass before we implement the write path — this is the highest-complexity page. |
| Exam dates | `Docentes/WebCalendarioProvas.aspx?Visao=2` | Clean read-only grid, `#ctl00_Corpo_UCCalendarioProvas1_GridDados`, inside an `UpdatePanel`. Columns: Função, Data da Prova, Turma, Prova, Horário, Local. No student PII — easiest page to automate first. Has view filters (Visão do Aluno/Docente/Conjunta, ordering) as radio inputs. |
| Attendance / lecture log | `Docentes/WebRegistrarFrequencia.aspx` | Per-Turma, per-month view of lectures given (date, número de aulas, assunto) plus workload summary (Carga Horária: obrigatória/ministrada/estimada). Each lecture row has a "Faltas" icon meant to open per-student absence marking — during this pass it did not surface in the same tab/tab-group, likely a popup window. **Needs a follow-up pass** with popup/new-window handling to map the actual per-student attendance form. |

## Login flow

`Docentes/*` pages redirect unauthenticated requests to:

```
WebLogin.aspx?ReturnUrl=%2fPortalAcademico%2fDocentes%2fWebMenuDocente.aspx
```

The login page has four client-side tabs (JS show/hide, `href="#"`, not separate
URLs): **Graduação** (student, default), **Área Acadêmica** (professor/staff —
this is ours), **Pais ou Responsável**, **Serviços**.

Under "Área Acadêmica":

| Field | Type | Accessible label |
|---|---|---|
| Username | text | "Usuário da rede" (an Active Directory / network account — same credential as institutional email/Windows login, not a portal-only password) |
| Password | password | "Senha da rede" |
| Remember me | checkbox | "Me lembrar na próxima vez." |
| Submit | button | "Continuar" |

Plan for the Playwright login tool: navigate to `WebLogin.aspx`, click the
"Área Acadêmica" tab, fill by accessible label (`getByLabel('Usuário da rede')`
/ `getByLabel('Senha da rede')`) rather than chasing generated ASP.NET control
IDs, click "Continuar", then confirm success by waiting for the "Sair" (logout)
link or the `WebMenuDocente.aspx` URL to appear.

Since this is a network/AD credential (not scoped to just this portal), it
deserves stricter handling than a normal per-service password — see the
credential-storage note below.

## Credential handling (decision)

The login is an Active Directory / network account (`daniel.mosca`), not a
throwaway portal password — treat it like a Windows/email password, not a
disposable API key.

**For the current single-user local MVP:**
- Store it in `backend/.env` as `PORTAL_USERNAME` / `PORTAL_PASSWORD`, typed in
  directly by hand (never pasted into chat, never touches this conversation).
  `.env` is already git-ignored at the repo root.
- Backend reads it via `process.env` only inside the Playwright login step. It
  is never logged, never returned in any API response, never written to the
  Postgres cache in plaintext, and never sent to the frontend.
- A plain `.env` is an acceptable tradeoff *only* because it's one person's
  machine, one account, not shared infrastructure.

**Before this app has more than one professor using it**, replace the flat
`.env` with per-user encrypted storage — e.g. AES-256-GCM with a server-side
key held outside the database (env var or a real secrets manager), or an OS
keychain for local-only use. Flag this explicitly if/when we get to
multi-professor support (roadmap step 6) — don't let the single-user shortcut
silently become the multi-user answer.

## Login flakiness (2026-08-28 testing)

Automated login via Playwright succeeded 2 of 5 attempts with identical code.
Failures land back on a blank `WebLogin.aspx` "Área Acadêmica" form with no
visible error message (rules out wrong credentials). Successes land on
`Academico/WebServicoAcademico.aspx` (a generic role hub defaulting to a
student-facing "Aproveitamento Escolar" view — the Docente menu is one more
navigation step away, via `Docentes/WebMenuDocente.aspx` directly or the
"5 - Professores" top-nav link). `login()` now navigates on to that URL
explicitly after a successful login.

**Resolved.** Manual login (by hand, twice) never hit this — narrowing it to
the automated flow. Root cause: clicking "Área Acadêmica" likely triggers an
async `UpdatePanel` postback that re-renders the tab panel; filling the fields
before that settles let the server's re-render silently wipe the typed values
about half the time, with submit then going out on an empty form (matches the
no-error-message symptom). Fix: `page.waitForLoadState('networkidle')` after
the tab click, before filling. Two clean successes in a row after the fix
(`backend/src/services/portalAutomation.ts`).

## Open questions for the next pass

1. **Grades write path** — the "avaliação" workflow (create assessment →
   assign per-student value → publish) needs its own dedicated walkthrough,
   ideally on a non-critical/test turma if available.
3. **Attendance write path** — the "Faltas" popup window needs mapping.
4. Confirm whether `UpdatePanel` partial postbacks fire distinguishable
   network requests Playwright can wait on (`page.waitForResponse`) instead of
   fixed timeouts, to keep automation fast and non-flaky.

## Immediate next step

Read-only MVP (roadmap step 2) can start now for **Classes** and **Exam
dates** — both are simple, low-risk grids with no write concerns. Grades and
Attendance read-paths need the deeper passes above before building their
Playwright tools.
