# Contributing to CrisisConnect Backend

## Branch ownership

Each person works in their own module and branch. Stay inside your folder — changes outside it need the relevant owner's approval (enforced by [`CODEOWNERS`](./.github/CODEOWNERS)).

| Branch | Folder | Owner |
| --- | --- | --- |
| `admin` | `src/admin/` | @steve-A7 |
| `ngo` | `src/ngo/` | @Rezwoan |
| `volunteer` | `src/volunteer/` | @nirzordas |
| `donor` | `src/donor/` | @nazmussakib0203 |

Anything outside those four folders — `app.module.ts`, `main.ts`, `package.json`, config files, etc. — falls back to @Rezwoan as owner.

## Workflow

1. Work on your own branch (`admin`, `ngo`, `volunteer`, or `donor`). Push there freely.
2. When ready, open a pull request into `dev`.
3. `dev` and `main` are protected: merging requires an approving review from the code owner of every folder your PR touches. A PR that only touches your own folder only needs your own owner's sign-off; only @Rezwoan can push directly to `dev` or `main`.
4. `dev` periodically gets PR'd into `main` once it's verified working.

Keep PRs scoped to your module. If a change genuinely needs to touch another person's folder (e.g. a shared DTO shape) or a root config file, say so in the PR description — it'll need that owner's (or @Rezwoan's) review regardless of whose branch it came from.

**Importing another role's entity is not "touching" their folder.** Cross-role
relationships (e.g. Donor incrementing NGO's `donation_call.raisedAmount`,
NGO reading Volunteer's `application` rows) are expected — the pattern is
always: `import` the other role's entity class, register it in **your own**
module's `TypeOrmModule.forFeature([...])`, and inject its repository into
**your own** service. You never open or edit a controller/service/entity
file outside your own folder. See each role's own `*_TASKS.md` for the
specific places this comes up.

**Merge conflicts are your responsibility, not the repo owner's.** Rebase
your branch on the latest `dev` before opening a PR:
```bash
git checkout <your-branch>
git pull origin dev
git push origin <your-branch>
```
If your PR shows conflicts, resolve them yourself — the repo owner will not
fix merge conflicts on your behalf.

**Build guides**: each role folder has its own `*_TASKS.md` (full
step-by-step build order for that role, from DTOs through the JWT guard) and
`*_API_TESTING.md` (every route's Postman setup and expected response, with
a ✅/⬜ status marker for what's actually built vs. still planned).

## Environment setup

```bash
npm install
cp .env.example .env   # fill in your own local Postgres credentials
npm run start:dev
```

`.env` is gitignored on purpose — never commit it, and never remove it from `.gitignore`. Everyone runs their own local PostgreSQL instance with their own password; only `.env.example` (with placeholder values) is committed.

## Before opening a PR

```bash
npm run build   # must compile with no errors
npm run lint     # must pass (auto-fixes most formatting issues)
npm test         # must pass if you added/changed logic covered by tests
```

Manually hit your new/changed endpoints (Postman, curl, etc.) against your local DB before opening the PR — passing the build/lint doesn't mean the feature actually works.

## Code style

Follow the conventions already established in `src/admin/` and `src/ngo/` — these are the reference implementations for the rest of the codebase:

- **DTOs** (`*.dto.ts`): camelCase field names, `@IsNotEmpty()` (or `@IsOptional()`) + a type decorator (`@IsString()`, `@IsEmail()`, etc.) on every field, in that order. Add a descriptive `message` wherever the built-in one is unhelpful — always on `@Matches()`, whose default leaks the raw regex at the client. On plain decorators like `@IsEmail()`/`@IsString()` the built-in message is already clear, so a custom one is optional; both styles are fine, just be consistent inside your own folder. Where a column is `varchar(N)`, mirror it with `@MaxLength(N)` so an over-long value returns `400` instead of blowing up as a `500` in Postgres.
- **Controllers** (`*.controller.ts`): thin — decorate routes, extract params, delegate to the service. Don't build response objects or business logic in the controller. Wrap 2+ `@Query`/`@Param` decorators across multiple lines (see `admin.controller.ts` / `ngo.controller.ts`).
- **Services** (`*.service.ts`): actually use every parameter you accept — don't take a filter param and ignore it. Return a consistent envelope: `{ message, data }`, or `{ message, count, data }` for list endpoints.
- No leftover `console.log`, commented-out dead code, or debug-only routes (e.g. a stray `/test` endpoint) in what you commit.
- No hardcoded secrets or credentials — use `ConfigService` / environment variables.

Run `npm run lint` before committing; it auto-fixes most formatting (quotes, trailing commas, indentation) to match Prettier's config in `.prettierrc`.

## Commits

Write commit messages that explain *why*, not just *what* — the diff already shows what changed. Keep unrelated changes (e.g. a formatting pass and a feature) in separate commits where practical.
