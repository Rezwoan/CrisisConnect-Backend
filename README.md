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
  admin/       Admin module      — user & organization management, admin registration
  ngo/         NGO module        — crisis/task/volunteer listings, NGO registration
  volunteer/   Volunteer module  — registration, profile, task applications, badges
  donor/       Donor module      — crisis/donation listings, donor registration, uploads
  app.module.ts, main.ts         — app bootstrap and DB connection
```

Each module owns its own `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.entity.ts`, and `*.module.ts`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for who owns which module and how PRs are reviewed.

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

### Admin (`/admin`)
- `GET /admin/users?role&isActive` — list users, optionally filtered
- `GET /admin/users/:id`
- `GET /admin/organizations?status`
- `GET /admin/organizations/:id`
- `POST /admin/insertadmin` — multipart, includes ID photo upload
- `GET /admin/uploadedimage/:fileName`

### NGO (`/ngo`)
- `GET /ngo/crises?status&city`
- `GET /ngo/crises/:id`
- `GET /ngo/crises/:id/tasks?status`
- `GET /ngo/volunteers?crisisId`
- `POST /ngo/insertngo`

### Volunteer (`/volunteer`)
- `POST /volunteer/register`
- `GET /volunteer/profile`
- `POST /volunteer/apply/:taskId`
- `GET /volunteer/assignments`
- `GET /volunteer/badges`
- `GET /volunteer/search?city&skill`

### Donor (`/donor`)
- `GET /donor/crises?type&city`
- `GET /donor/crises/:id`
- `GET /donor/donations?status`
- `GET /donor/donations/:id`
- `POST /donor/insertdonor`
- `POST /donor/upload`

All list endpoints currently return in-memory dummy data pending full entity/repository wiring.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branching model, folder ownership, and PR review requirements before opening a pull request.
