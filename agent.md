# Regrove Repo Brief

## Purpose

Regrove is structured as a web portal for social workers and children. The intended workflow is:

1. A social worker starts a session with a child.
2. Audio is recorded in the web app and uploaded to the Node backend.
3. The backend forwards the file to the Python transcription service.
4. The Python service generates a markdown transcript.
5. That transcript is expected to be summarized into case-oriented notes / CANS-style output.
6. The worker reviews the result before it is treated as case documentation.

The repo only partially implements that full flow today.

## Repo Layout

- `frontend/`: React 19 + TypeScript + Vite client.
- `backend/`: Express API with JWT auth, child/profile routes, and audio upload forwarding.
- `api/`: Flask + `faster-whisper` transcription service, GPU-oriented by default.
- `docker-compose.yml`: Brings up `frontend`, `backend`, `api`, and `db` (Postgres 16).

## Main Entrypoints

- Frontend app boot: [frontend/src/main.tsx](/home/cj/ide/Regrove/frontend/src/main.tsx:1)
- Frontend router: [frontend/src/App.tsx](/home/cj/ide/Regrove/frontend/src/App.tsx:1)
- Backend server: [backend/server.js](/home/cj/ide/Regrove/backend/server.js:1)
- Backend route index: [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:1)
- Python API: [api/main.py](/home/cj/ide/Regrove/api/main.py:1)
- Docker wiring: [docker-compose.yml](/home/cj/ide/Regrove/docker-compose.yml:1)

## Frontend Notes

- The active UI is a role-based SPA with `social_worker` and `child` routes.
- State is split across React contexts such as auth, cases, documentation, events, and messages.
- Some screens call backend APIs, but a meaningful amount of case/documentation state is still local in React context rather than persisted.
- Session-related frontend code is spread across:
  - [frontend/src/pages/social-worker/activeCases.tsx](/home/cj/ide/Regrove/frontend/src/pages/social-worker/activeCases.tsx:1)
  - [frontend/src/components/child-profile/StartSessionButton.tsx](/home/cj/ide/Regrove/frontend/src/components/child-profile/StartSessionButton.tsx:1)
  - [frontend/src/services/sessionService.ts](/home/cj/ide/Regrove/frontend/src/services/sessionService.ts:1)
  - [frontend/src/services/audioService.ts](/home/cj/ide/Regrove/frontend/src/services/audioService.ts:1)

## Backend Notes

- The backend exposes `/api/*` routes and uses JWT middleware from [backend/middleware/authMiddleware.js](/home/cj/ide/Regrove/backend/middleware/authMiddleware.js:1).
- Auth login checks the `admin` table in Postgres and returns a JWT.
- Child profile CRUD is partially backed by Postgres via [backend/models/childModel.js](/home/cj/ide/Regrove/backend/models/childModel.js:1).
- Dashboard recent-children and child profile data are still mock/in-memory:
  - [backend/models/dashboardModel.js](/home/cj/ide/Regrove/backend/models/dashboardModel.js:1)
  - [backend/models/childProfileModel.js](/home/cj/ide/Regrove/backend/models/childProfileModel.js:1)
- Session creation is also mock/in-memory:
  - [backend/models/startSessionModel.js](/home/cj/ide/Regrove/backend/models/startSessionModel.js:1)

## Python API Notes

- `api/main.py` receives uploaded audio at `/transcribe`.
- It writes a temp audio file, transcribes with `faster-whisper`, writes a temporary markdown transcript, then deletes both temp files.
- The service currently POSTs the transcript to `POST {EXPRESS_API_URL}/new-endpoint`, but that endpoint does not exist in the Node backend.
- There is no implemented summarization/CANS pipeline in the Python service yet; current behavior stops at transcription handoff.

## Current Data Flow Reality

Implemented:

- Login with JWT on the backend.
- Protected child/profile routes.
- Audio upload from frontend to backend.
- Backend forwarding audio to the Python transcription service.
- Whisper-based transcription into markdown text.

Missing or incomplete:

- A real backend endpoint to receive the transcript from the Python API.
- A summarization endpoint/service that converts transcript markdown into CANS output.
- Review-and-approve persistence flow for finalized case files.
- Consistent database-backed storage for cases, documentation, and sessions.

## Notable Issues To Expect

- The main route/controller naming has been normalized, but backend role naming and route contracts still need consolidation.
- Role naming is inconsistent:
  - Frontend uses `social_worker` / `child`.
  - Backend auth middleware expects `worker` / `admin` for privileged routes.
- Session start contracts are inconsistent:
  - Backend defines `POST /api/session/start` with `childId` in the JSON body.
  - Some frontend code calls `/session/start/:childId` instead.
- Some frontend calls point to endpoints not present in the backend, including `/session/summarize/:childId`, `/active/`, and `/cans_case/:childId`.

## Fast Orientation For Next Pass

If revisiting this repo later, start in this order:

1. Fix merge conflicts in frontend and backend route/model files.
2. Normalize role names and session route contracts across frontend/backend.
3. Add a real transcript intake endpoint in Express for the Python callback.
4. Decide where summarization lives: Python service, Node backend, or a separate worker.
5. Replace mock case/session/profile stores with database-backed models.
