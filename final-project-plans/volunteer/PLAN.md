# Volunteer — Final Project Plan

Your backend (`src/volunteer/`) is already fully built: signup, login (with
OTP), profile, skills, browsing calls, applying, assignments, work logs. You
do not have to build any new backend routes to hit the numbers below — only
two small edits, both optional but recommended.

## Recommended backend edit 1 — drop OTP (optional, ~10 min)

Same situation as Admin: `POST /volunteer/login` only emails a code today;
you need `POST /volunteer/verify-login-otp` afterward to get a token, and
signup needs `POST /volunteer/verify-otp` before the account works at all.
None of the final-project rubric items ask for this. In
`src/volunteer/volunteer.service.ts`:

- `signup()`: save the user as already verified, skip sending the signup
  OTP, return a plain success message.
- `login()`: after the password + `isVerified` checks pass, sign and return
  the JWT directly instead of emailing a login code.

If you'd rather leave OTP in: everything below still works, you just add two
more pages and two more Axios calls (`verify-otp`, `verify-login-otp`) on
top of the count in the table below.

## Required backend edit 2 — unguard one browse route

`GET /volunteer/calls` is behind `@UseGuards(JwtAuthGuard)` in
`src/volunteer/volunteer.controller.ts`. Remove the guard from that one
route only. Visitors should be able to see open calls before registering as
a volunteer. Leave every other route (`application`, `assignment`,
`work-log`, `skill`, `profile`) guarded exactly as-is.

## Pages to build

| Route | CSR/SSR | Data | Axios call |
|---|---|---|---|
| `/` | SSR | first 3 open calls | `GET /volunteer/calls` |
| `/register` | CSR | — | `POST /volunteer/signup` |
| `/login` | CSR | — | `POST /volunteer/login` |
| `/dashboard` | CSR | your volunteer profile | `GET /volunteer/profile` |
| `/calls` | SSR | all open calls (folder-based route) | `GET /volunteer/calls` |
| `/calls/loading.tsx` | — | loading UI while the fetch runs | — |
| `/calls/[id]` | SSR | one call (dynamic route) | reuses the same `GET /volunteer/calls` list, find by id server-side |
| `/calls/[id]` → `notFound()` | — | call `notFound()` when the id isn't in the list, which renders `not-found.tsx` | — |
| `/calls/[id]` "Apply" form | CSR (client component nested in the SSR page) | a short message field | `POST /volunteer/application` |
| `/applications` | CSR | your applications + a withdraw button | `GET /volunteer/application`, `DELETE /volunteer/application/:id` |
| `/profile/edit` | CSR | edit form + availability toggle | `PUT /volunteer/profile`, `PATCH /volunteer/profile/availability` |
| `/assignments` | CSR | your approved assignments (read-only) | `GET /volunteer/assignment` |

That's 12 Axios call sites (3 SSR, 9 CSR) — exactly at the minimum with both
counts covered.

## Signup form fields

`email, password, username, fullName, phone, city` — note `email` must
actually be a `@gmail.com` address (`CreateVolunteerDto` enforces this with
a regex), so mention that on the form or the backend will reject anything
else with a 400.

## Applying to a call

`POST /volunteer/application` body: `{ volunteerCallId, message }`. Both are
required strings/numbers — `volunteerCallId` comes from the `[id]` route
param, `message` is a short text field on the form ("why do you want to help
with this?").

## Auth + validation

Same shape as NGO: Zod validation on every form, one `error` string per
form, `localStorage` for the token and a display name, `Authorization:
Bearer <token>` attached on every guarded call.

## Required components (no styling opinions here — just what has to exist)

- A Navbar (shared via `app/layout.tsx`)
- Call cards for each list item
- A carousel somewhere reasonable — the home page teaser is the natural fit

## Optional — skip unless you want extra scope

- Skills (`POST /volunteer/skill`, `me/skill` attach/detach/list) — a whole
  many-to-many relationship on top of everything above. Not needed for the
  12-call minimum; only add it if you want more to show.
- Work logs (`POST`/`GET /volunteer/work-log`) — another 1:N pair, same
  reasoning: nice extra, not required.
- PusherJS notification (bonus 5 marks) — e.g. notify when your application
  gets approved. Skip unless you specifically want the extra 5 marks.
