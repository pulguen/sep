Project summary

- This repository contains a small Django REST backend and a Vite + React frontend. The backend lives in `backend/` and the frontend in `frontend/`.
- Primary data model: `api.Person` (see `backend/api/models.py`). The frontend UI that manipulates it is `frontend/src/pages/Persons.jsx`.

Quick architecture overview

- Backend (Django + DRF)
  - Entry: `backend/sep_backend/urls.py` mounts `api/` routes (see `backend/api/urls.py`) and JWT endpoints at `/api/token/` and `/api/token/refresh/`.
  - Settings: `backend/sep_backend/settings.py` loads configuration from `.env` and exposes `CORS_ALLOWED_ORIGINS`, `DEBUG`, and JWT authentication (Simple JWT).
  - API: `backend/api/serializers.py`, `backend/api/views.py` (ModelViewSet `PersonViewSet`), `backend/api/models.py`.

- Frontend (React + Vite)
  - API client: `frontend/src/api.js` — axios instance with request/response interceptors implementing JWT attach + refresh flow.
  - Auth context: `frontend/src/AuthContext.jsx` uses `/api/token/` and stores tokens in `localStorage` keys `token` and `refresh`.
  - UI: `frontend/src/pages/Persons.jsx` demonstrates the full CRUD flow against `/api/persons/`.

What an AI coding agent should know (practical checklist)

1. Authentication
   - Backend issues JWT at `POST /api/token/` (obtain) and `POST /api/token/refresh/` (refresh). The frontend expects `access` and `refresh` fields.
   - Tokens are stored in `localStorage` as `token` (access) and `refresh` (refresh token). The axios instance in `frontend/src/api.js` automatically attaches `Authorization: Bearer <token>` and attempts refresh on 401.

2. CORS and local dev
   - Default CORS origin in `settings.py` is `http://localhost:5173`. If changing dev ports or running remote frontend, update `CORS_ALLOWED_ORIGINS` in `.env` or `settings.py`.

3. Running locally (PowerShell)
   - Backend quick start (recommended):
     - Create venv and install: `python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r backend/requirements.txt`
     - Create `.env` from `.env.example` (if present) and run migrations: `python backend/manage.py migrate`
     - Run dev server: `python backend/manage.py runserver` (exposes `http://127.0.0.1:8000/`)
   - Frontend quick start:
     - `cd frontend; npm install` then `npm run dev` (serves at `http://localhost:5173`)
   - Docker compose:
     - `docker-compose up --build` runs both services; ports are mapped `8000` and `5173` (see `docker-compose.yml`).

4. API shape and examples
   - List persons: `GET http://127.0.0.1:8000/api/persons/`
   - Create person (requires auth): `POST http://127.0.0.1:8000/api/persons/` with JSON `{ "first_name": "A", "last_name": "B", "email": "x@x.com" }`
   - Obtain token: `POST http://127.0.0.1:8000/api/token/` with `{ "username": "admin", "password": "..." }` -> returns `{ access, refresh }`

5. Project-specific conventions and patterns
   - Small, explicit code: API viewsets live in `backend/api/views.py`; serializers in `backend/api/serializers.py`. Use those files for changes to the Person API.
   - Settings are environment-driven and use `python-dotenv` to load `backend/.env`.
   - Frontend token refresh queue: `frontend/src/api.js` contains a queue implementation to avoid duplicate refresh calls; preserve that logic when touching auth code.
   - Email uniqueness: `Person.email` is unique; validation errors will be returned as DRF field errors and the frontend expects `err.response.data` shape to display field errors in `Persons.jsx`.

6. Tests and debugging
   - There are no formal unit tests in the repo (empty `backend/api/tests.py`). Prefer manual tests via the running servers and the UI.
   - To debug backend quickly: run `python backend/manage.py shell` or use the Django admin (`/admin/`) after creating a superuser.

Files to inspect when making changes
  - `backend/sep_backend/settings.py` — env, CORS, JWT setup
  - `backend/api/views.py`, `backend/api/serializers.py`, `backend/api/models.py` — API surface and validations
  - `frontend/src/api.js`, `frontend/src/AuthContext.jsx`, `frontend/src/pages/Persons.jsx` — client auth, token handling, UI patterns

If you modify authentication behavior
  - Keep the axios refresh queue pattern in `frontend/src/api.js` or provide an equivalent to avoid race conditions.
  - Ensure JWT endpoints remain at `/api/token/` and `/api/token/refresh/` unless you update both backend and frontend.

When in doubt
  - Run both servers locally and exercise the UI — the app is intentionally small and manual verification is fast.

If you'd like, I can: merge this with any existing copilot instructions you have, expand examples (curl, Postman), or add short run scripts/Makefile entries.
