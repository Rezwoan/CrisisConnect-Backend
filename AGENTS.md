# Agent Instructions — CrisisConnect Backend

NestJS + TypeORM + PostgreSQL backend for CrisisConnect, a 4-person university
team project. Each teammate owns one role/branch: `admin`, `ngo`, `volunteer`,
`donor`. This checkout is the `ngo` role's work (repo owner: Rezwoan).

## Setup

1. `npm install`
2. Create Postgres database named in `.env`'s `DB_NAME` (default `CrisisConnect`).
3. Load the schema: `psql -U <user> -d <db> -f schema.sql` — `schema.sql` in this
   folder is a full `pg_dump --schema-only` of the working database (21 tables,
   all enums, all foreign keys). Load it before first `npm run start:dev` rather
   than relying on TypeORM's `synchronize` to build it from the entities.
4. Copy `.env.example` if present, or create `.env` with: `PORT`, `DB_HOST`,
   `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `MAIL_USER`, `MAIL_PASS`
   (Gmail app-password for `@nestjs-modules/mailer`), `JWT_SECRET`.
5. **Always start the app from this folder** — `ConfigModule` resolves `.env`
   relative to the process's cwd, so launching from elsewhere silently loses
   the DB credentials and fails with "Unable to connect to the database".
6. `npm run start:dev`

## Project rules (binding, not suggestions)

- **Own-folder-only.** Each role edits only its own `src/<role>/` folder.
  Reading another role's entity via `forFeature` in your own module is fine
  (see `src/ngo/ngo.module.ts` registering Admin's `Crisis` and Volunteer's
  `Application`); editing another role's files is not.
- **Simple, lecture-shaped code.** This is a midterm project graded on being
  explainable out loud. No transactions, no interceptors, no custom exception
  filters, no repository wrappers, no generics, no clever abstractions — none
  of that was taught and none of it is needed. If a change makes the code
  harder to explain to a teacher, it's the wrong change. When something
  genuinely isn't in the taught material (JWT sign/verify, for example), pick
  the smallest thing that satisfies the requirement and say so plainly rather
  than pretending it came from a lecture.
- **PRs target `dev`, never `main`.**
- **Commit messages are one line, no trailer.** Plain `git commit -m "..."` —
  no `Co-Authored-By`, no AI-session link, no multi-paragraph body.
- Don't scaffold future phases early — see `src/ngo/NGO_TASKS.md`'s phase
  order and build one phase at a time.

## Key docs in this repo

- `src/ngo/NGO_TASKS.md` — phased build guide for the NGO role.
- `src/ngo/NGO_API_TESTING.md` — every NGO route with expected request/response JSON.
- `CONTRIBUTING.md` — team-wide conventions (branches, DTO style).
- `CODINGSTYLE.md`, `memory.md` — local working notes from prior AI-assisted
  sessions (gitignored, not pushed — background only, no authority over the
  actual lecture material).

## Known TypeORM gotchas (this project's installed version)

- `Repository.update()` does **not** support nested relation conditions like
  `{ user: { id } }` — throws "Cannot find alias for relation at user". Use
  `createQueryBuilder().update(Entity).set({...}).where('userId = :userId', {...})`
  instead, or restructure as find + mutate + save.
- `relations: ['crises']` (array form) does not compile — use the object form
  `relations: { crises: true }`.
- Decimal/bigint columns come back from `pg` as strings, not numbers — type
  them `string` on the entity.

## Verification

A successful `nest build` is not enough — verify schema/entity changes against
a **live** Postgres instance (`npm run start:dev`, then inspect the actual
tables), since TypeORM can silently disagree with a real database in ways
`tsc`/`nest build` never catch.
