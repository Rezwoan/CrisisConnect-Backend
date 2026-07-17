# Donor API — Postman Testing Guide

Base URL: `http://localhost:3000/donor`

Legend: **✅ Implemented** — test it now. **⬜ Planned** — build it per
`DONOR_TASKS.md`, then use this doc as the target contract for what it
should return.

Once your Guard exists (Phase 11), every route below except signup/login
needs a header:
```
Authorization: Bearer <token from /donor/verify-login-otp>
```

## Route summary

| Status | Verb | Route | Filters |
|---|---|---|---|
| ✅ | GET | `/donor` | — |
| ⬜ | POST | `/donor/profile/image` | — (Task 0 — build this first) |
| ⬜ | POST | `/donor/signup` | — |
| ⬜ | POST | `/donor/verify-otp` | — |
| ⬜ | POST | `/donor/login` | — |
| ⬜ | POST | `/donor/verify-login-otp` | — |
| ⬜ | GET | `/donor/profile` | — |
| ⬜ | PUT | `/donor/profile` | — |
| ⬜ | PATCH | `/donor/profile/country` | — |
| ⬜ | GET | `/donor` (list) | `?country=&city=&joinedAfter=` |
| ⬜ | GET | `/donor/crisis` | `?status=&category=&city=` |
| ⬜ | POST | `/donor/crisis/:crisisId/follow` | — |
| ⬜ | DELETE | `/donor/crisis/:crisisId/unfollow` | — |
| ⬜ | GET | `/donor/me/following` | — |
| ⬜ | GET | `/donor/donation-call` | `?status=&crisisId=` |
| ⬜ | POST | `/donor/donation` | — |
| ⬜ | POST | `/donor/donation/:id/pay` | — |
| ⬜ | GET | `/donor/donation` | `?status=&crisisId=&minAmount=` |
| ⬜ | GET | `/donor/receipt/:id` | — |
| ⬜ | DELETE | `/donor/donation/:id` | — |

Note: `GET /donor` currently returns the plain health-check string. Once you
build the "list donors" route from Part 6, both a bare `GET /donor` (list,
guarded) and the current health check can't both be a no-op string — replace
the health check's job with the list route once it exists, or move the
health check under a path that doesn't collide (your call, document
whichever you pick).

---

## ✅ `GET /donor`

**Postman**: Method `GET`, URL `http://localhost:3000/donor`. No headers, no
body.

**Expected output** — `200 OK`, plain text:
```
Donor module is working
```

---

## ⬜ `POST /donor/profile/image` (Task 0)

Once built (copy NGO's exact pattern — see `DONOR_TASKS.md` Task 0):

**Postman**:
- Method `POST`, URL `http://localhost:3000/donor/profile/image`
- Body tab → `form-data`
- Key `image`, type switched to "File", pick a `.jpg`/`.png`/`.webp` under
  2MB.

**Expected output** — `200 OK`:
```json
{
  "message": "Profile image uploaded successfully",
  "profileImage": "/uploads/donor/1784277529778-776371457.png"
}
```
Reachable afterward at `http://localhost:3000<profileImage>`.

**Error cases** — missing file → `400 { "message": "Image file is required" }`;
wrong mimetype → `400 { "message": "Only jpeg, png, or webp images are allowed" }`;
over 2MB → `413`.

---

## ⬜ Auth routes (build per `DONOR_TASKS.md` Phase 4)

### `POST /donor/signup`
```json
{
  "email": "mydonor@example.com",
  "password": "Secret@123",
  "fullName": "Diana Prince",
  "city": "Dhaka",
  "country": "Bangladesh"
}
```
**Expected** — `201`, OTP emailed. `uniqueId` is generated server-side
(`randomUUID()`), not part of the request body:
```json
{ "message": "Signup successful, OTP sent to your email" }
```
Duplicate email → `409`.

### `POST /donor/verify-otp`
```json
{ "email": "mydonor@example.com", "code": "482913" }
```
**Expected** — `200`: `{ "message": "Account verified successfully" }`.

### `POST /donor/login`
```json
{ "email": "mydonor@example.com", "password": "Secret@123" }
```
**Expected** — `200`, OTP emailed: `{ "message": "OTP sent to your email" }`.

### `POST /donor/verify-login-otp`
```json
{ "email": "mydonor@example.com", "code": "119284" }
```
**Expected** — `200`:
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
Use this in `Authorization: Bearer <token>` for every route below.

---

## ⬜ Profile

### `GET /donor/profile`
**Expected** — `200`:
```json
{
  "id": 1,
  "uniqueId": "c1b2c3d4-....-....-............",
  "fullName": "Diana Prince",
  "city": "Dhaka",
  "country": "Bangladesh",
  "joiningDate": "2026-07-17T10:00:00.000Z",
  "profileImage": "/uploads/donor/1784277529778-776371457.png"
}
```

### `PUT /donor/profile` — full replacement of `fullName`, `city`.
**Expected** — `200` with the updated row.

### `PATCH /donor/profile/country`
```json
{ "country": "United Kingdom" }
```
**Expected** — `200` reflecting the new value.

---

## ⬜ Listing + crisis following

### `GET /donor?country=Bangladesh&city=Dhaka&joinedAfter=2026-01-01`
**Expected** — `200`, array of matching donors (see the naming-collision
note above the route summary).

### `GET /donor/crisis?status=ACTIVE&category=Flood&city=Dhaka`
**Expected** — `200`, array of crises (Admin's table) matching the filters.

### `POST /donor/crisis/1/follow`
No body. **Expected** — `200`: `{ "message": "Following crisis" }`.
Following twice → `409`.

### `DELETE /donor/crisis/1/unfollow`
**Expected** — `200`: `{ "message": "Unfollowed crisis" }`.

### `GET /donor/me/following`
**Expected** — `200`, with `relations: ['followedCrises']`:
```json
{ "id": 1, "fullName": "Diana Prince", "followedCrises": [{ "id": 1, "title": "Flood in Dhaka" }] }
```

---

## ⬜ Donations + payment + receipt

### `GET /donor/donation-call?status=OPEN&crisisId=1`
**Expected** — `200`, array of donation calls (NGO's table) matching the
filters.

### `POST /donor/donation`
```json
{ "donationCallId": 2, "amount": "500.00", "message": "Stay strong, Dhaka!" }
```
**Expected** — `201`, `status: "INITIATED"`:
```json
{ "id": 1, "amount": "500.00", "status": "INITIATED" }
```

### `POST /donor/donation/1/pay`
```json
{ "cardNumber": "4111111111111111" }
```
**Expected (card doesn't end in 0) — `200`, `SUCCESS`**, and in the same
transaction: `receipt` created, `donation.status` set to `PAID`,
`donation_call.raisedAmount` incremented, receipt emailed:
```json
{
  "message": "Payment successful",
  "payment": { "id": 1, "cardLast4": "1111", "status": "SUCCESS" },
  "receipt": { "id": 1, "receiptNo": "RCPT-000001", "amount": "500.00" }
}
```
**Expected (card ends in 0) — `200`, `FAILED`**, no receipt, `donation`
stays `INITIATED`:
```json
{ "message": "Payment failed", "payment": { "id": 2, "cardLast4": "1110", "status": "FAILED" } }
```
Retrying a donation that's already `PAID` → `400 Bad Request`.

### `GET /donor/donation?status=PAID&crisisId=1&minAmount=100`
**Expected** — `200`, array of matching donations.

### `GET /donor/receipt/1`
**Expected** — `200`, with `relations: ['payment', 'payment.donation']`:
```json
{
  "id": 1,
  "receiptNo": "RCPT-000001",
  "amount": "500.00",
  "payment": { "status": "SUCCESS", "donation": { "amount": "500.00", "status": "PAID" } }
}
```

### `DELETE /donor/donation/1`
**Expected** — `200` if still `INITIATED`; `400 Bad Request` once it's
`PAID`.
