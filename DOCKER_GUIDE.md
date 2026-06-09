# Docker Guide — regrove

## What is Docker?

Docker packages your application and everything it needs to run (runtime, libraries, config) into a single unit called a **container**. A container is isolated from your host machine, so it behaves the same whether it runs on your laptop or a server.

The key mental model:

| Term | Analogy | What it does |
|---|---|---|
| **Image** | A recipe | A read-only blueprint for a container |
| **Container** | A dish made from the recipe | A running instance of an image |
| **Dockerfile** | The instructions | Tells Docker how to build an image |
| **docker-compose.yml** | The full meal plan | Defines and wires multiple containers together |
| **Volume** | A USB drive | Persistent storage that survives container restarts |
| **Network** | An internal LAN | Lets containers talk to each other by service name |

---

## The Dockerfile (per service)

Each service (`backend/`, `api/`, `frontend/`) has its own `Dockerfile`. Here is the backend one explained line by line:

```dockerfile
FROM node:20-alpine          # Start from an official Node 20 image (Alpine = lightweight Linux)
WORKDIR /app                 # All commands below run inside /app inside the container
COPY package*.json ./        # Copy only package files first (Docker caches this layer)
RUN npm install --omit=dev   # Install production dependencies (cached unless package.json changes)
COPY . .                     # Copy the rest of the source code
EXPOSE 5000                  # Documents that this container listens on port 5000
CMD ["npm", "start"]         # The command that runs when the container starts
```

The Python `api/Dockerfile` works the same way, substituting pip for npm.

---

## The docker-compose.yml

`docker-compose.yml` is the single file that describes all four services and how they relate to each other.

### Services defined

```
frontend   → React app          (port 3000)
backend    → Express.js API     (port 5000)
api        → Python Flask       (port 8000)
db         → PostgreSQL 16      (port 5432, internal only to other containers)
```

### How a service is defined

```yaml
backend:
  build: ./backend          # Path to the folder containing the Dockerfile
  ports:
    - "5000:5000"           # host_port:container_port — maps your machine to the container
  depends_on:
    - db                    # Docker starts db before backend (does not guarantee db is ready)
  environment:
    - DB_HOST=db            # "db" here is the service name — Docker resolves it as a hostname
    - DB_NAME=${DB_NAME}    # Value pulled from your .env file at runtime
```

### Key concept — service name as hostname

Inside the Docker network, containers reach each other by **service name**, not `localhost`. That is why:
- `backend` sets `DB_HOST=db` (not `127.0.0.1`)
- `backend` sets `PYTHON_API_URL=http://api:8000` (not `http://localhost:8000`)

From your host machine you still use `localhost:5000`, `localhost:8000`, etc.

### The database volume

```yaml
db:
  volumes:
    - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Without a volume, all database data is lost every time the container stops. The named volume `postgres_data` lives on your host machine and is mounted into the container. Docker manages it — you do not need to know the exact path.

### The .env file

`docker-compose.yml` references variables like `${DB_NAME}`. Docker Compose automatically reads a `.env` file in the same directory. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

---

## Common Commands

| Command | What it does |
|---|---|
| `docker compose up --build` | Build images and start all containers |
| `docker compose up -d` | Start in detached mode (background) |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop containers and also delete volumes (wipes DB data) |
| `docker compose logs backend` | Tail logs for a specific service |
| `docker compose ps` | List running containers and their status |
| `docker compose exec backend sh` | Open a shell inside the backend container |

---

## How the services communicate (summary)

```
Your browser
    │  localhost:3000
    ▼
[ frontend container ]
    │  http://backend:5000   (internal Docker network)
    ▼
[ backend container ] ──── http://api:8000 (only when processing needed)
    │  host=db, port=5432
    ▼
[ db container ]
```

All four containers are on the same Docker-managed network automatically created by Compose. No extra network config is needed.
