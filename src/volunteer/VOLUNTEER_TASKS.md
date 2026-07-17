# Volunteer — Build Guide (Member C)

Branch: `volunteer` · Folder: `src/volunteer/**` · Owner: @nirzordas

This is your complete, step-by-step path to finishing the Volunteer role for
the CrisisConnect midterm. Work through it top to bottom — later steps
depend on earlier ones.

## Ground rules — read this first

- **You only commit inside `src/volunteer/**`.** Every file you create or
  edit for this role lives there.
- **You will `import` from `src/common/` and `src/ngo/entities/`
  constantly** — that is expected and fine. Importing a class is not
  "touching" it. You do not edit anything under `src/common/`,
  `src/admin/`, `src/ngo/`, or `src/donor/`.
- Your `application` entity has a Many-to-One to NGO's `volunteer_call`, and
  your `assignment` relation (inverse 1:1) points at NGO's `assignment`
  entity — both already exist and are already imported correctly in
  `src/volunteer/entities/application.entity.ts`. You never need to open
  anything under `src/ngo/`.
- **One case where you read another role's table**: `GET /volunteer/calls`
  (browsing open volunteer calls) and anything that needs to check
  `assignment` status reads NGO-owned tables (`volunteer_call`,
  `assignment`). The fix is the same pattern every time: register
  `VolunteerCall` and/or `Assignment` in your **own**
  `volunteer.module.ts` `forFeature` array and inject the repository into
  your **own** `volunteer.service.ts`. Do not open any file under
  `src/ngo/`.
- **PRs go to `dev`, never `main`.** Push your branch, open a PR into `dev`.
  The repo owner will not resolve merge conflicts for you — keep your
  branch rebased on `dev` before opening the PR.

## Already done (do not redo)

- `src/volunteer/entities/volunteer.entity.ts`, `skill.entity.ts`,
  `application.entity.ts`, `work-log.entity.ts` — all columns and relations
  from the PRD are already in place, including `profileImage` on
  `volunteer`.
- `src/volunteer/volunteer.enums.ts` — `ApplicationStatus`.
- `src/volunteer/volunteer.module.ts` registers `Volunteer, Skill,
  Application, WorkLog` via `forFeature`.
- `GET /volunteer` — base health-check route.

## Task 0 — add your own profile image upload route

NGO's role already has this fully working
(`src/ngo/ngo.controller.ts` + `src/ngo/ngo.service.ts`) — copy that exact
pattern into your own files:

1. In `volunteer.controller.ts`, add:
   ```ts
   import { Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
   import { FileInterceptor } from '@nestjs/platform-express';
   import { imageUploadOptions } from '../common/config/multer.config';

   @Post('profile/image')
   @UseInterceptors(FileInterceptor('image', imageUploadOptions('volunteer')))
   uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
     return this.volunteerService.uploadProfileImage(req.user?.id, file?.filename);
   }
   ```
2. In `volunteer.service.ts`, inject `Repository<Volunteer>` and add
   `uploadProfileImage(userId, filename)`: throw
   `BadRequestException('Image file is required')` if `filename` is falsy,
   otherwise build `/uploads/volunteer/${filename}` and update the row —
   **use `createQueryBuilder().update(Volunteer).set(...).where('userId = :userId', { userId })`**,
   not `repository.update({ user: { id: userId } }, ...)` — the latter
   throws `Cannot find alias for relation at user` in this TypeORM version.
   Copy `ngo.service.ts`'s `uploadProfileImage` method shape exactly.
3. Leave the route unguarded with a `// TODO: @UseGuards(VolunteerGuard)`
   comment until Phase 11 below.

## Phase 3 — DTOs

Create `src/volunteer/dto/` with:
- `create-volunteer.dto.ts` — `email` (`@Matches(/@aiub\.edu$/)` per the
  existing convention), `password`, `username`, `fullName`, `phone`, `city`.
  **Do not include `isAvailable` or `totalHours`** — both have DB defaults
  (`true` / `0`) and aren't set at signup.
- `login.dto.ts` — `email`, `password`.
- `verify-otp.dto.ts` — `email` (or `userId`), `code`.
- `apply-task.dto.ts` — `message`.

Every field: `@IsNotEmpty()` + a type decorator + a descriptive `message`.

## Phase 4 — Auth: signup / verify-otp / login / verify-login-otp

Add `User, Otp` to your own `volunteer.module.ts` `forFeature` array (each
role registers its own copy of the shared tables), inject both repositories
in `VolunteerService`.

1. `POST /volunteer/signup` — check email not taken (`ConflictException`),
   bcrypt the password, create `user` (`role: UserRole.VOLUNTEER`) + your
   `volunteer` row, generate + hash a 6-digit OTP
   (`purpose: OtpPurpose.SIGNUP`), email the plain code.
2. `POST /volunteer/verify-otp` — check code + `expiresAt`, mark `isUsed`,
   set `user.isVerified = true`.
3. `POST /volunteer/login` — check email + bcrypt compare + `isVerified`
   (`UnauthorizedException` otherwise), issue `purpose: OtpPurpose.LOGIN`
   OTP, email it.
4. `POST /volunteer/verify-login-otp` — verify, then sign and return a JWT
   `{ userId, role }`.

Mailer: `npm i @nestjs-modules/mailer nodemailer`, use `MAIL_USER`/`MAIL_PASS`
from `.env`.

## Phase 5 — you are blocked twice, in this order

1. You cannot meaningfully test `GET /volunteer/calls` or
   `POST /volunteer/application` until **Admin** has declared a crisis and
   **NGO** has posted at least one `volunteer_call` under it (Phase 5/6 of
   their guides). Check with them before testing end-to-end.
2. You cannot test `POST /volunteer/work-log` until **NGO** has approved one
   of your applications, which creates the `assignment` row you log hours
   against (their Phase 9). This is the last thing to unblock — build
   everything else first.

## Phase 6/7 — your routes

⚠️ **Route order matters**: `GET /volunteer/search` must be declared
**above** `GET /volunteer/:username` in the controller, or Nest will match
`search` as a `:username` value.

| Verb | Route | Notes |
|---|---|---|
| GET | `/volunteer/profile` | guarded |
| PUT | `/volunteer/profile` | full update |
| PATCH | `/volunteer/profile/availability` | toggle `isAvailable` only |
| GET | `/volunteer/search` | filters `?city=&isAvailable=&skill=` — **declare before `:username`** |
| GET | `/volunteer/:username` | |
| POST | `/volunteer/skill` | creates a `skill` row |
| POST | `/volunteer/me/skill/:skillId` | **M:N attach** — `volunteer_skill` |
| DELETE | `/volunteer/me/skill/:skillId` | **M:N detach** |
| GET | `/volunteer/me/skill` | `relations: ['skills']` |
| GET | `/volunteer/calls` | browse open calls (NGO's table) — filters `?city=&crisisId=&status=` |
| POST | `/volunteer/application` | **1:N create** — `ConflictException` if already applied |
| GET | `/volunteer/application` | filters `?status=` |
| DELETE | `/volunteer/application/:id` | only if still `PENDING` |
| GET | `/volunteer/assignment` | your approved assignments (NGO's table) |
| POST | `/volunteer/work-log` | **1:N create** — also increments `totalHours` |
| GET | `/volunteer/work-log` | filters `?assignmentId=&from=&to=` |

`POST /volunteer/work-log`: run the `work_log` insert and the
`volunteer.totalHours` increment inside one transaction
(`dataSource.transaction(...)` or `queryRunner`), so a failure can't leave
one written without the other.

## Phase 11 — JWT + Guard

Add your own `VolunteerGuard` in `src/volunteer/volunteer.guard.ts`. Rejects
missing/invalid tokens and `role !== 'VOLUNTEER'` (`ForbiddenException`).
Apply to every route except signup/login. Go back and add
`@UseGuards(VolunteerGuard)` to `POST /volunteer/profile/image`.

## Phase 12 — filters everywhere

Every list route above must accept its documented query params as one route
with optional filters — never a separate route per filter value.

## Phase 13 — exception audit

Every id/username lookup → `NotFoundException` if missing. Signup duplicate
email → `ConflictException`. Bad login → `UnauthorizedException`. Applying
twice to the same call → `ConflictException`. Deleting a non-`PENDING`
application → `BadRequestException`.

## Before opening your PR

```bash
npx tsc --noEmit   # must be clean
npm run build
npm run lint
```

Manually hit every new/changed route in Postman against your own local DB —
see `VOLUNTEER_API_TESTING.md` in this same folder for exact
request/response shapes.

```bash
git checkout volunteer
git pull origin dev      # rebase on latest dev before pushing
git push origin volunteer
```

Open the PR **into `dev`**, not `main`.
