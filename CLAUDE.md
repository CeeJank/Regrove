# Regrove

Social worker–youth case management platform. Social workers log in to view cases, run AI-transcribed audio sessions, and get CANS-format summaries. Youth can check in, message their worker, and use an AI chatbot after hours.

## Stack
| Layer | Technology | Port |
|---|---|---|
| Frontend | React 19 + TypeScript (Vite) | 5173 |
| Backend | Express.js (Node 20) | 5000 |
| Python sidecar | Flask + faster-whisper | 8000 |
| Database | PostgreSQL 16 | 5432 |

## Auth
JWT (jsonwebtoken) + bcryptjs. Middleware: `backend/middleware/auth.js`.
**WARNING:** Auth middleware currently falls back to a mock user (`{workerId: 1}`) on any failure, including missing/invalid tokens. This bypasses all real auth. Fix before any real deployment.

## Architecture
```
Frontend (React)
    │
    ▼
Backend (Express) ──── PostgreSQL (pg pool)
    │
    └──► Python API (Flask)   ← called only when audio transcription is needed
```
Express owns the DB connection. Python sidecar called via `PYTHON_API_URL` (docker-compose). Does not touch DB directly.

After transcription, Python POSTs the markdown transcript back to Express at `EXPRESS_API_URL` (must be set in api service env — currently missing from docker-compose).

## Business Logic
- **Working hours:** 9:00–18:00 Singapore time (Asia/Singapore), weekdays only (weekend logic not yet implemented).
- **After hours:** Chat mode switches to AI; youth-facing chatbot becomes available.
- **CANS framework:** AI summary of session transcript should be structured per CANS assessment categories. AI summary service is a placeholder — not yet implemented.
- **Session flow:** SW starts session → audio recorded → uploaded to Express → forwarded to Python → Whisper transcribes → transcript returned to Express → AI generates CANS summary → SW reviews, edits, saves to DB.

## Pattern
MVC. Express owns controllers, models (raw pg queries), routes. Views are React.

## Environment
Copy `.env.example` to `.env`. Required vars: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.
The `api` service also needs `EXPRESS_API_URL=http://backend:5000` added to docker-compose.yml.

## Running
```bash
# With Docker (recommended)
docker compose up --build

# Backend only
cd backend && npm install && npm run dev

# Frontend only
cd frontend && npm install && npm run dev
```

## Folder Structure
```
regrove/
├── frontend/src/
│   ├── pages/
│   │   ├── main.tsx              # Landing page
│   │   ├── login.tsx             # Auth (mock only — no API call yet)
│   │   ├── register.tsx          # Auth (mock only — no API call yet)
│   │   ├── social-worker/        # SW-role pages
│   │   │   ├── home.tsx          # Dashboard overview
│   │   │   ├── dashboard.tsx     # Full case table
│   │   │   ├── activeCases.tsx   # Case detail + notes
│   │   │   ├── messages.tsx      # Messaging (mock)
│   │   │   ├── calendar.tsx      # Events (mock)
│   │   │   └── referrals.tsx     # Referrals (mock)
│   │   └── child/
│   │       ├── home.tsx          # Child dashboard
│   │       ├── checkIns.tsx      # Mood check-in (no API)
│   │       ├── messages.tsx      # Messaging (mock)
│   │       ├── calendar.tsx      # Calendar (mock)
│   │       └── chatbot.tsx       # After-hours AI chatbot (broken — see issues)
│   ├── contexts/                 # All in-memory, no persistence yet
│   │   ├── AuthContext.tsx       # User state (lost on refresh)
│   │   ├── CasesContext.tsx      # Cases (mock data)
│   │   ├── MessagesContext.tsx   # Messages (mock data)
│   │   ├── EventsContext.tsx     # Calendar events (mock data)
│   │   └── ReferralsContext.tsx  # Referrals (empty)
│   ├── components/
│   │   ├── layout/               # SocialWorkerLayout, ChildLayout (sidebars)
│   │   └── child-profile/        # ChildSummaryCard, RiskOverviewCard, AnalyticsPanel, RecentSessionList
│   ├── services/                 # API call helpers (all hardcode localhost)
│   └── types/index.ts            # Shared TypeScript types
├── backend/
│   ├── config/db.js              # pg Pool
│   ├── routes/index.js           # Route aggregator
│   ├── middleware/auth.js        # JWT guard (has mock fallback — see WARNING above)
│   ├── controllers/              # Business logic
│   ├── models/                   # DB queries (most are mock arrays, not real pg queries)
│   └── services/
│       ├── aiChatService.js      # Placeholder — returns static text
│       ├── aiSummaryService.js   # Placeholder — returns static text
│       ├── chatModeService.js    # Determines AI vs human mode
│       └── timeService.js        # isAfterWorkingHours() — Singapore TZ
├── api/
│   └── main.py                   # Flask + faster-whisper transcription
└── docker-compose.yml
```

## Known Issues (priority order)

### P0 — Breaks core functionality
1. **Auth bypass** (`backend/middleware/auth.js:8-11`) — mock-token and catch-all fallback lets anyone in as workerId=1.
2. **Import path typo** (`childProfileController.js`, `dashboardController.js`) — imports from `../model/` (missing 's'), crashes those routes.
3. **Python → Express callback broken** (`api/main.py:79`) — posts to `/new-endpoint` which doesn't exist; also `EXPRESS_API_URL` not set in docker-compose so defaults to localhost inside container.
4. **Chatbot API call** (`pages/child/chatbot.tsx`) — calls Anthropic API directly from browser with no API key; will always fail. Should go through backend.
5. **Login/Register** (`pages/login.tsx`, `pages/register.tsx`) — no backend API calls; auth state lost on page refresh; no JWT token stored.

### P1 — Features don't persist
6. All five frontend contexts (Cases, Messages, Events, Referrals, Auth) are in-memory only. Data is lost on refresh. Needs API integration.
7. All backend models (`childProfileModel.js`, `dashboardModel.js`, `startSessionModel.js`) use hardcoded mock arrays instead of pg queries.
8. AI chat and summary services (`aiChatService.js`, `aiSummaryService.js`) return static placeholder text — no LLM called.

### P2 — Missing features
9. No database schema/migrations anywhere in the repo. Tables are assumed to exist.
10. No WebSocket/polling for real-time messaging.
11. No async/await in `childProfileController.js` and `dashboardController.js` — sync calls to async model functions.
12. Routes for `/children/:childId` and `/children/:childId/session/:sessionId` exist in old components but not in the React Router config.
13. `frontend/src/main.tsx` injects a mock auth token into localStorage on every load — remove before production.
14. CANS summary format not implemented; AI summary service needs a structured prompt for CANS output categories.
15. Weekend/holiday logic missing from `timeService.js`.

### P3 — Polish
16. No input validation on backend controllers.
17. No rate limiting.
18. No error boundaries in frontend.
19. Hard-coded worker/child names scattered across pages (e.g. "Sarah Chen" in messages).
20. `REACT_APP_API_URL` in docker-compose is set to localhost — won't resolve inside the container network (should use `http://backend:5000`).
