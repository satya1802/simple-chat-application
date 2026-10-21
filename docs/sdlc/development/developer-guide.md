# Developer Guide

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start status -->
_Up to date._
<!-- sdlc:auto:end status -->

<!-- sdlc:auto:start source -->
Generated from commit `af10460` · model `claude-sonnet-5`
<!-- sdlc:auto:end source -->

<!-- sdlc:auto:start overview -->
This is a generated two-app chat project: a Vite + React 19 SPA (frontend/) with all screens approved but still running on seeded sample data, and a FastAPI 0.115 backend (backend/) scaffolded from an approved API spec where every route except /health is a typed stub. The backend defaults to a local SQLite file so it runs with no database server, though docker-compose.yml provisions Postgres 16 and Redis for the eventually-approved architecture. The frontend and backend are not yet wired together — frontend/src/lib/api.ts is the seam for that.
<!-- sdlc:auto:end overview -->

<!-- sdlc:auto:start prerequisites -->
- Node.js (for Vite 6 / React 19 / TypeScript 5.6, used by frontend/package.json)
- npm
- Python 3.12 (matches backend/Dockerfile)
- pip
- Docker and Docker Compose (optional, for db/redis via docker-compose.yml)
<!-- sdlc:auto:end prerequisites -->

<!-- sdlc:auto:start setup -->
1. Clone the repository
2. cd backend && pip install -r requirements.txt
3. uvicorn app.main:app --reload   # starts the API on http://localhost:8000, creates app.db (SQLite) on startup
4. cd ../frontend && npm install
5. npm run dev   # starts the Vite dev server (default http://localhost:5173)
6. Optional: from the repo root run `docker-compose up` to start Postgres and Redis if DATABASE_URL/architecture packages are wired up
<!-- sdlc:auto:end setup -->

<!-- sdlc:auto:start run -->
| Name | Command | Description |
|---|---|---|
| backend dev | `uvicorn app.main:app --reload` | Run the FastAPI backend locally with auto-reload (from backend/) |
| frontend dev | `npm run dev` | Run the Vite dev server for the React SPA (from frontend/) |
| frontend build | `npm run build` | Bundle the frontend with Vite; does not typecheck |
| frontend preview | `npm run preview` | Serve the production build locally |
| docker compose | `docker-compose up` | Start Postgres 16 and Redis containers defined in docker-compose.yml |
<!-- sdlc:auto:end run -->

<!-- sdlc:auto:start structure -->
| Path | Purpose |
|---|---|
| `backend` | FastAPI service: app package, routers, models, schemas, tests, Dockerfile, requirements.txt |
| `backend/app` | Application code: main.py entrypoint, database.py (SQLAlchemy engine/session), models.py, schemas.py, services.py, routers/ |
| `backend/tests` | Pytest test suite (currently just the health check) |
| `frontend` | Vite + React 19 SPA: approved screens running on seeded sample data |
| `frontend/src` | App source: screens/, lib/ (api client, UI/icon vocabulary, brand tokens), App.tsx, main.tsx |
| `frontend/e2e` | Playwright acceptance tests |
| `docker-compose.yml` | Local Postgres and Redis services for the approved architecture |
| `.quorq` | Platform metadata (handoff.json) for the Quorq AI SDLC platform |
<!-- sdlc:auto:end structure -->

<!-- sdlc:auto:start conventions -->
- Backend: one router per architecture component owning endpoints; every generated route returns a typed StubResponse until implemented
- Backend: SQLAlchemy models inherit a shared DeclarativeBase (app.database.Base); tables created via Base.metadata.create_all on startup (no migrations yet)
- Backend: DATABASE_URL env var selects the database, defaulting to local SQLite; ALLOWED_ORIGINS env var configures CORS, defaulting to the Vite dev server origins
- Frontend: one module per approved screen under src/screens/, routed from App.tsx's route table
- Frontend: shared UI/icon vocabulary in src/lib/ui.tsx and src/lib/icons.tsx; brand tokens in src/lib/brand.ts and index.css
- Frontend: API base URL comes from VITE_API_BASE_URL at build time, falling back to http://localhost:8000 (src/lib/api.ts); screens don't call it yet
- Frontend: component tests live beside the components they test and are matched under src/**/*.{test,spec}.{ts,tsx}; e2e specs live separately in e2e/
<!-- sdlc:auto:end conventions -->

<!-- sdlc:auto:start testing -->
| Name | Command | Description |
|---|---|---|
| backend test | `pytest` | Run backend unit tests (from backend/); pythonpath=. lets tests import app |
| backend lint | `ruff check .` | Lint the backend code |
| backend format | `ruff format .` | Format the backend code |
| frontend test | `npm run test` | Run Vitest component tests |
| frontend typecheck | `npm run typecheck` | Run tsc --noEmit (not run by build) |
| frontend lint | `npm run lint` | Run ESLint over the frontend app |
| frontend format check | `npm run format:check` | Check formatting with Prettier |
| e2e install | `npm run test:e2e:install` | Install the Chromium browser for Playwright |
| e2e test | `npm run test:e2e` | Run Playwright acceptance tests from e2e/; builds/boots the app and backend automatically unless E2E_BASE_URL is set |
<!-- sdlc:auto:end testing -->

<!-- sdlc:auto:start troubleshooting -->
| Problem | Solution |
|---|---|
| Frontend can't reach the backend / CORS errors in the browser console | Ensure the backend is running on the URL frontend expects (default http://localhost:8000) or set VITE_API_BASE_URL; set ALLOWED_ORIGINS on the backend to include the frontend's origin if it differs from the default dev origins (localhost:5173/127.0.0.1:5173) |
| `pytest` fails with ImportError for `app` | Run pytest from the backend/ directory so backend/pytest.ini's pythonpath = . setting is used |
| Playwright e2e tests fail to launch a browser | Run `npm run test:e2e:install` first to fetch Chromium |
| Backend uses SQLite instead of the approved Postgres | Set the DATABASE_URL env var to the Postgres connection string (e.g. matching docker-compose.yml's db service) before starting uvicorn |
| `npm run build` succeeds but deployment/typecheck fails | Run `npm run typecheck` (tsc --noEmit) separately, since build does not typecheck |
<!-- sdlc:auto:end troubleshooting -->
