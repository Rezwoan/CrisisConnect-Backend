# Admin — Build Guide (Member A)

Branch: `admin` · Folder: `src/admin/**` · Owner: @steve-A7

This is your complete, step-by-step path to finishing the Admin role for the
CrisisConnect midterm. Work through it top to bottom — later steps depend on
earlier ones.

## Ground rules — read this first

- **You only commit inside `src/admin/**`.** Every file you create or edit
  for this role lives there.
- **You will `import` from `src/common/`** (the shared `User`, `Otp`
  entities, `common.enums.ts`, and `common/config/multer.config.ts`)
  **constantly** — that is expected and fine. Importing a class is not
  "touching" it. You do not edit anything under `src/common/`,
  `src/ngo/`, `src/volunteer/`, or `src/donor/`.
- If a task ever seems to need writing to another role's table, the fix is:
  register that entity in your own `admin.module.ts` via
  `TypeOrmModule.forFeature([...])` and inject its repository into your own
  `admin.service.ts`. For your role, this doesn't actually come up — every
  route below only touches `user`, `otp`, `admin`, `crisis`, and
  `announcement`, all of which are already registered in your own
  `admin.module.ts`.
- **PRs go to `dev`, never `main`.** Push your branch, open a PR into `dev`.
  The repo owner will not resolve merge conflicts for you — keep your branch
  rebased on `dev` before opening the PR.

## Already done (do not redo)

- `src/admin/entities/admin.entity.ts`, `crisis.entity.ts`,
  `announcement.entity.ts` — all columns and relations from the PRD are
  already in place, including `profileImage` on `admin`.
- `src/admin/admin.enums.ts` — `AdminStatus`, `CrisisSeverity`,
  `CrisisStatus`.
- `src/admin/admin.module.ts` registers `Admin, Crisis, Announcement` via
  `forFeature`.
- `GET /admin` — base health-check route.

## Task 0 — add your own profile image upload route

NGO's role already has this fully working
(`src/ngo/ngo.controller.ts` + `src/ngo/ngo.service.ts`) — copy that exact
pattern into your own files:

1. In `admin.controller.ts`, add:
   ```ts
   import { Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
   import { FileInterceptor } from '@nestjs/platform-express';
   import { imageUploadOptions } from '../common/config/multer.config';

   @Post('profile/image')
   @UseInterceptors(FileInterceptor('image', imageUploadOptions('admin')))
   uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
     return this.adminService.uploadProfileImage(req.user?.id, file?.filename);
   }
   ```
2. In `admin.service.ts`, inject `Repository<Admin>` and add
   `uploadProfileImage(userId, filename)`: throw
   `BadRequestException('Image file is required')` if `filename` is falsy,
   otherwise build `/uploads/admin/${filename}` and update the row —
   **use a `createQueryBuilder().update(Admin).set(...).where('userId = :userId', { userId })`**,
   not `repository.update({ user: { id: userId } }, ...)` — the latter
   throws `Cannot find alias for relation at user` in this TypeORM version.
   This was already discovered and fixed the hard way in `ngo.service.ts` —
   copy that method's shape.
3. **Note**: leave the route unguarded with a `// TODO: @UseGuards(AdminGuard)`
   comment until Phase 11 below, same as NGO's version — the guard doesn't
   exist yet.

## Phase 3 — DTOs

Create `src/admin/dto/` with:
- `create-admin.dto.ts` — `email`, `password`, `fullName`, `phone`, `city`,
  `age`. **Do not include `status`** — your service sets
  `status: AdminStatus.ACTIVE` explicitly when it creates the row; it isn't
  something the admin picks at signup.
- `login.dto.ts` — `email`, `password`.
- `verify-otp.dto.ts` — `email` (or `userId`), `code`.

Every field: `@IsNotEmpty()` + a type decorator + a descriptive `message`.

## Phase 4 — Auth: signup / verify-otp / login / verify-login-otp

Inject `Repository<User>` and `Repository<Otp>` in `AdminService` (both
already registered — check whether your `admin.module.ts` needs `User`/`Otp`
added to its own `forFeature`; NGO's module registers them for the shared
tables, but each role registers its own copy per the PRD, so add
`User, Otp` to your own `forFeature` array too).

1. `POST /admin/signup` — check email not taken (`ConflictException`),
   bcrypt the password, create `user` (`role: UserRole.ADMIN`) + `admin` row
   (with `status: AdminStatus.ACTIVE`), generate + hash a 6-digit OTP
   (`purpose: OtpPurpose.SIGNUP`), email the plain code.
2. `POST /admin/verify-otp` — check code + `expiresAt`, mark `isUsed`, set
   `user.isVerified = true`.
3. `POST /admin/login` — check email + bcrypt compare + `isVerified`
   (`UnauthorizedException` otherwise), issue `purpose: OtpPurpose.LOGIN`
   OTP, email it.
4. `POST /admin/verify-login-otp` — verify, then sign and return a JWT
   `{ userId, role }`.

Mailer: `npm i @nestjs-modules/mailer nodemailer`, use `MAIL_USER`/`MAIL_PASS`
from `.env`.

## Phase 5 — you unblock everyone else, first

**`POST /admin/crisis` is the critical-path route for the whole team.**
NGO can't join a crisis, and Donor can't follow one, until at least one
exists. Build and verify this route before anything else in this phase, and
tell the other three members as soon as you have a crisis in the shared dev
DB they can test against.

## Phase 6/7 — your remaining routes

| Verb | Route | Notes |
|---|---|---|
| GET | `/admin/profile` | guarded |
| PUT | `/admin/profile` | full update |
| PATCH | `/admin/profile/status` | enum only (`AdminStatus`) |
| GET | `/admin/users` | filters `?role=&isActive=&city=&search=` |
| PATCH | `/admin/users/:id/deactivate` | `ParseIntPipe`, `NotFoundException` |
| POST | `/admin/crisis` | **1:N create** — build this one first, see above |
| GET | `/admin/crisis` | filters `?status=&severity=&category=&city=` |
| GET | `/admin/crisis/:id` | `relations: ['declaredByAdmin', 'ngos']` |
| PUT | `/admin/crisis/:id` | |
| PATCH | `/admin/crisis/:id/status` | |
| DELETE | `/admin/crisis/:id` | |

`GET /admin/users` reads the shared `user` table (already registered in your
module) — this is a normal read through your own repository, not a
cross-folder edit.

## Phase 8 — your M:N routes

| Verb | Route | Notes |
|---|---|---|
| POST | `/admin/announcement` | **M:N create** — attaches recipient `user` rows via `announcement_recipient` |
| GET | `/admin/announcement/:id` | loads `recipients` |
| DELETE | `/admin/announcement/:id/recipient/:userId` | **M:N detach** |

Urgent announcements (`isUrgent: true`) fire an email to every recipient;
normal ones are stored only — no email.

## Phase 11 — JWT + Guard

Add your own `AdminGuard` in `src/admin/admin.guard.ts`. Rejects missing/
invalid tokens and `role !== 'ADMIN'` (`ForbiddenException`). Apply to every
route except signup/login. Go back and add `@UseGuards(AdminGuard)` to
`POST /admin/profile/image` once this exists.

## Phase 12 — filters everywhere

Every list route above must accept its documented query params as one route
with optional filters — never a separate route per filter value.

## Phase 13 — exception audit

Every id lookup → `NotFoundException` if missing. Signup duplicate email →
`ConflictException`. Bad login → `UnauthorizedException`. Wrong role on a
guarded route → `ForbiddenException`.

## Before opening your PR

```bash
npx tsc --noEmit   # must be clean
npm run build
npm run lint
```

Manually hit every new/changed route in Postman against your own local DB —
see `ADMIN_API_TESTING.md` in this same folder for exact request/response
shapes.

```bash
git checkout admin
git pull origin dev      # rebase on latest dev before pushing
git push origin admin
```

Open the PR **into `dev`**, not `main`.
