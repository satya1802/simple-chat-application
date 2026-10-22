# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `e1d5a00` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
Simple chat application is a Quorq-generated two-part project: a Vite + React 19 single-page frontend (approved screens for sign up/in, password reset, and a chat UI) and a FastAPI backend that implements auth (JWT sessions via python-jose, bcrypt password hashing) and conversation/message persistence with a streamed LLM reply. The backend uses SQLAlchemy models against a SQLite database by default (swap via DATABASE_URL) and ships only health-check-plus-real routes, since the frontend currently runs on seeded sample data and is not yet wired to the API.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for Vite 6 / React 19 tooling in frontend/package.json)
- npm
- Python 3.12 (matches backend/Dockerfile base image)
- pip
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository
2. cd frontend && npm install
3. cd backend && pip install -r requirements.txt
4. Set OPENAI_API_KEY (backend/app/config.py validates it at startup, imported by app/main.py) and, optionally, DATABASE_URL (defaults to sqlite:///./app.db) and ALLOWED_ORIGINS (defaults to the Vite dev origins) before starting the backend
5. Optionally run `docker-compose up` from the repo root to start the Postgres (db) and Redis services referenced by the architecture
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| frontend dev | `cd frontend && npm run dev` | Starts the Vite dev server for the SPA |
| frontend build | `cd frontend && npm run build` | Bundles the app with Vite (does not typecheck) |
| frontend preview | `cd frontend && npm run preview` | Serves the production build locally |
| backend dev | `cd backend && uvicorn app.main:app --reload` | Runs the FastAPI service with autoreload; creates SQLite tables on startup |
| docker compose | `docker-compose up` | Starts the Postgres and Redis containers defined for the approved architecture |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `frontend` | Vite + React 19 SPA: approved screens, routing, API client |
| `frontend/src` | App source: screens, shared lib (api, auth, ui, icons, brand), entry point |
| `frontend/src/screens` | One module per approved screen (SignIn, SignUp, ResetPassword, Chat) plus colocated *.test.tsx files |
| `frontend/src/lib` | API client (api.ts), session/auth helpers (auth.ts), UI/icon vocabulary, brand tokens, navigation helpers |
| `frontend/e2e` | Playwright acceptance tests run against a built/served app or a deployed URL (E2E_BASE_URL) |
| `backend` | FastAPI service: app code, tests, Dockerfile, requirements |
| `backend/app` | Application package: main entrypoint, config, database/session setup, SQLAlchemy models, Pydantic schemas, security (JWT/bcrypt), LLM streaming, services, routers |
| `backend/app/routers` | One router per architecture component: auth.py (register/login/logout/password reset) and conversations.py (conversations + messages, streamed replies) |
| `backend/tests` | Pytest suite covering auth, conversations, health, LLM, config startup, and secret-leak checks |
| `.quorq` | Platform metadata (handoff.json, prepared.json) from the Quorq AI SDLC generator, not application code |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one router per architecture component, one route per API-spec endpoint; unimplemented routes return a typed StubResponse rather than erroring
- Backend schemas (app/schemas.py) follow a *Create/*Out/*Request/*Response naming pair per entity, mirrored from the SQLAlchemy models in app/models.py
- UUID primary keys use a custom GUID type (native UUID on Postgres, CHAR(36) elsewhere) so the app runs on SQLite without a real database server
- All conversation/message routes require a valid session via get_current_user; ownership is checked and a mismatched owner returns the same 404 as a missing resource
- Logout revokes JWTs by jti in a RevokedToken table, checked on every authenticated request
- Frontend: one file per approved screen under src/screens/, each with a colocated *.test.tsx; all API calls go through the single apiFetch/apiStream helpers in src/lib/api.ts which attach the bearer token from src/lib/auth.ts
- Frontend brand/styling is centralized in src/lib/brand.ts and src/index.css as CSS variables, consumed via Tailwind-driven classes in src/lib/ui.tsx and screens
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| frontend unit tests | `cd frontend && npm test` | Runs Vitest component tests under src/ |
| frontend lint | `cd frontend && npm run lint` | ESLint over the whole frontend app |
| frontend typecheck | `cd frontend && npm run typecheck` | Runs tsc --noEmit (not run by npm run build) |
| frontend e2e | `cd frontend && npm run test:e2e:install && npm run test:e2e` | Installs the Chromium browser then runs Playwright acceptance tests from e2e/, booting both backend and frontend locally unless E2E_BASE_URL is set |
| backend tests | `cd backend && pytest` | Runs the pytest suite (auth, conversations, health, LLM, config, secret-leak checks) |
| backend lint | `cd backend && ruff check .` | Lints the backend with Ruff |
| backend format | `cd backend && ruff format .` | Formats backend code with Ruff |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend requests to the backend are blocked by the browser (CORS) | Set ALLOWED_ORIGINS (comma-separated) on the backend to include the frontend's origin; it defaults to the Vite dev origins http://localhost:5173 and http://127.0.0.1:5173 |
| `npm run build` succeeds but the app doesn't match expectations from TypeScript's perspective | Run `npm run typecheck` separately (tsc --noEmit) — the build does not typecheck and can pass while tsc would fail |
| Backend fails to start or import fails around password hashing | Ensure requirements.txt's pinned bcrypt==4.0.1 is installed as-is; newer bcrypt removes an attribute passlib 1.7.4 probes at import time |
| Backend startup fails complaining about a missing key | Set OPENAI_API_KEY — app/config.py validates it at import, and app/main.py imports config at startup |
| `pytest` can't import `app` when run from an unexpected directory | Run pytest from the backend/ directory (backend/pytest.ini sets pythonpath = . and testpaths = tests) |
| Playwright e2e tests fail with no browser installed | Run `npm run test:e2e:install` before `npm run test:e2e` |
<!-- sdlc:auto:end troubleshooting -->
