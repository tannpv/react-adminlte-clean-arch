React AdminLTE Clean Architecture Starter
================================================

Overview
This project is a minimal, production‑ready starter that combines:
- React 18 + Vite for the frontend
- AdminLTE 3 (Bootstrap 4 + Font Awesome) for UI
- Clean Architecture layering (domain, data, infra, presentation, composition)
- A local Node/Express API with JSON storage, JWT authentication, and full Users CRUD

Architecture
- Presentation: React pages/components (AdminLTE layout, Users, Login, Register)
- Domain: Entities and Use Cases (Get/Create/Update/Delete User, Login, Register)
- Data: Repositories and HTTP Data Sources (Axios)
- Infra: Axios client with auth interceptors
- Server: Express API, JSON persistence, JWT auth, Vite proxy for local dev

Prerequisites
- Node.js 18 or newer (tested with Node 24)
- npm 8 or newer

Quick Start
1) Install dependencies
   npm install

2) Run frontend + API together (recommended)
   npm run dev:all

   - Frontend: http://localhost:5174
   - API (proxied): http://localhost:5174/api
   - API (direct): http://localhost:3001

Default Login
- Email: Sincere@april.biz
- Password: secret

Alternatively, open the Register page to create a new account. After registration, you are logged in automatically.

Available Scripts
- dev:all: Runs API (nodemon) and Vite concurrently for local development.
- dev:server: Runs the Express API with file‑watch reloads (http://localhost:3001).
- dev:client (dev): Runs the Vite dev server (http://localhost:5174).
- build: Builds the frontend for production.
- preview: Serves the production build for local preview.
- server: Starts the API once (no file‑watch reloads).

Environment Configuration
Frontend (.env)
- VITE_API_BASE_URL=/api (default). In dev, requests go to /api and are proxied to the API.

Server (env vars)
- PORT: Defaults to 3001. The server will retry on the next port if in use.
- JWT_SECRET: Secret key for signing JWTs (set a strong value in non‑dev environments).

API Endpoints (Base: /api)
Auth
- POST /auth/login — Body: { email, password } → 200 { token, user }
- POST /auth/register — Body: { name, email, password } → 201 { token, user }

Users (Requires Authorization: Bearer <token>)
- GET /users → [ { id, name, email } ]
- GET /users/:id → { id, name, email }
- POST /users — Body: { name, email } → 201 { id, name, email }
- PUT /users/:id — Body: { name?, email? } → { id, name, email }
- DELETE /users/:id → { id, name, email }

Project Structure
server/
  index.js          Express API + JWT auth
  db.json           JSON persistence (auto‑seeded; passwords hashed on first run)
src/
  composition/      Dependency wiring (Use Cases, Repositories)
  data/             Repositories + HTTP data sources
  domain/           Entities + Use Cases
  infra/http/       Axios ApiClient with auth interceptors
  presentation/     Pages (Login, Register, Users) and UI components
vite.config.js      Vite proxy: /api → http://localhost:3001
.env                Default: VITE_API_BASE_URL=/api
index.html          Vite entry
package.json        Scripts and dependencies

How It Works
- The frontend uses Axios with a base URL of /api in development.
- Vite proxies /api/* requests to the local Express server (http://localhost:3001).
- On login or registration, the client stores the JWT and user in localStorage and attaches Authorization headers for subsequent requests.
- Receiving a 401 response clears stored credentials and returns the app to the login screen.

Troubleshooting
- Proxy error (ECONNREFUSED) from /api/*: Start the API (npm run dev:server) or use npm run dev:all.
- After changing .env or vite.config.js: Restart the Vite dev server so the proxy picks up changes.
- Can’t login: Use the default credentials above, or register a new account. Verify the token appears in Application Storage (localStorage).
- Port already in use: The API will attempt the next port automatically. Watch the server log for the active port.

Production Notes
- Build the frontend: npm run build (outputs dist/).
- Serve dist/ behind a reverse proxy that forwards /api to your API server; or set VITE_API_BASE_URL to your full API URL at build time and enable CORS on the API.
- Set a strong JWT_SECRET and use HTTPS in non‑dev environments.
