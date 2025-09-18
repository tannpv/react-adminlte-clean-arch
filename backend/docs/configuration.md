# Backend Configuration

The dashboard backend relies on the following environment variables. Default values are provided for local development, but production deployments should supply their own secrets.

## Core Variables

- `JWT_SECRET` *(string, default: `dev_secret_change_me`)*: signing secret used by `TokenService` (see `SharedModule`). Override in production.
- `JWT_EXPIRES_IN` *(string or number, default: `1h`)*: JWT expiration passed to `jsonwebtoken`.
- `BCRYPT_SALT_ROUNDS` *(number, default: `10`)*: salt rounds used by `PasswordService` when hashing passwords.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` *(optional)*: MySQL connection details consumed by `MysqlDatabaseService` (defaults: `localhost`, `7777`, `root`, `password`, `adminlte`).

## Seeds & Defaults

- `DEFAULT_USER_PASSWORD` *(currently hardcoded as `secret` in `shared/constants.ts`)*: used when seeding users or resetting passwords. Update the constant or source it from env when needed.

## Usage

These variables are loaded via Nest's `ConfigModule`. Ensure `.env` contains overrides when running locally, and set them in your deployment environment.

