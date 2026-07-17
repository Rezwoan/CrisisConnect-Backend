# Volunteer API — Postman Testing Guide

Base URL: `http://localhost:3000/volunteer`

Legend: **✅ Implemented** — test it now. **⬜ Planned** — build it per
`VOLUNTEER_TASKS.md`, then use this doc as the target contract for what it
should return.

Once your Guard exists (Phase 11), every route below except signup/login
needs a header:
```
Authorization: Bearer <token from /volunteer/verify-login-otp>
```

## Route summary

| Status | Verb | Route | Filters |
|---|---|---|---|
| ✅ | GET | `/volunteer` | — |
| ⬜ | POST | `/volunteer/profile/image` | — (Task 0 — build this first) |
| ⬜ | POST | `/volunteer/signup` | — |
| ⬜ | POST | `/volunteer/verify-otp` | — |
| ⬜ | POST | `/volunteer/login` | — |
| ⬜ | POST | `/volunteer/verify-login-otp` | — |
| ⬜ | GET | `/volunteer/profile` | — |
| ⬜ | PUT | `/volunteer/profile` | — |
| ⬜ | PATCH | `/volunteer/profile/availability` | — |
| ⬜ | GET | `/volunteer/search` | `?city=&isAvailable=&skill=` |
| ⬜ | GET | `/volunteer/:username` | — |
| ⬜ | POST | `/volunteer/skill` | — |
| ⬜ | POST | `/volunteer/me/skill/:skillId` | — |
| ⬜ | DELETE | `/volunteer/me/skill/:skillId` | — |
| ⬜ | GET | `/volunteer/me/skill` | — |
| ⬜ | GET | `/volunteer/calls` | `?city=&crisisId=&status=` |
| ⬜ | POST | `/volunteer/application` | — |
| ⬜ | GET | `/volunteer/application` | `?status=` |
| ⬜ | DELETE | `/volunteer/application/:id` | — |
| ⬜ | GET | `/volunteer/assignment` | — |
| ⬜ | POST | `/volunteer/work-log` | — |
| ⬜ | GET | `/volunteer/work-log` | `?assignmentId=&from=&to=` |

---

## ✅ `GET /volunteer`

**Postman**: Method `GET`, URL `http://localhost:3000/volunteer`. No
headers, no body.

**Expected output** — `200 OK`, plain text:
```
Volunteer module is working
```

---

## ⬜ `POST /volunteer/profile/image` (Task 0)

Once built (copy NGO's exact pattern — see `VOLUNTEER_TASKS.md` Task 0):

**Postman**:
- Method `POST`, URL `http://localhost:3000/volunteer/profile/image`
- Body tab → `form-data`
- Key `image`, type switched to "File", pick a `.jpg`/`.png`/`.webp` under
  2MB.

**Expected output** — `200 OK`:
```json
{
  "message": "Profile image uploaded successfully",
  "profileImage": "/uploads/volunteer/1784277529778-776371457.png"
}
```
Reachable afterward at `http://localhost:3000<profileImage>`.

**Error cases** — missing file → `400 { "message": "Image file is required" }`;
wrong mimetype → `400 { "message": "Only jpeg, png, or webp images are allowed" }`;
over 2MB → `413`.

---

## ⬜ Auth routes (build per `VOLUNTEER_TASKS.md` Phase 4)

### `POST /volunteer/signup`
```json
{
  "email": "myvolunteer@aiub.edu",
  "password": "Secret123",
  "username": "ayesha_r",
  "fullName": "Ayesha Rahman",
  "phone": "01712345678",
  "city": "Dhaka"
}
```
**Expected** — `201`, OTP emailed:
```json
{ "message": "Signup successful, OTP sent to your email" }
```
Non-`@aiub.edu` email → `400`. Duplicate email/username → `409`.

### `POST /volunteer/verify-otp`
```json
{ "email": "myvolunteer@aiub.edu", "code": "482913" }
```
**Expected** — `200`: `{ "message": "Account verified successfully" }`.

### `POST /volunteer/login`
```json
{ "email": "myvolunteer@aiub.edu", "password": "Secret123" }
```
**Expected** — `200`, OTP emailed: `{ "message": "OTP sent to your email" }`.

### `POST /volunteer/verify-login-otp`
```json
{ "email": "myvolunteer@aiub.edu", "code": "119284" }
```
**Expected** — `200`:
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
Use this in `Authorization: Bearer <token>` for every route below.

---

## ⬜ Profile

### `GET /volunteer/profile`
**Expected** — `200`:
```json
{
  "id": 1,
  "username": "ayesha_r",
  "fullName": "Ayesha Rahman",
  "phone": "01712345678",
  "city": "Dhaka",
  "isAvailable": true,
  "totalHours": 0,
  "profileImage": "/uploads/volunteer/1784277529778-776371457.png"
}
```

### `PUT /volunteer/profile` — full replacement of `fullName`, `phone`,
`city`. **Expected** — `200` with the updated row.

### `PATCH /volunteer/profile/availability`
```json
{ "isAvailable": false }
```
**Expected** — `200` reflecting the new value.

---

## ⬜ Search + skills

⚠️ Test `/volunteer/search` first — if it 404s or matches `:username`
instead, the route order in the controller is wrong (search must be
declared above `:username`).

### `GET /volunteer/search?city=Dhaka&isAvailable=true&skill=medical`
**Expected** — `200`, array of matching volunteers.

### `GET /volunteer/ayesha_r`
**Expected** — `200`, single volunteer by username. Non-existent → `404`.

### `POST /volunteer/skill`
```json
{ "name": "first aid" }
```
**Expected** — `201`. Duplicate skill name → `409`.

### `POST /volunteer/me/skill/1` — attach skill id 1 to yourself. No body.
**Expected** — `200`: `{ "message": "Skill added" }`.

### `DELETE /volunteer/me/skill/1` — **Expected** — `200`:
`{ "message": "Skill removed" }`.

### `GET /volunteer/me/skill`
**Expected** — `200`, with `relations: ['skills']`:
```json
{ "id": 1, "username": "ayesha_r", "skills": [{ "id": 1, "name": "first aid" }] }
```

---

## ⬜ Calls, applications, assignments, work log

### `GET /volunteer/calls?city=Dhaka&crisisId=1&status=OPEN`
**Expected** — `200`, array of open volunteer calls (NGO's table) matching
the filters.

### `POST /volunteer/application`
```json
{ "volunteerCallId": 5, "message": "I have first-aid experience" }
```
**Expected** — `201`. Applying twice to the same call → `409 Conflict`.

### `GET /volunteer/application?status=PENDING`
**Expected** — `200`, array of your own applications.

### `DELETE /volunteer/application/3`
**Expected** — `200` if still `PENDING`; `400 Bad Request` if already
`APPROVED`/`REJECTED`.

### `GET /volunteer/assignment`
**Expected** — `200`, array of your approved assignments (NGO's table) —
empty until NGO approves one of your applications.

### `POST /volunteer/work-log`
```json
{ "assignmentId": 1, "hours": 4, "note": "Distributed food packages at the Mirpur shelter" }
```
**Expected** — `201`, and your `totalHours` on `GET /volunteer/profile`
increases by `4` (written in the same transaction).

### `GET /volunteer/work-log?assignmentId=1&from=2026-07-01&to=2026-07-31`
**Expected** — `200`, array of matching log entries.
