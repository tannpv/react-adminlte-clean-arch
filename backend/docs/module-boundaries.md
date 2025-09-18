# Backend Module Boundaries

This document captures the current public surface and dependencies of each NestJS module so we can keep feature boundaries clear while we prepare for a future microservice split.

## AuthModule
- **Purpose**: Handle registration and login flows and issue JWTs.
- **HTTP controllers**: `AuthController` (`POST /auth/login`, `POST /auth/register`).
- **Providers**: `AuthService` (exported, returns `AuthResponseDto` containing token + `UserResponseDto`).
- **Depends on**: `PersistenceModule` (user repository), `SharedModule` (`PasswordService`, `TokenService`), `RolesModule` (to resolve default role via `RolesService`).
- **Outbound calls**: Uses `RolesService` to query role metadata instead of injecting repositories directly. Other modules should depend on `AuthService` instead of reusing controllers or repositories.

## UsersModule
- **Purpose**: Manage user accounts and expose the current-user profile endpoint.
- **HTTP controllers**: `UsersController` (CRUD under `/users`), `MeController` (`GET /me`).
- **Providers**: `UsersService` (exported; public methods return `UserResponseDto`), query helpers for profile endpoints.
- **Depends on**: `PersistenceModule` (user repository), `SharedModule` (`PasswordService`), `AccessControlModule` (guards + `AuthorizationService`), `RolesModule` (consumes `RolesService` for role lookups).
- **Outbound calls**: Talks to `RolesService` for role validation and publishes domain events via `DomainEventBus`. Other modules must go through `UsersService` for user data.

## RolesModule
- **Purpose**: Manage role definitions and their permissions.
- **HTTP controllers**: `RolesController` (CRUD under `/roles`).
- **Providers**: `RolesService` (exported; HTTP-facing methods return `RoleResponseDto`).
- **Depends on**: `PersistenceModule` (role repository), `SharedModule`, `AccessControlModule` (authorization guards).
- **Outbound calls**: Exposes `RolesService` for other modules (e.g., `UsersModule`) and otherwise stays within repository interfaces.

## HealthModule
- **Purpose**: Liveness probe endpoint.
- **HTTP controllers**: `HealthController` (`GET /health`).
- **Providers**: none.
- **Depends on**: none.
- **Outbound calls**: none; standalone.

## AccessControlModule
- **Purpose**: Provide authorization helpers usable across feature modules.
- **Providers**: `AuthorizationService` (with an in-memory permission cache), `JwtAuthGuard`, `PermissionsGuard`, `AuthorizationEventsSubscriber` (subscribes to domain events to invalidate cache).
- **Depends on**: `PersistenceModule` (user/role repositories), `SharedModule` (`TokenService`, `DomainEventBus`).
- **Usage guidance**: Feature modules import this module to guard controllers and to query aggregated permissions through `AuthorizationService` instead of hitting repositories directly. Event subscriptions ensure cached permissions stay consistent after user/role changes.

## SharedModule
- **Purpose**: Cross-cutting stateless services (password hashing, JWT signing, in-process domain events).
- **Providers**: `PasswordService` (configured via `BCRYPT_SALT_ROUNDS`), `TokenService` (uses `JWT_SECRET`/`JWT_EXPIRES_IN`), `DomainEventBus` (exported for injection).
- **Depends on**: `ConfigModule` for shared configuration.
- **Usage guidance**: Only global helpers should live here; do not place feature logic in shared. Use `DomainEventBus` for cross-module notifications instead of direct service calls where possible.

## PersistenceModule
- **Purpose**: Wire database adapters to domain repository interfaces.
- **Providers**: `MysqlDatabaseService`, `{ provide: USER_REPOSITORY, useClass: MysqlUserRepository }`, `{ provide: ROLE_REPOSITORY, useClass: MysqlRoleRepository }` (exports repository tokens).
- **Depends on**: `SharedModule` (for password utilities in repositories if needed).
- **Usage guidance**: Feature modules consume repositories via the exported tokens; new persistence implementations belong here.

## Cross-Module Interaction Rules
- Feature modules (`AuthModule`, `UsersModule`, `RolesModule`) interact only through exported services (`AuthService`, `UsersService`, `RolesService`) or the authorization helpers provided by `AccessControlModule`.
- Publish domain events (`DomainEventBus`) for cross-module side effects; subscribers must live in their own module to avoid tight coupling.
- Controllers remain the only entry points for HTTP traffic; internal services should not be invoked from outside their module except through documented exports.
- Repository tokens (`USER_REPOSITORY`, `ROLE_REPOSITORY`) are resolved by `PersistenceModule`. Do not inject concrete repositories directly in feature code.
- Shared utilities stay stateless to keep them portable when modules are split into separate services later.

Revisit this document whenever a module adds a new export or external dependency so the boundaries stay accurate.
