# Donor — Build Guide (Member D)

Branch: `donor` · Folder: `src/donor/**` · Owner: @nazmussakib0203

This is your complete, step-by-step path to finishing the Donor role for the
CrisisConnect midterm. Work through it top to bottom — later steps depend on
earlier ones.

## Ground rules — read this first

- **You only commit inside `src/donor/**`.** Every file you create or edit
  for this role lives there.
- **You will `import` from `src/common/` and `src/ngo/entities/`
  constantly** — that is expected and fine. Importing a class is not
  "touching" it. You do not edit anything under `src/common/`,
  `src/admin/`, `src/ngo/`, or `src/volunteer/`.
- **One place you write to another role's table**: when a payment
  succeeds, you must increment `donation_call.raisedAmount` — that table is
  NGO-owned (`src/ngo/entities/donation-call.entity.ts`). The fix is: add
  `DonationCall` to your **own** `donor.module.ts` `forFeature` array and
  inject `Repository<DonationCall>` into your **own** `donor.service.ts`.
  Do not open any file under `src/ngo/`.
- **PRs go to `dev`, never `main`.** Push your branch, open a PR into `dev`.
  The repo owner will not resolve merge conflicts for you — keep your
  branch rebased on `dev` before opening the PR.

## Already done (do not redo)

- `src/donor/entities/donor.entity.ts`, `donation.entity.ts`,
  `payment.entity.ts`, `receipt.entity.ts` — all columns and relations from
  the PRD are already in place, including `profileImage` on `donor`.
- `src/donor/donor.enums.ts` — `DonationStatus`, `PaymentStatus`.
- `src/donor/donor.module.ts` registers `Donor, Donation, Payment, Receipt`
  via `forFeature`.
- `GET /donor` — base health-check route.

## Task 0 — add your own profile image upload route

NGO's role already has this fully working
(`src/ngo/ngo.controller.ts` + `src/ngo/ngo.service.ts`) — copy that exact
pattern into your own files:

1. In `donor.controller.ts`, add:
   ```ts
   import { Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
   import { FileInterceptor } from '@nestjs/platform-express';
   import { imageUploadOptions } from '../common/config/multer.config';

   @Post('profile/image')
   @UseInterceptors(FileInterceptor('image', imageUploadOptions('donor')))
   uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
     return this.donorService.uploadProfileImage(req.user?.id, file?.filename);
   }
   ```
2. In `donor.service.ts`, inject `Repository<Donor>` and add
   `uploadProfileImage(userId, filename)`: throw
   `BadRequestException('Image file is required')` if `filename` is falsy,
   otherwise build `/uploads/donor/${filename}` and update the row —
   **use `createQueryBuilder().update(Donor).set(...).where('userId = :userId', { userId })`**,
   not `repository.update({ user: { id: userId } }, ...)` — the latter
   throws `Cannot find alias for relation at user` in this TypeORM version.
   Copy `ngo.service.ts`'s `uploadProfileImage` method shape exactly.
3. Leave the route unguarded with a `// TODO: @UseGuards(DonorGuard)`
   comment until Phase 11 below.

## Phase 3 — DTOs

Create `src/donor/dto/` with:
- `create-donor.dto.ts` — `email`, `password`, `fullName`, `city`,
  `country` (`@IsOptional()` — defaults to `'Unknown'` at the DB level if
  omitted). **Do not include `uniqueId` or `joiningDate`** — see the note
  below.
- `login.dto.ts` — `email`, `password`.
- `verify-otp.dto.ts` — `email` (or `userId`), `code`.
- `pay-donation.dto.ts` — `cardNumber` (full number, used only to check the
  last digit — never stored), used by the simulated payment route.

**`uniqueId` note**: the `donor` entity does not auto-generate this column
(there's no `@BeforeInsert` hook — the PRD lists it as a plain
`varchar(150)`). In your signup service method, generate it yourself with
`randomUUID()` from Node's built-in `crypto` module and set it explicitly
when you create the row.

Every field: `@IsNotEmpty()` (or `@IsOptional()`) + a type decorator + a
descriptive `message`.

## Phase 4 — Auth: signup / verify-otp / login / verify-login-otp

Add `User, Otp` to your own `donor.module.ts` `forFeature` array (each role
registers its own copy of the shared tables), inject both repositories in
`DonorService`.

1. `POST /donor/signup` — check email not taken (`ConflictException`),
   bcrypt the password, create `user` (`role: UserRole.DONOR`) + your
   `donor` row (remember `uniqueId = randomUUID()`), generate + hash a
   6-digit OTP (`purpose: OtpPurpose.SIGNUP`), email the plain code.
2. `POST /donor/verify-otp` — check code + `expiresAt`, mark `isUsed`, set
   `user.isVerified = true`.
3. `POST /donor/login` — check email + bcrypt compare + `isVerified`
   (`UnauthorizedException` otherwise), issue `purpose: OtpPurpose.LOGIN`
   OTP, email it.
4. `POST /donor/verify-login-otp` — verify, then sign and return a JWT
   `{ userId, role }`.

Mailer: `npm i @nestjs-modules/mailer nodemailer`, use `MAIL_USER`/`MAIL_PASS`
from `.env`.

## Phase 5 — you are blocked twice, in this order

1. `POST /donor/crisis/:crisisId/follow` needs a crisis to exist —
   **Admin** builds `POST /admin/crisis` first.
2. `GET /donor/donation-call` and `POST /donor/donation` need **NGO** to
   have posted at least one `donation_call` under a crisis (their Phase 6).
   Check with them before testing end-to-end.

## Phase 6/7 — your routes

| Verb | Route | Notes |
|---|---|---|
| GET | `/donor/profile` | guarded |
| PUT | `/donor/profile` | full update |
| PATCH | `/donor/profile/country` | |
| GET | `/donor` | list donors — filters `?country=&city=&joinedAfter=` |
| GET | `/donor/crisis` | browse (Admin's table) — filters `?status=&category=&city=` |
| POST | `/donor/crisis/:crisisId/follow` | **M:N attach** — `crisis_follow` |
| DELETE | `/donor/crisis/:crisisId/unfollow` | **M:N detach** |
| GET | `/donor/me/following` | `relations: ['followedCrises']` |
| GET | `/donor/donation-call` | browse (NGO's table) — filters `?status=&crisisId=` |
| POST | `/donor/donation` | **1:N create** — status `INITIATED` |
| GET | `/donor/donation` | filters `?status=&crisisId=&minAmount=` |
| DELETE | `/donor/donation/:id` | only if still `INITIATED` |

## Phase 10 — payment → receipt (your 1:1 chain)

- `POST /donor/donation/:id/pay` — **1:1 create** → `payment`. Only
  `INITIATED` donations can be paid; retrying a `PAID` one is a
  `BadRequestException`. Deterministic simulation: **card number ending in
  `0` → `FAILED`; anything else → `SUCCESS`.** Never store the full card
  number — `cardLast4` only.
- On `SUCCESS`, in one transaction: create the `receipt` row, set
  `donation.status = PAID`, and increment `donation_call.raisedAmount` (the
  cross-role write described above) — then email the receipt.
- `GET /donor/receipt/:id` — `relations: ['payment', 'payment.donation']`.
- A donor with receipts is **deactivated, never deleted** — don't build a
  hard-delete path for a donor once they have a receipt on file.

## Phase 11 — JWT + Guard

Add your own `DonorGuard` in `src/donor/donor.guard.ts`. Rejects missing/
invalid tokens and `role !== 'DONOR'` (`ForbiddenException`). Apply to every
route except signup/login. Go back and add `@UseGuards(DonorGuard)` to
`POST /donor/profile/image`.

## Phase 12 — filters everywhere

Every list route above must accept its documented query params as one route
with optional filters — never a separate route per filter value.

## Phase 13 — exception audit

Every id lookup → `NotFoundException` if missing. Signup duplicate email →
`ConflictException`. Bad login → `UnauthorizedException`. Paying an
already-`PAID` donation → `BadRequestException`. Deleting a non-`INITIATED`
donation → `BadRequestException`.

## Before opening your PR

```bash
npx tsc --noEmit   # must be clean
npm run build
npm run lint
```

Manually hit every new/changed route in Postman against your own local DB —
see `DONOR_API_TESTING.md` in this same folder for exact request/response
shapes.

```bash
git checkout donor
git pull origin dev      # rebase on latest dev before pushing
git push origin donor
```

Open the PR **into `dev`**, not `main`.
