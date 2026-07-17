# Admin API — Postman Testing Guide

Base URL: `http://localhost:3000/admin`

Legend: **✅ Implemented** — test it now. **⬜ Planned** — build it per
`ADMIN_TASKS.md`, then use this doc as the target contract for what it
should return.

Once your Guard exists (Phase 11), every route below except signup/login
needs a header:
```
Authorization: Bearer <token from /admin/verify-login-otp>
```

## Route summary

| Status | Verb | Route | Filters |
|---|---|---|---|
| ✅ | GET | `/admin` | — |
| ⬜ | POST | `/admin/profile/image` | — (Task 0 — build this first) |
| ⬜ | POST | `/admin/signup` | — |
| ⬜ | POST | `/admin/verify-otp` | — |
| ⬜ | POST | `/admin/login` | — |
| ⬜ | POST | `/admin/verify-login-otp` | — |
| ⬜ | GET | `/admin/profile` | — |
| ⬜ | PUT | `/admin/profile` | — |
| ⬜ | PATCH | `/admin/profile/status` | — |
| ⬜ | GET | `/admin/users` | `?role=&isActive=&city=&search=` |
| ⬜ | PATCH | `/admin/users/:id/deactivate` | — |
| ⬜ | POST | `/admin/crisis` | — |
| ⬜ | GET | `/admin/crisis` | `?status=&severity=&category=&city=` |
| ⬜ | GET | `/admin/crisis/:id` | — |
| ⬜ | PUT | `/admin/crisis/:id` | — |
| ⬜ | PATCH | `/admin/crisis/:id/status` | — |
| ⬜ | DELETE | `/admin/crisis/:id` | — |
| ⬜ | POST | `/admin/announcement` | — |
| ⬜ | GET | `/admin/announcement/:id` | — |
| ⬜ | DELETE | `/admin/announcement/:id/recipient/:userId` | — |

---

## ✅ `GET /admin`

**Postman**: Method `GET`, URL `http://localhost:3000/admin`. No headers, no
body.

**Expected output** — `200 OK`, plain text:
```
Admin module is working
```

---

## ⬜ `POST /admin/profile/image` (Task 0)

Once built (copy NGO's exact pattern — see `ADMIN_TASKS.md` Task 0):

**Postman**:
- Method `POST`, URL `http://localhost:3000/admin/profile/image`
- Body tab → `form-data`
- Key `image`, type switched to "File", pick a `.jpg`/`.png`/`.webp` under
  2MB.

**Expected output** — `200 OK`:
```json
{
  "message": "Profile image uploaded successfully",
  "profileImage": "/uploads/admin/1784277529778-776371457.png"
}
```
Reachable afterward at `http://localhost:3000<profileImage>`.

**Error cases** — missing file → `400 { "message": "Image file is required" }`;
wrong mimetype → `400 { "message": "Only jpeg, png, or webp images are allowed" }`;
over 2MB → `413`.

---

## ⬜ Auth routes (build per `ADMIN_TASKS.md` Phase 4)

### `POST /admin/signup`
```json
{
  "email": "myadmin@example.com",
  "password": "Secret@123",
  "fullName": "Alice Johnson",
  "phone": "8801712345678",
  "city": "Dhaka",
  "age": 29
}
```
**Expected** — `201`, OTP emailed:
```json
{ "message": "Signup successful, OTP sent to your email" }
```
Duplicate email → `409 Conflict`.

### `POST /admin/verify-otp`
```json
{ "email": "myadmin@example.com", "code": "482913" }
```
**Expected** — `200`: `{ "message": "Account verified successfully" }`.
Expired/wrong code → `400`.

### `POST /admin/login`
```json
{ "email": "myadmin@example.com", "password": "Secret@123" }
```
**Expected** — `200`, OTP emailed: `{ "message": "OTP sent to your email" }`.
Wrong password/unverified → `401`.

### `POST /admin/verify-login-otp`
```json
{ "email": "myadmin@example.com", "code": "119284" }
```
**Expected** — `200`:
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
Use this in `Authorization: Bearer <token>` for every route below.

---

## ⬜ Profile

### `GET /admin/profile`
**Expected** — `200`:
```json
{
  "id": 1,
  "fullName": "Alice Johnson",
  "phone": "8801712345678",
  "city": "Dhaka",
  "age": 29,
  "status": "ACTIVE",
  "profileImage": "/uploads/admin/1784277529778-776371457.png"
}
```

### `PUT /admin/profile` — full replacement of `fullName`, `phone`, `city`,
`age`. **Expected** — `200` with the updated row.

### `PATCH /admin/profile/status`
```json
{ "status": "ON_LEAVE" }
```
**Expected** — `200` reflecting the new `status`. Invalid enum value → `400`.

---

## ⬜ User management

### `GET /admin/users?role=NGO&isActive=true&city=Dhaka&search=relief`
**Expected** — `200`, array of matching `user` rows:
```json
[
  { "id": 4, "email": "myngo@example.com", "role": "NGO", "isActive": true, "isVerified": true }
]
```
Omit any query param to skip that filter.

### `PATCH /admin/users/4/deactivate`
No body. **Expected** — `200`:
```json
{ "message": "User deactivated", "id": 4, "isActive": false }
```
Non-numeric id → `400` (`ParseIntPipe`). Non-existent id → `404`.

---

## ⬜ Crisis

### `POST /admin/crisis`
```json
{
  "title": "Flood in Dhaka",
  "description": "Heavy rainfall causing severe flooding in low-lying areas",
  "category": "Flood",
  "severity": "HIGH",
  "city": "Dhaka"
}
```
**Expected** — `201`, created row with `status: "ACTIVE"` (default):
```json
{ "id": 1, "title": "Flood in Dhaka", "severity": "HIGH", "status": "ACTIVE", "city": "Dhaka" }
```
**This is the route the rest of the team is blocked on — build and verify
it first.**

### `GET /admin/crisis?status=ACTIVE&severity=HIGH&category=Flood&city=Dhaka`
**Expected** — `200`, array of matching crises.

### `GET /admin/crisis/1`
**Expected** — `200`, with `relations: ['declaredByAdmin', 'ngos']`:
```json
{
  "id": 1,
  "title": "Flood in Dhaka",
  "declaredByAdmin": { "id": 1, "fullName": "Alice Johnson" },
  "ngos": [{ "id": 4, "orgName": "Relief Corps" }]
}
```

### `PUT /admin/crisis/1`, `PATCH /admin/crisis/1/status`,
`DELETE /admin/crisis/1` — standard update/status-flip/delete, `404` if the
id doesn't exist.

---

## ⬜ Announcements

### `POST /admin/announcement`
```json
{
  "title": "Urgent: Shelter capacity update",
  "body": "All shelters in Dhaka are now at capacity, redirecting to Chittagong.",
  "isUrgent": true,
  "recipientUserIds": [1, 2, 3, 4]
}
```
**Expected** — `201`, created row; if `isUrgent: true`, every recipient in
`recipientUserIds` gets an email:
```json
{ "id": 1, "title": "Urgent: Shelter capacity update", "isUrgent": true }
```

### `GET /admin/announcement/1`
**Expected** — `200`, with `relations: ['recipients']`:
```json
{ "id": 1, "title": "...", "recipients": [{ "id": 1, "email": "a@x.com" }, ...] }
```

### `DELETE /admin/announcement/1/recipient/2`
**Expected** — `200`: `{ "message": "Recipient removed" }`. Removing a
recipient not on the announcement → `404`.
