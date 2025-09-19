# Backend Configuration

Environment variables consumed by the Nest backend:

- `JWT_SECRET` *(default `dev_secret_change_me`)* – signing secret for JWTs.
- `JWT_EXPIRES_IN` *(default `1h`)* – expiration passed to jsonwebtoken.
- `BCRYPT_SALT_ROUNDS` *(default `10`)* – hashing strength for `PasswordService`.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – MySQL connection details (defaults: `localhost`, `7777`, `root`, `password`, `adminlte`).
- `FILE_STORAGE_ROOT` *(default `<project-root>/uploads`)* – filesystem path where uploaded files are persisted.
- `FILE_PUBLIC_BASE_URL` *(optional)* – absolute base URL for stored files (e.g. `https://cdn.example.com`). If omitted, files are served locally from `/uploads/*`.

Additional defaults live in `shared/constants.ts` (`DEFAULT_USER_PASSWORD`, default permission sets). Override these via env variables or adjust constants as needed.
