# Backend Module Boundaries

This reference tracks Nest modules, their responsibilities, and cross-module dependencies.

## AuthModule
- **Purpose**: Registration/login flows and JWT issuance.
- **HTTP controllers**: `AuthController` (`POST /auth/login`, `POST /auth/register`).
- **Providers**: `AuthService` (returns `AuthResponseDto`).
- **Depends on**: `PersistenceModule` (user repository), `SharedModule` (`PasswordService`, `TokenService`), `RolesModule` (uses `RolesService` to resolve default role).
- **Outbound calls**: Consumes `RolesService`; other modules should depend on `AuthService` instead of calling repositories directly.

## UsersModule
- **Purpose**: Manage user accounts and the `GET /me` profile endpoint.
- **HTTP controllers**: `UsersController` (`/users` CRUD), `MeController` (`/me`).
- **Providers**: `UsersService` (returns `UserResponseDto`).
- **Depends on**: `PersistenceModule` (user repository), `SharedModule` (`PasswordService`), `AccessControlModule` (guards/authorization), `RolesModule` (`RolesService` for role validation).
- **Outbound calls**: Publishes user domain events; any consumers should subscribe via `DomainEventBus`.

## RolesModule
- **Purpose**: Manage role definitions and permissions.
- **HTTP controllers**: `RolesController` (`/roles`).
- **Providers**: `RolesService` (returns `RoleResponseDto`).
- **Depends on**: `PersistenceModule` (role repository), `SharedModule`, `AccessControlModule`.
- **Outbound calls**: Provides `RolesService` for other modules (e.g., Auth/Users) and emits role domain events.

## ProductsModule
- **Purpose**: Manage catalog products (SKU, pricing, metadata).
- **HTTP controllers**: `ProductsController` (`/products`).
- **Providers**: `ProductsService` (returns `ProductResponseDto`).
- **Depends on**: `PersistenceModule` (product repository), `SharedModule` (DomainEventBus), `AccessControlModule` (permission guards).
- **Outbound calls**: Publishes product lifecycle events; consumers should subscribe via `DomainEventBus`.

## AccessControlModule
- **Purpose**: Authorization helpers/guards.
- **Providers**: `AuthorizationService`, `JwtAuthGuard`, `PermissionsGuard`.
- **Depends on**: `PersistenceModule` (user/role repositories), `SharedModule` (`TokenService`).

## SharedModule
- **Purpose**: Cross-cutting services (configurable password hashing, JWT signing, domain events).
- **Providers**: `PasswordService`, `TokenService`, `DomainEventBus` (configured via `BCRYPT_SALT_ROUNDS`, `JWT_SECRET`, `JWT_EXPIRES_IN`).
- **Depends on**: `ConfigModule`.

## PersistenceModule
- **Purpose**: Wire MySQL infrastructure to domain repository interfaces.
- **Providers**: `MysqlDatabaseService`, repository bindings (`USER_REPOSITORY`, `ROLE_REPOSITORY`, `PRODUCT_REPOSITORY`).
- **Depends on**: `SharedModule`.

## HealthModule
- **Purpose**: Liveness probe.
- **HTTP controllers**: `HealthController` (`/health`).
- **Providers**: none.

---

Feature modules should communicate via exported services or domain events; direct repository access is limited to the PersistenceModule.
