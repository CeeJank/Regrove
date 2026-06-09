# regrove

## Stack
| Layer | Technology | Port |
|---|---|---|
| Frontend | React + TypeScript (Vite) | 5173 |
| Backend | Express.js (Node 20) | 5000 |
| Python sidecar | Flask | 8000 |
| Database | PostgreSQL 16 | 5432 |

## Auth
JWT (jsonwebtoken) + bcryptjs. Middleware lives in `backend/middleware/auth.js`. Attach to any route that requires authentication.

## Architecture
```
Frontend (React)
    │
    ▼
Backend (Express) ──── PostgreSQL (pg pool)
    │
    └──► Python API (Flask)   ← called only when data processing is needed
```
Express owns the DB connection. The Python sidecar is called via HTTP using `PYTHON_API_URL` (set in docker-compose). It does not connect to the database directly.

## Pattern
MVC. Express owns controllers, models (raw pg queries), and routes. Views are handled by React.

## Environment
Copy `.env.example` to `.env` and fill in values before running locally or with Docker.

## Running locally (without Docker)
```bash
cd backend && npm install && npm run dev
```

## Running with Docker
```bash
docker compose up --build
```

## Folder Structure
```
regrove/
├── frontend/               # React + TypeScript (Vite) — team-owned
│   ├── src/                # React source files
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .dockerignore
│   └── Dockerfile
├── backend/                # Express.js
│   ├── config/db.js        # pg pool connection
│   ├── controllers/        # business logic
│   ├── models/             # raw pg queries
│   ├── routes/index.js     # route definitions
│   ├── middleware/auth.js  # JWT guard
│   ├── server.js           # entry point
│   ├── Dockerfile
│   └── package.json
├── api/                    # Python Flask sidecar
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── CLAUDE.md
```
