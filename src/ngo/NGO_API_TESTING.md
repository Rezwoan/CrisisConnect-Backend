# NGO API — Postman Testing Guide

Base URL: `http://localhost:3000/ngo`

Legend: **✅ Implemented** — test it now. **⬜ Planned** — build it per
`NGO_TASKS.md`, then use this doc as the target contract for what it should
return.

Once your Guard exists (Phase 11), every route below except signup/login
needs a header:
```
Authorization: Bearer <token from /ngo/verify-login-otp>
```

## Route summary

| Status | Verb | Route | Filters |
|---|---|---|---|
| ✅ | GET | `/ngo` | — |
| ✅ | POST | `/ngo/profile/image` | — |
| ⬜ | POST | `/ngo/signup` | — |
| ⬜ | POST | `/ngo/verify-otp` | — |
| ⬜ | POST | `/ngo/login` | — |
| ⬜ | POST | `/ngo/verify-login-otp` | — |
| ⬜ | GET | `/ngo/profile` | — |
| ⬜ | PUT | `/ngo/profile` | — |
| ⬜ | PATCH | `/ngo/profile/active` | — |
| ⬜ | GET | `/ngo/crisis` | `?status=&city=&category=` |
| ⬜ | POST | `/ngo/crisis/:crisisId/join` | — |
| ⬜ | DELETE | `/ngo/crisis/:crisisId/leave` | — |
| ⬜ | GET | `/ngo/my-crises` | — |
| ⬜ | POST | `/ngo/volunteer-call` | — |
| ⬜ | GET | `/ngo/volunteer-call` | `?status=&crisisId=&city=` |
| ⬜ | PUT | `/ngo/volunteer-call/:id` | — |
| ⬜ | PATCH | `/ngo/volunteer-call/:id/status` | — |
| ⬜ | DELETE | `/ngo/volunteer-call/:id` | — |
| ⬜ | POST | `/ngo/donation-call` | — |
| ⬜ | GET | `/ngo/donation-call` | `?status=&crisisId=` |
| ⬜ | PATCH | `/ngo/donation-call/:id/status` | — |
| ⬜ | GET | `/ngo/volunteer-call/:id/applicants` | `?status=` |
| ⬜ | POST | `/ngo/application/:id/approve` | — |
| ⬜ | PATCH | `/ngo/application/:id/reject` | — |
| ⬜ | GET | `/ngo/assignment` | `?status=&volunteerCallId=` |
| ⬜ | PATCH | `/ngo/assignment/:id/complete` | — |

---

## ✅ `GET /ngo`

**Postman**: Method `GET`, URL `http://localhost:3000/ngo`. No headers, no
body.

**Expected output** — `200 OK`, plain text:
```
NGO module is working
```

## ✅ `POST /ngo/profile/image`

**Postman**:
- Method `POST`, URL `http://localhost:3000/ngo/profile/image`
- Body tab → `form-data`
- Add a key named exactly `image`, change its type from "Text" to "File"
  (dropdown on the right of the key field), choose a `.jpg`/`.png`/`.webp`
  file under 2MB.

**Expected output** — `200 OK`:
```json
{
  "message": "Profile image uploaded successfully",
  "profileImage": "/uploads/ngo/1784277529778-776371457.png"
}
```
The uploaded file is then reachable at
`http://localhost:3000<profileImage>` (static-served).

**Error cases**:
- No `image` key in the form-data → `400`:
  ```json
  { "message": "Image file is required", "error": "Bad Request", "statusCode": 400 }
  ```
- Wrong file type (e.g. a `.txt` or `.pdf`) → `400`:
  ```json
  { "message": "Only jpeg, png, or webp images are allowed", "error": "Bad Request", "statusCode": 400 }
  ```
- File over 2MB → `413 Payload Too Large`.

Note: until the `NgoGuard` exists (Phase 11), this route doesn't actually
know *which* NGO's row to update — `req.user` is undefined without a JWT
guard populating it. The row-update only becomes meaningful once you're
sending a real `Authorization: Bearer <token>` header and the guard is
wired in.

---

## ⬜ Auth routes (build per `NGO_TASKS.md` Phase 4)

### `POST /ngo/signup`
**Postman**: `POST`, body → `raw` → `JSON`:
```json
{
  "email": "myngo@example.com",
  "password": "Secret@123",
  "orgName": "Relief Corps",
  "regNumber": "REG-2026-001",
  "phone": "8801712345678",
  "city": "Dhaka"
}
```
**Expected** — `201`, an OTP is emailed to `MAIL_USER`'s test inbox (or the
address you signed up with, depending on your mailer setup):
```json
{ "message": "Signup successful, OTP sent to your email" }
```
Duplicate email → `409 Conflict`.

### `POST /ngo/verify-otp`
```json
{ "email": "myngo@example.com", "code": "482913" }
```
**Expected** — `200`:
```json
{ "message": "Account verified successfully" }
```
Expired/wrong code → `400 Bad Request`.

### `POST /ngo/login`
```json
{ "email": "myngo@example.com", "password": "Secret@123" }
```
**Expected** — `200`, OTP emailed again:
```json
{ "message": "OTP sent to your email" }
```
Wrong password or unverified account → `401 Unauthorized`.

### `POST /ngo/verify-login-otp`
```json
{ "email": "myngo@example.com", "code": "119284" }
```
**Expected** — `200`:
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
Copy `accessToken` into the `Authorization: Bearer <token>` header for every
route below.

---

## ⬜ Profile

### `GET /ngo/profile`
**Postman**: `GET`, `Authorization: Bearer <token>`.
**Expected** — `200`:
```json
{
  "id": 1,
  "orgName": "Relief Corps",
  "regNumber": "REG-2026-001",
  "fullName": null,
  "phone": "8801712345678",
  "city": "Dhaka",
  "isActive": true,
  "profileImage": "/uploads/ngo/1784277529778-776371457.png"
}
```

### `PUT /ngo/profile`
Body: full replacement of the editable fields (`orgName`, `regNumber`,
`fullName`, `phone`, `city`). **Expected** — `200` with the updated row.

### `PATCH /ngo/profile/active`
```json
{ "isActive": false }
```
**Expected** — `200` with just `{ "isActive": false }` reflected.

---

## ⬜ Crisis browsing + participation

### `GET /ngo/crisis?status=ACTIVE&city=Dhaka`
**Expected** — `200`, array of crises matching the filters (omit query
params to get all):
```json
[
  { "id": 1, "title": "Flood in Dhaka", "severity": "HIGH", "status": "ACTIVE", "city": "Dhaka", "category": "Flood" }
]
```

### `POST /ngo/crisis/1/join`
No body. **Expected** — `200`:
```json
{ "message": "Joined crisis successfully" }
```
Joining a crisis you're already part of → `409 Conflict`. Joining a
non-existent crisis id → `404 Not Found`.

### `DELETE /ngo/crisis/1/leave`
**Expected** — `200`: `{ "message": "Left crisis successfully" }`.

### `GET /ngo/my-crises`
**Expected** — `200`, your NGO row with `crises` populated:
```json
{ "id": 1, "orgName": "Relief Corps", "crises": [{ "id": 1, "title": "Flood in Dhaka" }] }
```

---

## ⬜ Volunteer calls

### `POST /ngo/volunteer-call`
```json
{
  "title": "Flood relief volunteers needed",
  "description": "Distributing dry food and setting up shelters",
  "slots": 20,
  "city": "Dhaka",
  "crisisId": 1
}
```
**Expected** — `201`, the created row with `status: "OPEN"` (default).

### `GET /ngo/volunteer-call?status=OPEN&crisisId=1`
**Expected** — `200`, array of matching calls.

### `PUT /ngo/volunteer-call/5`, `PATCH /ngo/volunteer-call/5/status`,
`DELETE /ngo/volunteer-call/5` — standard update/status-flip/delete,
`404` if the id doesn't belong to your NGO.

---

## ⬜ Donation calls

### `POST /ngo/donation-call`
```json
{
  "title": "Flood relief fund",
  "description": "Covers food, shelter, and medical supplies",
  "targetAmount": "50000.00",
  "crisisId": 1
}
```
**Expected** — `201`, created row with `status: "OPEN"`,
`raisedAmount: "0.00"` (defaults).

### `GET /ngo/donation-call?status=OPEN&crisisId=1`, `PATCH .../status` —
same shape as volunteer calls above.

---

## ⬜ Applicants, approval, assignments

### `GET /ngo/volunteer-call/5/applicants?status=PENDING`
**Expected** — `200`, array of applications with volunteer + skills loaded:
```json
[
  {
    "id": 3,
    "status": "PENDING",
    "message": "I have first-aid experience",
    "volunteer": { "id": 2, "fullName": "Ayesha Rahman", "skills": [{ "name": "first aid" }] }
  }
]
```

### `POST /ngo/application/3/approve`
**Expected** — `200`, creates an `assignment`, flips application to
`APPROVED`, emails the volunteer:
```json
{ "message": "Application approved", "assignment": { "id": 1, "status": "ACTIVE" } }
```

### `PATCH /ngo/application/3/reject` — `200`, flips to `REJECTED`.

### `GET /ngo/assignment?status=ACTIVE&volunteerCallId=5`
**Expected** — `200`, array of assignments matching the filters.

### `PATCH /ngo/assignment/1/complete` — `200`, flips to `COMPLETED`.
