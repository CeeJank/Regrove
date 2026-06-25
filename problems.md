# Project Problems

## Scope

This file is based on a repo scan of `frontend/src`, `backend`, `api`, [agent.md](/home/cj/ide/Regrove/agent.md:1), and [URL API endpoint called.txt](/home/cj/ide/Regrove/URL API endpoint called.txt:1).

The comparison used:

- Actual mounted backend routes from [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:1)
- Actual frontend routes from [frontend/src/App.tsx](/home/cj/ide/Regrove/frontend/src/App.tsx:1)
- Actual frontend API calls from services/contexts/pages
- Actual Python callback flow from [api/main.py](/home/cj/ide/Regrove/api/main.py:1)

## High Severity

- The active login page calls `POST /api/login`, but the mounted backend route is `POST /api/auth/login`. The current app route in [frontend/src/pages/login.tsx](/home/cj/ide/Regrove/frontend/src/pages/login.tsx:1) cannot authenticate against [backend/routes/authRoutes.js](/home/cj/ide/Regrove/backend/routes/authRoutes.js:1).

- The active register page calls `POST /api/register`, but there is no mounted backend register endpoint. [frontend/src/pages/register.tsx](/home/cj/ide/Regrove/frontend/src/pages/register.tsx:1) has no matching route in [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:1).

- The social-worker calendar depends on `/api/events/*`, but no `events` routes are mounted under `/api`. The frontend calls are in [frontend/src/contexts/EventsContext.tsx](/home/cj/ide/Regrove/frontend/src/contexts/EventsContext.tsx:1), while the mounted backend only exposes `auth`, `users`, `session`, `workers`, `children`, and `child` in [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:1).

- The active-cases session flow is broken end-to-end:
  - Frontend starts sessions with `POST /api/session/start/:childId` in [frontend/src/pages/social-worker/activeCases.tsx](/home/cj/ide/Regrove/frontend/src/pages/social-worker/activeCases.tsx:123)
  - Backend only exposes `POST /api/session/start` with `childId` in the request body in [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:16) and [backend/controllers/startSessionController.js](/home/cj/ide/Regrove/backend/controllers/startSessionController.js:1)
  - Frontend then calls `/api/session/summarize/:childId` and `/api/session/logcase`, but neither route exists in the mounted backend.

- The Python transcription service posts transcripts to `/new-endpoint`, but the Node backend does not expose that endpoint. See [api/main.py](/home/cj/ide/Regrove/api/main.py:66) versus [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:1). This means transcription output has nowhere to go after Whisper finishes.

- The child chatbot makes a direct browser call to Anthropic at `https://api.anthropic.com/v1/messages` from [frontend/src/pages/child/chatbot.tsx](/home/cj/ide/Regrove/frontend/src/pages/child/chatbot.tsx:60). There is no backend proxy, no visible API key handling, and no server-side safeguard. This is both a broken integration path and a security design problem.

## Backend Routing Problems

- The mounted dashboard route file imports `getRecentChildrenForWorker` from [backend/controllers/dashboardController.js](/home/cj/ide/Regrove/backend/controllers/dashboardController.js:1), but that controller currently exports `getMe` and `getDashboard`, not `getRecentChildrenForWorker`. [backend/routes/dashboardRoutes.js](/home/cj/ide/Regrove/backend/routes/dashboardRoutes.js:1) and the controller no longer match.

- The child-profile controller implements `updateRiskLevel` and `saveNotes` in [backend/controllers/childProfileController.js](/home/cj/ide/Regrove/backend/controllers/childProfileController.js:1), but the mounted route file [backend/routes/childProfileRoutes.js](/home/cj/ide/Regrove/backend/routes/childProfileRoutes.js:1) only exposes `GET /api/children/:childId`. The frontend service in [frontend/src/services/casesService.ts](/home/cj/ide/Regrove/frontend/src/services/casesService.ts:103) expects `PATCH /api/children/:childId/risk` and `PATCH /api/children/:childId/notes`, but those are not mounted.

- There is a second backend feature set for chat, conversations, summaries, and worker handover:
  - [backend/routes/chat.js](/home/cj/ide/Regrove/backend/routes/chat.js:1)
  - [backend/routes/conversationRoutes.js](/home/cj/ide/Regrove/backend/routes/conversationRoutes.js:1)
  - [backend/routes/messageRoutes.js](/home/cj/ide/Regrove/backend/routes/messageRoutes.js:1)
  - [backend/routes/summaryRoutes.js](/home/cj/ide/Regrove/backend/routes/summaryRoutes.js:1)
  - [backend/routes/workerRoutes.js](/home/cj/ide/Regrove/backend/routes/workerRoutes.js:1)
  None of these are mounted in [backend/routes/indexRoutes.js](/home/cj/ide/Regrove/backend/routes/indexRoutes.js:1), so they are effectively dead code.

- [backend/routes/case.js](/home/cj/ide/Regrove/backend/routes/case.js:1) exists but is empty and unmounted.

- Backend route naming is normalized in filenames, but the actual API surface is incomplete compared with the repo’s own route files. The project currently has “implemented controllers/routes” that are not reachable from the main server entrypoint.

## Frontend Route and Feature Problems

- The app route for the child catalog is `/sw/child-catalog` in [frontend/src/App.tsx](/home/cj/ide/Regrove/frontend/src/App.tsx:60), but [URL API endpoint called.txt](/home/cj/ide/Regrove/URL API endpoint called.txt:1) still documents `sw/youth-catalogue`. The documentation and actual UI route no longer agree.

- The social-worker home quick-nav links to `/sw/referrals` in [frontend/src/pages/social-worker/home.tsx](/home/cj/ide/Regrove/frontend/src/pages/social-worker/home.tsx:97), but [frontend/src/App.tsx](/home/cj/ide/Regrove/frontend/src/App.tsx:1) does not define that route. Clicking it falls through to the wildcard redirect.

- The social-worker messages page is purely context-backed in [frontend/src/pages/social-worker/messages.tsx](/home/cj/ide/Regrove/frontend/src/pages/social-worker/messages.tsx:1). It does not call the backend chat/conversation/message endpoints that exist elsewhere in the repo. This means the app has two disconnected messaging implementations.

- The child check-in page posts to `/api/sdq/:childId` in [frontend/src/pages/child/checkIns.tsx](/home/cj/ide/Regrove/frontend/src/pages/child/checkIns.tsx:34), but there is no mounted backend SDQ route.

- The events/calendar feature is split across two incompatible implementations:
  - The active calendar UI uses `EventsContext` and `/api/events/*` in [frontend/src/contexts/EventsContext.tsx](/home/cj/ide/Regrove/frontend/src/contexts/EventsContext.tsx:1)
  - There is also a separate calendar API wrapper in [frontend/src/services/useCalendarService.ts](/home/cj/ide/Regrove/frontend/src/services/useCalendarService.ts:1)
  Neither is wired to mounted backend routes.

- The frontend still contains older page/service files that are not part of the active app route tree, including:
  - [frontend/src/pages/ChildCataloguePage.tsx](/home/cj/ide/Regrove/frontend/src/pages/ChildCataloguePage.tsx:1)
  - [frontend/src/pages/CreateChildProfilePage.tsx](/home/cj/ide/Regrove/frontend/src/pages/CreateChildProfilePage.tsx:1)
  - [frontend/src/pages/LoginPage.tsx](/home/cj/ide/Regrove/frontend/src/pages/LoginPage.tsx:1)
  - [frontend/src/services/childService.ts](/home/cj/ide/Regrove/frontend/src/services/childService.ts:1)
  The active SPA instead uses the lowercase page set (`pages/login.tsx`, `pages/register.tsx`, `pages/social-worker/*`, `pages/child/*`). The repo currently carries duplicate feature slices.

## Data Model and Contract Problems

- Frontend role values are `social_worker` and `child` in [frontend/src/types/index.ts](/home/cj/ide/Regrove/frontend/src/types/index.ts:1), but backend authorization expects `worker` and `admin` in [backend/middleware/authMiddleware.js](/home/cj/ide/Regrove/backend/middleware/authMiddleware.js:1). Even if auth succeeds, role-gated routes do not line up with the frontend’s role model.

- The active login page sends `username`, `email`, `password`, and `role` in [frontend/src/pages/login.tsx](/home/cj/ide/Regrove/frontend/src/pages/login.tsx:20), but the backend login controller in [backend/controllers/authController.js](/home/cj/ide/Regrove/backend/controllers/authController.js:1) only checks `email` and `password`.

- Cases and documentation are still partly local-state driven:
  - [frontend/src/contexts/CasesContext.tsx](/home/cj/ide/Regrove/frontend/src/contexts/CasesContext.tsx:1)
  - [frontend/src/contexts/DocumentationContext.tsx](/home/cj/ide/Regrove/frontend/src/contexts/DocumentationContext.tsx:1)
  This does not match the intended reviewed-and-persisted case-file workflow described in [agent.md](/home/cj/ide/Regrove/agent.md:1).

- Session creation is mock/in-memory in [backend/models/startSessionModel.js](/home/cj/ide/Regrove/backend/models/startSessionModel.js:1), so even the one mounted session start route is not persistent.

- The backend model/controller naming is now `child`, but the underlying SQL still uses `youth_profiles` in [backend/models/childModel.js](/home/cj/ide/Regrove/backend/models/childModel.js:1) and [backend/models/dashboardModel.js](/home/cj/ide/Regrove/backend/models/dashboardModel.js:1). This is not necessarily wrong by itself, but it is a schema/application naming mismatch that should be treated explicitly.

## Python / AI Pipeline Problems

- The Python service only transcribes. It does not summarize, classify into CANS, or log a case file. [api/main.py](/home/cj/ide/Regrove/api/main.py:1) stops after posting the markdown transcript to a nonexistent endpoint.

- The Node session-audio controller in [backend/controllers/sessionAudioController.js](/home/cj/ide/Regrove/backend/controllers/sessionAudioController.js:1) forwards audio to Python and immediately returns `"Transcription in progress"`, but there is no polling, callback completion, or storage mechanism tied into the worker review flow.

- The user story in [agent.md](/home/cj/ide/Regrove/agent.md:1) says the transcript should be reviewed and approved before being logged as a case file. No mounted API route currently implements that approval step.

## Documentation Drift

- [URL API endpoint called.txt](/home/cj/ide/Regrove/URL API endpoint called.txt:1) is materially out of date. Specific mismatches include:
  - It documents `POST /api/login`, but the mounted backend is `POST /api/auth/login`.
  - It documents `POST /api/register`, but there is no mounted register endpoint.
  - It documents `/sw/youth-catalogue`, but the active app route is `/sw/child-catalog`.
  - It documents `POST /api/session/start/:childId`, but the mounted backend is `POST /api/session/start` with body input.
  - It documents several `/api/events/*` endpoints, but no events routes are mounted.
  - It documents `GET /api/cans_case/:childId`, `DELETE /api/cans_case/:childId`, `POST /api/session/api-summarize`, `GET /api/session/summarize/:childId`, and `POST /api/session/logcase`, but none of those are mounted.
  - It documents `POST /api/sdq/:childId`, but no mounted SDQ route exists.

- [agent.md](/home/cj/ide/Regrove/agent.md:1) is directionally correct about the transcription/summarization gap, but it understates how broken the active route surface is. The repo does not just have “missing summarization”; it also has active frontend pages that call incorrect or nonexistent endpoints for auth, events, cases, and check-ins.

## Summary

The project currently has three overlapping states:

1. The intended workflow described in [agent.md](/home/cj/ide/Regrove/agent.md:1)
2. The older endpoint contract described in [URL API endpoint called.txt](/home/cj/ide/Regrove/URL API endpoint called.txt:1)
3. The actual mounted backend and active frontend code

Those three states do not line up.

The biggest blockers are:

- auth route mismatch
- missing register route
- unmounted events/chat/summary route trees
- broken session summarize/logcase flow
- missing transcript callback endpoint
- frontend pages calling nonexistent APIs
