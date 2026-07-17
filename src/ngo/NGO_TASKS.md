# NGO — Build Guide (Member B, Repo Owner)

Branch: `ngo` · Folder: `src/ngo/**` · Owner: @Rezwoan

This is your complete, step-by-step path to finishing the NGO role for the
CrisisConnect midterm. Work through it top to bottom — later steps depend on
earlier ones.

## Ground rules — read this first

- **You only commit inside `src/ngo/**`.** Every file you create or edit for
  this role lives there (plus the two exceptions below).
- **You will `import` from `src/common/`, `src/admin/entities/`,
  `src/volunteer/entities/`, and `src/donor/entities/` constantly** — that is
  expected and fine. Importing a class is not "touching" it.
- **You will never *edit* a file outside `src/ngo/**`.** If a task below
  needs data that lives in another role's table (e.g. approving an
  application touches the Volunteer-owned `application` table), the fix is
  always: register that entity in **your own** `ngo.module.ts` via
  `TypeOrmModule.forFeature([...])` and inject its repository into **your
  own** `ngo.service.ts`. You read/write another role's *table* through your
  *own* module — you do not open their controller/service/entity file.
  Every step below that needs this is called out explicitly.
- **PRs go to `dev`, never `main`.** Push your branch, open a PR into `dev`.
  The repo owner will not resolve merge conflicts for you — keep your branch
  rebased on `dev` before opening the PR, and coordinate in advance if you
  and someone else are about to touch the same shared file (there shouldn't
  be one, per the rule above, but `app.module.ts` and `package.json` are the
  two files everyone shares).

## Already done (do not redo)

- `src/ngo/entities/ngo.entity.ts`, `volunteer-call.entity.ts`,
  `donation-call.entity.ts`, `assignment.entity.ts` — all columns and
  relations from the PRD are already in place, including `profileImage`.
- `src/ngo/ngo.enums.ts` — `VolunteerCallStatus`, `DonationCallStatus`,
  `AssignmentStatus`.
- `src/ngo/ngo.module.ts` registers `Ngo, VolunteerCall, DonationCall,
  Assignment` (plus the shared `User`, `Otp` — see note below) via
  `forFeature`.
- `GET /ngo` — base health-check route.
- `POST /ngo/profile/image` — profile image upload, fully working
  (`src/ngo/ngo.controller.ts` + `src/ngo/ngo.service.ts`). **Use this as
  your reference pattern** for interceptors/repository-injection style —
  the other three members are copying this exact shape for their own role.

You (repo owner) also own `src/common/**` — `user.entity.ts`, `otp.entity.ts`,
`common.enums.ts`, `common/config/multer.config.ts`. These are written once
and imported by everyone; don't change their shape without telling the whole
team, since all four roles depend on them.

## Phase 3 — DTOs

Create `src/ngo/dto/` with:
- `create-ngo.dto.ts` — `email` (`@IsEmail`), `password` (`@IsString
  @MinLength(6)` + at least one complexity rule), `orgName`, `regNumber`,
  `phone`, `city`. `fullName` is nullable on the entity — make it optional
  (`@IsOptional()`) in the DTO too.
- `login.dto.ts` — `email`, `password`.
- `verify-otp.dto.ts` — `email` or `userId`, `code` (the plain 6-digit OTP).

Follow the existing DTO style: every field gets `@IsNotEmpty()` (or
`@IsOptional()`) plus a type decorator plus a descriptive `message`.

## Phase 4 — Auth: signup / verify-otp / login / verify-login-otp

All four routes read/write the shared `user` and `otp` tables — you already
have `User` and `Otp` registered in your own `ngo.module.ts`, so just inject
both repositories into `NgoService` alongside `Ngo`.

1. `POST /ngo/signup` — check `email` not already in `user`
   (`ConflictException` if it is), `bcrypt.hash()` the password, create the
   `user` row (`role: UserRole.NGO`) and the `ngo` row in the same flow,
   generate a 6-digit OTP, `bcrypt.hash()` it into an `otp` row with
   `purpose: OtpPurpose.SIGNUP`, email the **plain** OTP (mailer — see
   below).
2. `POST /ngo/verify-otp` — look up the OTP, check it's not expired and not
   already used, mark `isUsed = true`, set `user.isVerified = true`.
3. `POST /ngo/login` — check email exists, `bcrypt.compare()` the password,
   check `isVerified` (`UnauthorizedException` otherwise), issue a new OTP
   with `purpose: OtpPurpose.LOGIN`, email it.
4. `POST /ngo/verify-login-otp` — verify like step 2, then sign and return a
   JWT containing `{ userId, role }`.

Mailer: `npm i @nestjs-modules/mailer nodemailer` (once, for your own
branch — everyone installs it independently since each person needs it).
Use `MAIL_USER` / `MAIL_PASS` from `.env` (already in `.env.example`).

## Phase 5 — you are not blocked, but you block others

Per the PRD's cross-member chain, **Admin must have `POST /admin/crisis`
working before you can do anything meaningful** (you can't join a crisis
that doesn't exist). Confirm with Admin (steve) that at least one crisis
exists in the shared dev DB before testing your own crisis-joining routes
end-to-end.

## Phase 6 — your 1:N + M:N routes

Build these in this order (matches the PRD Build Order — NGO's
`volunteer_call`/`donation_call` block Volunteer and Donor, so do these
before anything else in this phase):

| Verb | Route | Notes |
|---|---|---|
| GET | `/ngo/profile` | guarded |
| PUT | `/ngo/profile` | full update |
| PATCH | `/ngo/profile/active` | toggle `isActive` only |
| GET | `/ngo/crisis` | browse — filters `?status=&city=&category=` |
| POST | `/ngo/crisis/:crisisId/join` | **M:N attach** — `crisis_participation` |
| DELETE | `/ngo/crisis/:crisisId/leave` | **M:N detach** |
| GET | `/ngo/my-crises` | `relations: ['crises']` |
| POST | `/ngo/volunteer-call` | **1:N create**, under a crisis |
| GET | `/ngo/volunteer-call` | filters `?status=&crisisId=&city=` |
| PUT | `/ngo/volunteer-call/:id` | |
| PATCH | `/ngo/volunteer-call/:id/status` | |
| DELETE | `/ngo/volunteer-call/:id` | |
| POST | `/ngo/donation-call` | **1:N create** |
| GET | `/ngo/donation-call` | filters `?status=&crisisId=` |
| PATCH | `/ngo/donation-call/:id/status` | |

## Phase 9 — assignment (this is the one that touches another role's table)

- `GET /ngo/volunteer-call/:id/applicants` — filters `?status=`, loads
  applications + volunteer + skills. **This reads the Volunteer-owned
  `application` table.** Register `Application` (from
  `src/volunteer/entities/application.entity.ts`) in your own
  `ngo.module.ts` `forFeature` array and inject `Repository<Application>`
  into `NgoService`. Do not open any file under `src/volunteer/`.
- `POST /ngo/application/:id/approve` — **1:1 create** → creates an
  `assignment` row, flips the `application.status` to `APPROVED` (same
  registered-repository trick as above), and sends an approval email.
- `PATCH /ngo/application/:id/reject` — flips `application.status` to
  `REJECTED`.
- `GET /ngo/assignment` — filters `?status=&volunteerCallId=`.
- `PATCH /ngo/assignment/:id/complete` — flips `assignment.status` to
  `COMPLETED`.

This is also where Volunteer becomes unblocked (`work_log` depends on
`assignment` existing) — let nirzor know once you can approve applications
end-to-end.

## Phase 11 — JWT + Guard

- Add a JWT strategy (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`) and
  your own `NgoGuard` in `src/ngo/ngo.guard.ts`.
- Guard rejects missing/invalid tokens, and rejects `role !== 'NGO'`
  (`ForbiddenException`).
- Apply it to every route except signup/login/verify-otp.
- **Go back and add `@UseGuards(NgoGuard)` to `POST /ngo/profile/image`** —
  it was left unguarded for now with a `// TODO` comment in
  `ngo.controller.ts` because this guard didn't exist yet when that route
  was written.

## Phase 12 — filters everywhere

Every list route above must accept its documented query params. No
`/ngo/volunteer-call/open` style routes — one route, optional filters.

## Phase 13 — exception audit

Walk every route: does a lookup by id throw `NotFoundException` if nothing
matches? Does signup throw `ConflictException` on a duplicate email? Does
login throw `UnauthorizedException` on bad credentials/unverified account?

## Before opening your PR

```bash
npx tsc --noEmit   # must be clean
npm run build
npm run lint
```

Manually hit every new/changed route in Postman against your own local DB —
see `NGO_API_TESTING.md` in this same folder for the exact request/response
shapes to check against.

```bash
git checkout ngo
git pull origin dev      # rebase on latest dev before pushing
git push origin ngo
```

Open the PR **into `dev`**, not `main`. If it only touches `src/ngo/**`, it
only needs your own sign-off; if you added a `forFeature` entry that reaches
into someone else's entity, mention it explicitly in the PR description even
though you didn't edit their file.
