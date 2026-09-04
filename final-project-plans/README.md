# Final Project Plans

CrisisConnect is graded per person, not per team. Each of the four roles
(NGO, Admin, Volunteer, Donor) is a separate frontend, built by a different
teammate against their own slice of this backend, and each one must
independently satisfy the same rubric:

- 12+ Axios calls, rendered with CSR or SSR depending on the scenario (25 marks)
- Proper layout using components + Tailwind CSS (10 marks)
- Different routing: folder-based, dynamic, and route files like `loading`
  and `not-found` (10 marks)
- Frontend data validation and authentication (10 marks)
- PusherJS real-time notification (bonus, 5 marks — optional, see each plan)
- Class add-ons repeated in every plan: at least 3 CSR and 3 SSR pages, Axios
  only (no `fetch`), a Navbar + Card + Carousel somewhere, role-based
  register/login.

Open your own folder — `ngo/`, `admin/`, `volunteer/`, or `donor/` — for your
plan. Read only your own; you don't need the others to do your part. None of
these plans say anything about colors, spacing, or Tailwind class choices —
that's entirely up to whoever builds the page.

## Ground rule that applies to all four

Every non-auth route in this backend is currently guarded (`Authorization:
Bearer <token>` required) — that's how it demonstrates authentication for
the backend's own grading. But a Server Component (used for SSR) runs on the
server and can't read `localStorage`, so it can never attach that header —
there is no `fetch`/cookie-based session in this project, on purpose, to
avoid pulling in Next.js middleware (not taught).

The fix used in every plan below is the same one line each role needs:
**unguard exactly one existing "browse" GET route** so it returns data to
anyone, logged in or not. That route becomes the one SSR data source
(home teaser, list page, and dynamic detail page all read it). Every other
route — profile, create, update, approve, delete, anything personal or
mutating — stays guarded and is called from the browser after login, with
the JWT read out of `localStorage` and sent as `Authorization: Bearer
<token>` on that one Axios call. This is exactly the pattern already
working end-to-end in the NGO frontend.

## Why sign in has no OTP step here

The signup/login screens in these plans go straight from "submit the form"
to "logged in" — no emailed 6-digit code. Two backends (Admin, Volunteer)
still have the OTP step built in from an earlier phase; NGO's has already
had it removed. None of the four grading rubrics above ask for OTP or email
verification, so it's pure extra screens and extra explaining for no marks.
Each plan says exactly what to change if you want to drop it (10 minutes),
and exactly what to keep if you'd rather leave your backend as-is and just
add the two extra "enter code" screens instead. Either way works — this is
your call to make on your own branch.
