React AdminLTE Clean Architecture Starter
=========================================

Overview
- React 18 + Vite frontend styled with AdminLTE 3 (Bootstrap 4 + Font Awesome)
- Clean architecture layering across presentation, application, domain, and infrastructure
- NestJS 10 backend with JWT authentication and file-based persistence (db.json)
- Seamless local dev workflow with Vite proxying API requests to NestJS

Architecture
Frontend
- Presentation: React pages/components (layouts, login/register, users, roles)
- Infra: Axios HTTP client with auth interceptors and React Query hooks
- Data/Application: Query hooks and state helpers coordinating UI and API calls
- Domain: UI-facing models and validation helpers (simple because persistence lives server-side)

Backend
- Domain: Entities (User, Role) and repository contracts
- Application: Use-case services for authentication, users, roles, and authorization rules
- Infrastructure: File persistence adapters, HTTP controllers/guards, Nest modules
- Shared: Cross-cutting services (password hashing, JWT handling, validation envelope)

Prerequisites
- Node.js 18 or newer (tested with Node 24)
- npm 8 or newer

Quick Start
1. Install frontend dependencies
   npm install
2. Install backend dependencies (one-time)
   npm --prefix server install
3. Run frontend + API together
   npm run dev:all

   - Frontend: http://localhost:5174
   - API (proxied): http://localhost:5174/api
   - API (direct): http://localhost:3001

Default Login
- Email: leanne@example.com
- Password: secret

You can also register a new account; registration returns a JWT and logs you in automatically.

Available Scripts (root)
- dev:all: Runs NestJS (ts-node-dev) and Vite concurrently for local development.
- dev:server: Starts the NestJS backend in watch mode (http://localhost:3001 by default).
- dev:client: Runs the Vite dev server only.
- server: Runs the compiled NestJS backend (requires npm run build:server first).
- build: Builds the frontend for production.
- preview: Serves the production frontend bundle locally.
- build:server: Compiles the NestJS backend to server/dist.

Backend Scripts (server/)
- npm run start:dev: ts-node-dev watcher for rapid backend iteration.
- npm run build: TypeScript compilation to dist/.
- npm run start: Runs the compiled backend (dist/main.js).

Environment
Frontend (.env)
- VITE_API_BASE_URL=/api (default). In dev, requests go to /api and Vite proxies them to NestJS.

Backend (env vars)
- PORT: Defaults to 3001. The server retries the next port if busy.
- JWT_SECRET: Secret key for signing JWTs (defaults to dev_secret_change_me; set a strong value in non-dev environments).

API Endpoints (Base: /api)
Auth
- POST /auth/login — Body: { email, password } → 200 { token, user }
- POST /auth/register — Body: { name, email, password } → 201 { token, user }

Users (Bearer token required)
- GET /users → [ { id, name, email, roles } ]
- GET /users/:id → { id, name, email, roles }
- POST /users — Body: { name, email, roles? } → 201 { id, name, email, roles }
- PUT /users/:id — Body: { name?, email?, roles? } → { id, name, email, roles }
- DELETE /users/:id → { id, name, email, roles }

Roles (Bearer token + permissions)
- GET /roles → [ { id, name, permissions } ]
- POST /roles — Body: { name, permissions? }
- PUT /roles/:id — Body: { name?, permissions? }
- DELETE /roles/:id

Profile
- GET /me → { user, roles: [ { id, name } ], permissions: [ ... ] }

Project Structure
server/
  package.json      NestJS project metadata + scripts
  tsconfig*.json    TypeScript build configs
  db.json           JSON persistence (auto-seeded; passwords hashed if missing)
  src/
    app.module.ts   Root module wiring feature modules
    main.ts         Bootstrap with global validation envelope
    domain/         Entities + repository contracts
    application/    DTOs + use-case services (auth, users, roles, authorization)
    infrastructure/ Controllers, guards, persistence adapters, modules
    shared/         Password hashing, JWT service, validation helpers, constants
src/
  presentation/     React UI components/pages
  infra/http/       Axios ApiClient + React Query hooks
  ...               Additional frontend clean architecture layers
vite.config.js      Proxies /api → http://localhost:3001 during dev

How It Works
- Vite proxies /api/* requests to the NestJS backend while keeping relative URLs in the client.
- NestJS keeps a lightweight clean architecture boundary: controllers call application services which
  depend on repository interfaces; the file persistence adapter satisfies those interfaces via db.json.
- Retro-compatible validation envelopes mirror the previous Express responses so the existing React UI
  consumes errors without change.
- JWTs are issued for one hour; client-side interceptors attach Authorization headers and clear
  credentials when a 401 response is detected.

Troubleshooting
- Missing backend deps: run npm --prefix server install whenever packages change.
- Proxy ECONNREFUSED: ensure npm run dev:server (or dev:all) is running.
- Invalid token after JWT_SECRET change: clear localStorage or re-login.
- Port already in use: the backend auto-increments until it finds an open port (logs show active port).

Production Notes
- Build frontend: npm run build (outputs dist/).
- Build backend: npm run build:server (outputs server/dist/).
- Serve dist/ behind a reverse proxy that forwards /api to the backend, or set VITE_API_BASE_URL to a
  fully-qualified API URL and enable CORS.
- Supply a strong JWT_SECRET and run behind HTTPS outside of local development.
