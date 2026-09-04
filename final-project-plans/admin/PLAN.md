# Admin — Final Project Plan

Your backend (`src/admin/`) is already fully built: signup, login (with
OTP), profile, crisis CRUD, and announcements. You do not have to build any
new backend routes to hit the numbers below — only two small edits, both
optional but recommended.

## Recommended backend edit 1 — drop OTP (optional, ~10 min)

Right now `POST /admin/login` only emails a code and returns
`{ message: "OTP sent..." }`; you need a second call to
`POST /admin/verify-login-otp` to actually get a token, and signup needs
`POST /admin/verify-otp` before the account can log in at all. None of the
final-project rubric items ask for this, and it means building two more
screens (enter-signup-code, enter-login-code) for no extra marks. NGO's
backend already had this removed — same idea here:

- In `signup()` (`src/admin/admin.service.ts`): save the user with
  `isVerified: true` instead of `false`, skip sending the signup OTP, and
  return a plain success message. Delete/ignore `verify-otp` and
  `resend-otp` afterward.
- In `login()`: skip the `isVerified` check's OTP branch — after the
  password check passes, sign and return the JWT directly:
  `return { accessToken: await this.jwtService.signAsync({ userId: user.id, role: user.role }) }`.
  Delete/ignore `verify-login-otp`.

If you'd rather leave OTP in: everything below still works, you just add
two more pages (`/verify-signup`, `/verify-login`) and two more Axios calls
(`POST /admin/verify-otp`, `POST /admin/verify-login-otp`) on top of the
count in the table below.

## Required backend edit 2 — unguard one browse route

`GET /admin/crisis` and `GET /admin/crisis/:id` are both behind
`@UseGuards(AdminGuard)` in `src/admin/admin.controller.ts`. Remove the
guard from both. Crisis data is meant to be public safety information
anyway — visitors should be able to see active crises before registering.
Leave every other route (`POST/PUT/PATCH/DELETE crisis`, `announcement`,
`users`, `profile`) guarded exactly as-is.

## Pages to build

| Route | CSR/SSR | Data | Axios call |
|---|---|---|---|
| `/` | SSR | first 3 crises | `GET /admin/crisis` |
| `/register` | CSR | — | `POST /admin/signup` |
| `/login` | CSR | — | `POST /admin/login` |
| `/dashboard` | CSR | your admin profile | `GET /admin/profile` |
| `/crises` | SSR | all crises (folder-based route) | `GET /admin/crisis` |
| `/crises/loading.tsx` | — | loading UI while the fetch runs | — |
| `/crises/[id]` | SSR | one crisis (dynamic route) | `GET /admin/crisis/:id` |
| `/crises/[id]` → `notFound()` | — | call `notFound()` on a 404 response, which renders `not-found.tsx` | — |
| `/crises/new` | CSR | create-crisis form | `POST /admin/crisis` |
| `/crises/[id]/edit` (or a manage table on `/crises`) | CSR | edit + close buttons | `PUT /admin/crisis/:id`, `PATCH /admin/crisis/:id/status` |
| `/announcements/new` | CSR | create-announcement form | `POST /admin/announcement` |

That's 11 Axios call sites (3 SSR, 8 CSR) — one short of 12. Two easy ways
to close the gap, pick either:

- Add `/users` — read-only list, `GET /admin/users` (CSR). Realistic for an
  admin dashboard anyway.
- Add a "view announcement" step after creating one: `GET
  /admin/announcement/:id` (CSR), since the create form's response already
  gives you the new id.

`recipientUserIds` on the announcement form is a required, non-empty array
of user ids in the DTO. The simplest form for it is a single text input —
"Recipient user IDs, comma separated" — split on `,` and `.map(Number)`
before sending. That's not a taught pattern from a slide, it's just the
smallest amount of code that turns one text field into an array of numbers;
a real multi-select fed by `GET /admin/users` is a nicer version if you
build the `/users` page above anyway, but isn't required.

## Signup form fields

`email, password, fullName, phone, city, age` — `age` must be an integer
≥ 18 (`CreateAdminDto`).

## Auth + validation

Same shape as NGO: Zod validation on every form, one `error` string per
form, `localStorage` for the token (and whatever identity string you want to
greet with on `/dashboard`), `Authorization: Bearer <token>` attached on
every guarded call.

## Required components (no styling opinions here — just what has to exist)

- A Navbar (shared via `app/layout.tsx`)
- Crisis cards for each list item
- A carousel somewhere reasonable — the home page teaser is the natural fit

## Optional

- `/announcements` list page if you build `GET /admin/announcement` (list) —
  doesn't exist yet, only get-by-id does. Not required.
- PusherJS notification (bonus 5 marks) — e.g. notify when a new crisis is
  declared. Skip unless you want the extra 5 marks and don't mind explaining
  a third-party real-time service.
