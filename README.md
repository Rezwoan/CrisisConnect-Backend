# CrisisConnect Backend

A [NestJS](https://nestjs.com/) + [TypeORM](https://typeorm.io/) API for coordinating crisis relief between four roles: **Admin**, **NGO**, **Volunteer**, and **Donor**. Each role has its own module under `src/`.

## Tech stack

- [NestJS](https://nestjs.com/) 11 (Express platform)
- [TypeORM](https://typeorm.io/) + PostgreSQL
- [class-validator](https://github.com/typestack/class-validator) for DTO validation
- [@nestjs/config](https://docs.nestjs.com/techniques/configuration) for environment-based configuration

## Project structure

```
src/
  common/      Shared, repo-owner-only — user & otp entities, common.enums.ts,
               config/multer.config.ts (shared upload config)
  admin/       Admin module      — users, crises, announcements
  ngo/         NGO module        — crisis participation, volunteer/donation calls, assignments
  volunteer/   Volunteer module  — registration, skills, applications, work log
  donor/       Donor module      — crisis following, donations, payments, receipts
  app.module.ts, main.ts         — app bootstrap, DB connection, static file serving
```

Each role folder owns its own `*.controller.ts`, `*.service.ts`, `dto/`,
`entities/`, `*.enums.ts`, and `*.module.ts`. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for who owns which folder and how PRs
are reviewed, and see each folder's own `*_TASKS.md` (full build guide) and
`*_API_TESTING.md` (Postman reference) for the details of that role.

## Database schema

The full entity/relationship design (16 roles + 4 join tables — `user`,
`otp`, one entity set per role, plus `crisis_participation`,
`announcement_recipient`, `volunteer_skill`, `crisis_follow`) lives in
`CrisisConnect_Midterm_PRD.md` (Part 3). All entities are already written;
each role's own routes/services are built out per that role's `*_TASKS.md`.

## Profile images

Every role has a `profileImage` column and a
`POST /<role>/profile/image` upload endpoint (multipart, field name
`image`, jpeg/png/webp only, 2MB max). Uploaded files are saved to their own
`uploads/<role>/` folder and served back at `/uploads/<role>/<filename>`.
Only NGO's route is implemented so far — see each role's `*_TASKS.md`
"Task 0" for the exact steps to add your own.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your local database

This project does **not** hardcode database credentials — each person runs their own local PostgreSQL instance. Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

```
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your local postgres password>
DB_NAME=users
```

`.env` is gitignored — it will never show up in `git status` or a PR diff, so everyone can use different local credentials without merge conflicts.

Make sure PostgreSQL is running locally and the database named in `DB_NAME` exists:

```sql
CREATE DATABASE users;
```

Tables are created automatically on startup (`synchronize: true` in `app.module.ts`) — no manual migrations needed for local dev.

### 3. Run the app

```bash
# development, single run
npm run start

# development, restarts on file change
npm run start:dev

# production
npm run build
npm run start:prod
```

The API listens on `http://localhost:3000` (or whatever `PORT` you set).

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Run with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Lint and auto-fix `src/**/*.ts` |
| `npm run format` | Format `src/**/*.ts` with Prettier |
| `npm test` | Run unit tests (`*.spec.ts`) |
| `npm run test:e2e` | Run end-to-end tests |

## API overview

Each role currently exposes a base health-check route, e.g. `GET /admin` →
`"Admin module is working"` (same shape for `/ngo`, `/volunteer`, `/donor`).
NGO additionally has a working `POST /ngo/profile/image`. Every other route
in the PRD (auth, CRUD, relationships) is still to be built — see each
role's own `*_TASKS.md` for the full build order and `*_API_TESTING.md` for
the complete target route list with exact Postman setup and expected
output:

- [`src/admin/ADMIN_TASKS.md`](./src/admin/ADMIN_TASKS.md) /
  [`ADMIN_API_TESTING.md`](./src/admin/ADMIN_API_TESTING.md)
- [`src/ngo/NGO_TASKS.md`](./src/ngo/NGO_TASKS.md) /
  [`NGO_API_TESTING.md`](./src/ngo/NGO_API_TESTING.md)
- [`src/volunteer/VOLUNTEER_TASKS.md`](./src/volunteer/VOLUNTEER_TASKS.md) /
  [`VOLUNTEER_API_TESTING.md`](./src/volunteer/VOLUNTEER_API_TESTING.md)
- [`src/donor/DONOR_TASKS.md`](./src/donor/DONOR_TASKS.md) /
  [`DONOR_API_TESTING.md`](./src/donor/DONOR_API_TESTING.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branching model, folder ownership, and PR review requirements before opening a pull request.
