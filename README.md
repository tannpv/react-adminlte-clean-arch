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
- MySQL 8+ available on port 7777 (defaults can be overridden via env vars)

Quick Start
1. Start MySQL (default expects localhost:7777 with user `root` / password `password` and database `adminlte`).
   Example Docker command: docker run -p 7777:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=adminlte mysql:8
2. Install dependencies
   npm run install:all
   (or run npm --prefix admin install && npm --prefix backend install)
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
- dev:all: Delegates to admin/dev:all (NestJS + Vite together).
- dev:server: Runs backend/start:dev (NestJS watch mode).
- dev:client: Runs admin/dev:client (Vite only).
- server: Runs backend/start (compiled NestJS backend).
- build:client: Runs admin/build to produce admin/dist.
- build:server: Runs backend/build to produce backend/dist.
- preview: Runs admin/preview to serve the built frontend.
- install:all: Installs dependencies under admin/ and backend/.

Backend Scripts (backend/)
- npm run start:dev: ts-node-dev watcher for rapid backend iteration.
- npm run build: TypeScript compilation to dist/.
- npm run start: Runs the compiled backend (dist/main.js).

Environment
Frontend (admin/.env)
- VITE_API_BASE_URL=/api (default). In dev, requests go to /api and Vite proxies them to NestJS.

Backend (backend/.env or process env vars)
- PORT: Defaults to 3001. The server retries the next port if busy.
- JWT_SECRET: Secret key for signing JWTs (defaults to dev_secret_change_me; set a strong value in non-dev environments).
- DB_HOST: Defaults to localhost.
- DB_PORT: Defaults to 7777.
- DB_USER: Defaults to root.
- DB_PASSWORD: Defaults to password.
- DB_NAME: Defaults to adminlte (created automatically if missing).

API Endpoints (Base: /api)
Auth
- POST /auth/login — Body: { email, password } → 200 { token, user }
- POST /auth/register — Body: { name, email, password } → 201 { token, user }

Users (Bearer token required)
- GET /users?search=term → [ { id, name, email, roles } ] (supports search)
- GET /users/:id → { id, name, email, roles }
- POST /users — Body: { name, email, roles? } → 201 { id, name, email, roles }
- PUT /users/:id — Body: { name?, email?, roles? } → { id, name, email, roles }
- DELETE /users/:id → { id, name, email, roles }

Categories (Bearer token required)
- GET /categories?search=term → { categories: [...], tree: [...], hierarchy: [...] } (supports search)
- POST /categories — Body: { name, parentId? } → 201 { id, name, parentId, parentName }
- PUT /categories/:id — Body: { name?, parentId? } → { id, name, parentId, parentName }
- DELETE /categories/:id → { id, name, parentId, parentName }

Products (Bearer token required)
- GET /products?search=term → [ { id, name, description, price, categoryId, categoryName, ... } ] (supports search)
- GET /products/:id → { id, name, description, price, categoryId, categoryName, ... }
- POST /products — Body: { name, description, price, categoryId, ... } → 201 { ... }
- PUT /products/:id — Body: { name?, description?, price?, categoryId?, ... } → { ... }
- DELETE /products/:id → { ... }

Roles (Bearer token + permissions)
- GET /roles → [ { id, name, permissions } ]
- POST /roles — Body: { name, permissions? }
- PUT /roles/:id — Body: { name?, permissions? }
- DELETE /roles/:id

Profile
- GET /me → { user, roles: [ { id, name } ], permissions: [ ... ] }

Project Structure
admin/
  package.json      Frontend package definition, scripts, and deps
  vite.config.js    Vite config (includes proxy to http://localhost:3001)
  src/
    features/       Feature-based organization (auth, users, roles, categories, products, storage)
      auth/         Authentication components and logic
      users/        User management with search functionality
      roles/        Role and permission management
      categories/   Category management with hierarchical tree and search
      products/     Product catalog management
      storage/      File and directory management
    shared/         Shared components, hooks, and utilities
backend/
  package.json      NestJS project metadata + scripts
  tsconfig*.json    TypeScript build configs
  docs/             Backend-specific documentation
  src/
    app.module.ts   Root module wiring feature modules
    main.ts         Bootstrap with global validation envelope
    domain/         Entities + repository contracts
    application/    DTOs + use-case services (auth, users, roles, categories, products)
    infrastructure/ Controllers, guards, MySQL persistence adapters, modules
    shared/         Password hashing, JWT service, validation helpers, constants
docs/
  category-search-feature.md    Detailed category search documentation
  search-features-overview.md   Overview of all search functionality
scripts/
  smoke.mjs         Simple end-to-end smoke test harness for the API

How It Works
- Vite proxies /api/* requests to the NestJS backend while keeping relative URLs in the client.
- NestJS keeps a lightweight clean architecture boundary: controllers call application services which
  depend on repository interfaces; the MySQL persistence adapter fulfils those contracts via SQL queries and a shared database service.
- On startup the backend auto-migrates the schema (roles, users, role permissions, and user-role join table) and seeds default records when empty.
- Retro-compatible validation envelopes mirror the previous Express responses so the existing React UI
  consumes errors without change.
- JWTs are issued for one hour; client-side interceptors attach Authorization headers and clear
  credentials when a 401 response is detected.

Documentation
- [Backend Configuration](backend/docs/configuration.md) - Environment variables and configuration options
- [Module Boundaries](backend/docs/module-boundaries.md) - Backend module architecture and dependencies
- [Search Features Overview](docs/search-features-overview.md) - Overview of all search functionality
- [Category Search Feature](docs/category-search-feature.md) - Detailed documentation for the category search functionality
- [Postman Collection Guide](docs/postman-collection-guide.md) - Complete Postman API testing guide
- [Postman Automatic Auth Guide](docs/postman-automatic-auth-guide.md) - Automatic JWT token handling in Postman

Troubleshooting
- Missing backend deps: run npm --prefix backend install whenever packages change.
- Proxy ECONNREFUSED: ensure npm run dev:server (or dev:all) is running.
- Invalid token after JWT_SECRET change: clear localStorage or re-login.
- Port already in use: the backend auto-increments until it finds an open port (logs show active port).
- Database connection refused: confirm MySQL is reachable at the configured host/port (default localhost:7777) and credentials match DB_USER / DB_PASSWORD.

Production Notes
- Build frontend: npm run build:client (outputs admin/dist/).
- Build backend: npm run build:server (outputs backend/dist/).
- Serve admin/dist/ behind a reverse proxy that forwards /api to the backend, or set VITE_API_BASE_URL to a
  fully-qualified API URL and enable CORS.
- Supply a strong JWT_SECRET and run behind HTTPS outside of local development.
