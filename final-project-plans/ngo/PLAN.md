# NGO — Final Project Plan

Your backend (`src/ngo/`) is already fully built and OTP-free: signup and
login both work in one step, exactly like this plan assumes. You do not need
to touch the auth logic at all.

## The one backend change you need

`GET /ngo/crisis` is currently guarded (`@UseGuards(NgoGuard)` in
`src/ngo/ngo.controller.ts`). Remove that one decorator so browsing crises
needs no token. Everything else in the file — `join`, `leave`, `my-crises`,
`volunteer-call`, `donation-call`, `application`, `assignment`, `profile` —
stays guarded exactly as it is. This one change is what makes real
server-side rendering possible (see the root `README.md` in this folder for
why).

## Pages to build

| Route | CSR/SSR | Data | Axios call |
|---|---|---|---|
| `/` | SSR | first 3 active crises | `GET /ngo/crisis` |
| `/register` | CSR | — | `POST /ngo/signup` |
| `/login` | CSR | — | `POST /ngo/login` |
| `/dashboard` | CSR | your org profile | `GET /ngo/profile` |
| `/crises` | SSR | all crises (folder-based route) | `GET /ngo/crisis` |
| `/crises/loading.tsx` | — | Next.js loading UI while the above fetch runs | — |
| `/crises/[id]` | SSR | one crisis (dynamic route) | reuses the same `GET /ngo/crisis` list, find by id server-side |
| `/crises/[id]` → `notFound()` | — | call `notFound()` from `next/navigation` when the id isn't in the list, which renders `not-found.tsx` | — |
| `/crises/[id]` "Join" button | CSR (client component nested in the SSR page) | — | `POST /ngo/crisis/:id/join` |
| `/my-crises` | CSR | crises you've joined + a "Leave" button | `GET /ngo/my-crises`, `DELETE /ngo/crisis/:id/leave` |
| `/calls` | CSR | your volunteer calls, a create form, a close button | `GET /ngo/volunteer-call`, `POST /ngo/volunteer-call`, `PATCH /ngo/volunteer-call/:id/status` |
| `/donation-calls` | CSR | your donation calls + create form | `GET /ngo/donation-call`, `POST /ngo/donation-call` |

That's 14 Axios call sites (3 SSR — home teaser, crisis list, crisis detail
— and 11 CSR), well past the 12 minimum with both counts covered.

## Auth + validation

Already built for `/login` and `/register` — Zod for form validation,
`localStorage.setItem("token", ...)` and `localStorage.setItem("orgName",
...)` on successful login, read back with `useEffect` on `/dashboard`. Every
guarded call from a Client Component sends `Authorization: Bearer <token>`
read from `localStorage`.

## Required components (no styling opinions here — just what has to exist)

- A Navbar (shared across all pages via `app/layout.tsx`)
- Crisis / call cards for each list item
- A carousel somewhere reasonable — the home page teaser (3 crises) is the
  natural fit

## Optional

- `/assignment` — read-only list, `GET /ngo/assignment` (CSR). Nice extra
  margin above 12 if you want it; not required.
- PusherJS notification (bonus 5 marks) — e.g. notify when a volunteer
  applies to one of your calls. Skip unless you specifically want to take on
  a third-party real-time service and explain it; nothing above depends on
  it.
