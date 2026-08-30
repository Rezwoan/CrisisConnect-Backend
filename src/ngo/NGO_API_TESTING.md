# NGO API — Postman Demo Guide

A start-to-finish walkthrough of the NGO role (User Category 2). Follow the
chapters in order and you will have demonstrated every route, every
relationship type, and every error code without repeating yourself.

**Base URL:** `http://localhost:3000/ngo`

---

## Contents

| Ch. | Topic | Routes shown |
|---|---|---|
| [0](#chapter-0--before-you-start) | Before you start | — |
| [1](#chapter-1--sign-up-a-new-ngo) | Sign up a new NGO | `signup`, `verify-otp`, `resend-otp` |
| [2](#chapter-2--log-in-and-get-the-token) | Log in and get the token | `login`, `verify-login-otp` |
| [3](#chapter-3--prove-the-guard-works) | Prove the guard works | (all guarded routes) |
| [4](#chapter-4--the-profile) | The profile | `GET/PUT profile`, `profile/active`, `profile/image` |
| [5](#chapter-5--crises-and-joining-them-mn) | Crises + joining (M:N) | `crisis`, `join`, `leave`, `my-crises` |
| [6](#chapter-6--volunteer-calls-1n) | Volunteer calls (1:N) | 5 volunteer-call routes |
| [7](#chapter-7--donation-calls-1n) | Donation calls (1:N) | 3 donation-call routes |
| [8](#chapter-8--applicants-approval-and-assignments-11) | Approvals (1:1) | applicants, approve, reject, assignment |
| [9](#chapter-9--error-handling-showcase) | Error handling showcase | every exception type |
| [10](#chapter-10--quick-reference) | Quick reference | all 26 routes |
| [11](#chapter-11--if-something-goes-wrong) | If something goes wrong | troubleshooting |

---

## Chapter 0 — Before you start

### 0.1 Start the database and the server

1. Make sure PostgreSQL is running and the `CrisisConnect` database exists.
2. In a terminal **inside the project folder** (this matters — `.env` is read
   relative to the working directory):

```bash
cd E:\CrisisConnect-Backend
npm run start:dev
```

3. Wait for `Nest application successfully started`. You will see 26 lines
   like `Mapped {/ngo/signup, POST} route` — that list is itself worth showing.

### 0.2 Set up Postman once

Create an **Environment** (top-right gear icon → Add) called `CrisisConnect`
with two variables:

| Variable | Initial value |
|---|---|
| `baseUrl` | `http://localhost:3000/ngo` |
| `token` | *(leave empty — filled in Chapter 2)* |

Then use `{{baseUrl}}` in every URL and `{{token}}` in the auth header. This
saves re-pasting a long JWT in front of your teacher.

### 0.3 The two request styles you will use

**JSON body** (most routes): `Body` tab → select **raw** → set the dropdown on
the right to **JSON**.

**Auth header** (all guarded routes): `Headers` tab → add

| Key | Value |
|---|---|
| `Authorization` | `Bearer {{token}}` |

### 0.4 A note on status codes

NestJS answers **201** for every `POST` by default, and **200** for
`GET`/`PUT`/`PATCH`/`DELETE`. That default is left alone deliberately —
`@HttpCode()` is not in the decorator list taught in the course.

---

## Chapter 1 — Sign up a new NGO

> **What this demonstrates:** DTO validation, password hashing, creating two
> related rows (`user` + `ngo`), and emailing a one-time code.

### 1.1 Create the account

**`POST {{baseUrl}}/signup`** · Body → raw → JSON

```json
{
  "email": "yourname+demo1@gmail.com",
  "password": "Secret123",
  "orgName": "Relief Corps",
  "regNumber": "REG-2026-001",
  "phone": "01712345678",
  "city": "Dhaka",
  "fullName": "Rezwoan Khan"
}
```

**Expected — `201 Created`**

```json
{ "message": "Signup successful, OTP sent to your email" }
```

> **Use a real inbox you can open.** A Gmail `+tag` address like
> `yourname+demo1@gmail.com` arrives in your normal inbox, so you can show the
> live email during the demo.

**Say this:** *"The password is never stored — bcrypt hashes it with a salt.
The 6-digit code is hashed too; only the plain code goes out by email."*

**Show this:** in pgAdmin, the new row in `user` — `passwordHash` starts with
`$2b$10$`, and `isVerified` is `false`.

### 1.2 Try the same email again

**`POST {{baseUrl}}/signup`** — resend the exact same body.

**Expected — `409 Conflict`**

```json
{ "message": "Email is already registered", "error": "Conflict", "statusCode": 409 }
```

### 1.3 Send a broken body

**`POST {{baseUrl}}/signup`** with `{}` as the body.

**Expected — `400 Bad Request`**, one message per broken rule:

```json
{
  "message": [
    "email should not be empty",
    "email must be an email",
    "password must be longer than or equal to 6 characters",
    "orgName should not be empty",
    "phone must be longer than or equal to 11 characters",
    "city should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Say this:** *"That's the global ValidationPipe reading the decorators on my
CreateNgoDto. The controller never runs."*

### 1.4 Verify with the emailed code

Open the email — subject **"Your CrisisConnect verification code"**.

**`POST {{baseUrl}}/verify-otp`**

```json
{ "email": "yourname+demo1@gmail.com", "code": "482913" }
```

**Expected — `201`**

```json
{ "message": "Account verified successfully" }
```

| Problem | Result |
|---|---|
| Wrong code | `400` `"Invalid verification code"` |
| Unknown email | `404` `"User not found"` |
| Code older than 10 minutes | `400` `"Verification code has expired"` |

### 1.5 If the code expired — resend

**`POST {{baseUrl}}/resend-otp`**

```json
{ "email": "yourname+demo1@gmail.com" }
```

**Expected — `201`** — `{ "message": "A new OTP has been sent to your email" }`

**Say this:** *"Without this route an expired code would lock the account out
forever — signup returns 409 and verify-otp returns 400, with no way back.
Issuing a new code automatically retires the old one, because I only ever
check the newest unused code."*

Already-verified account → `400` `"Account is already verified"`.

---

## Chapter 2 — Log in and get the token

> **What this demonstrates:** two-factor login and JWT signing.

### 2.1 Step one — password

**`POST {{baseUrl}}/login`**

```json
{ "email": "yourname+demo1@gmail.com", "password": "Secret123" }
```

**Expected — `201`** — `{ "message": "OTP sent to your email" }`

**Say this:** *"Notice there's no token yet. The password only earns you a
second code — that's the two-factor part."*

Wrong password **and** unknown email both give the same
`401 "Invalid email or password"` — deliberate, so nobody can discover which
emails are registered. An unverified account gives
`401 "Account is not verified"`.

### 2.2 Step two — the code, for the token

**`POST {{baseUrl}}/verify-login-otp`**

```json
{ "email": "yourname+demo1@gmail.com", "code": "546214" }
```

**Expected — `201`**

```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsInJvbGUiOiJOR08iLCJpYXQiOjE3ODU0MjMxNzgsImV4cCI6MTc4NTUwOTU3OH0.5cCbsjz..." }
```

### 2.3 Save the token

Copy the value of `accessToken` into your environment's **`token`** variable.
Everything from here uses `Authorization: Bearer {{token}}`.

**Show this:** paste the token into [jwt.io](https://jwt.io) — the middle
section decodes to:

```json
{ "userId": 5, "role": "NGO", "iat": 1785423178, "exp": 1785509578 }
```

**Say this:** *"Anyone can read a JWT — it isn't encrypted. What they can't do
is change it, because the signature is made with my JWT_SECRET. If I edit
`role` to ADMIN here, verification fails and the guard returns 401."*

A LOGIN code only works on this route, and a SIGNUP code only on
`/verify-otp` — they are matched by purpose. Reusing a used code → `400`.

---

## Chapter 3 — Prove the guard works

> **What this demonstrates:** `NgoGuard`, and authentication (401) vs
> authorization (403).

Use **`GET {{baseUrl}}/profile`** four times, changing only the header.

| # | Header | Expected |
|---|---|---|
| 1 | *(no Authorization header)* | `401` `"Missing or invalid Authorization header"` |
| 2 | `Bearer abc.def.ghi` | `401` `"Invalid or expired token"` |
| 3 | A token whose `role` is `VOLUNTEER` | `403` `"This route is for NGO accounts only"` |
| 4 | `Bearer {{token}}` | `200` + your profile |

**Say this:** *"401 means I don't know who you are. 403 means I know exactly
who you are and you're still not allowed. That's the difference between
authentication and authorization."*

---

## Chapter 4 — The profile

> **What this demonstrates:** identity taken from the token, PUT vs PATCH, and
> file upload.

### 4.1 Read it

**`GET {{baseUrl}}/profile`** · header only, no body.

**Expected — `200`**

```json
{
  "id": 5,
  "orgName": "Relief Corps",
  "regNumber": "REG-2026-001",
  "fullName": "Rezwoan Khan",
  "phone": "01712345678",
  "city": "Dhaka",
  "isActive": true,
  "profileImage": null
}
```

**Say this:** *"There's no `:id` in that URL. The NGO comes from the token, so
one NGO can never read another's profile by guessing a number."*

> Note `phone` keeps its leading `0`. The column is `varchar(11)`, not
> `bigint` — a number would have silently dropped that zero.

### 4.2 Update it (PUT = full replacement)

**`PUT {{baseUrl}}/profile`**

```json
{
  "orgName": "Relief Corps International",
  "regNumber": "REG-2026-001",
  "phone": "01911223344",
  "city": "Khulna",
  "fullName": "Rezwoan Khan"
}
```

**Expected — `200`** with the updated row. `email` and `password` are not
accepted here — those are credentials, not profile fields. `fullName` may be
left out and the old value is kept.

Try `"phone": "123"` → `400`
`"phone must be longer than or equal to 11 characters"`.

### 4.3 Toggle one field (PATCH = partial)

**`PATCH {{baseUrl}}/profile/active`**

```json
{ "isActive": false }
```

**Expected — `200`** with the full row, `isActive` now `false`.
`{ "isActive": "yes" }` → `400` `"isActive must be a boolean value"`.

**Say this:** *"PUT replaces the whole set of editable fields, PATCH changes
one — that's why they're different verbs."*

### 4.4 Upload a profile picture

**`POST {{baseUrl}}/profile/image`**

- `Headers` → `Authorization: Bearer {{token}}`
- `Body` tab → **form-data** (not raw)
- Key: `image` → change its type from **Text** to **File** using the dropdown
  at the right of the key box → **Select Files** → pick a `.jpg`/`.png`/`.webp`
  under 2 MB

**Expected — `201`**

```json
{
  "message": "Profile image uploaded successfully",
  "profileImage": "/uploads/ngo/1785589333665-642565126.png"
}
```

**Show this:** open `http://localhost:3000/uploads/ngo/<that-filename>` in a
browser — the image loads, because `/uploads` is served statically.

| Error case | Result |
|---|---|
| No `image` key at all | `400` `"Image file is required"` |
| A `.txt` or `.pdf` | `400` `"Only jpeg, png, or webp images are allowed"` |
| Over 2 MB | `413 Payload Too Large` |

---

## Chapter 5 — Crises and joining them (M:N)

> **What this demonstrates:** query filters, and a many-to-many relationship
> through the `crisis_participation` join table.

### 5.1 Browse all crises

**`GET {{baseUrl}}/crisis`**

**Expected — `200`**, an array:

```json
[
  { "id": 1, "title": "Flood in Dhaka", "category": "Flood", "severity": "HIGH", "status": "ACTIVE", "city": "Dhaka", "declaredAt": "..." },
  { "id": 2, "title": "Cyclone Alert Chittagong", "category": "Cyclone", "severity": "CRITICAL", "status": "ACTIVE", "city": "Chittagong", "declaredAt": "..." },
  { "id": 3, "title": "Landslide in Sylhet", "category": "Landslide", "severity": "MEDIUM", "status": "CONTAINED", "city": "Sylhet", "declaredAt": "..." }
]
```

**Say this:** *"The `crisis` table belongs to the Admin role. I never edited
their folder — I registered their entity in my own module and read it from my
own service."*

### 5.2 The filters (demo them in this order)

In Postman use the **Params** tab; it builds the `?key=value` string for you.

| Request | Returns |
|---|---|
| `GET {{baseUrl}}/crisis?status=ACTIVE` | 2 rows |
| `GET {{baseUrl}}/crisis?city=Dhaka` | 1 row |
| `GET {{baseUrl}}/crisis?category=Cyclone` | 1 row |
| `GET {{baseUrl}}/crisis?status=ACTIVE&city=Chittagong` | 1 row (filters combine with AND) |
| `GET {{baseUrl}}/crisis?status=ACTIVE&city=Sylhet` | `[]` — no match |
| `GET {{baseUrl}}/crisis?status=NOPE` | `400` |

The bad-status response is worth showing:

```json
{ "message": ["status must be one of the following values: ACTIVE, CONTAINED, RESOLVED"], "error": "Bad Request", "statusCode": 400 }
```

**Say this:** *"Every filter is optional and they stack. If I hadn't validated
`status` against the enum, a bad value would reach Postgres and come back as a
500 instead of a clean 400."*

### 5.3 Join a crisis (M:N attach)

**`POST {{baseUrl}}/crisis/1/join`** · no body.

**Expected — `201`** — `{ "message": "Joined crisis successfully" }`

| Repeat / variation | Result |
|---|---|
| Same request again | `409` `"Already joined this crisis"` |
| `/crisis/999/join` | `404` `"Crisis not found"` |
| `/crisis/abc/join` | `400` — `ParseIntPipe` rejecting a non-number |

**Show this:** in pgAdmin, `SELECT * FROM crisis_participation;` — a row
appeared with `ngoId` and `crisisId`.

**Say this:** *"Many-to-many needs a third table. I load my NGO with its
crises, push the new one onto the array, and save — TypeORM writes the join
row for me."*

### 5.4 See what you joined

**`GET {{baseUrl}}/my-crises`**

```json
{ "id": 5, "orgName": "Relief Corps International", "...": "...",
  "crises": [{ "id": 1, "title": "Flood in Dhaka", "...": "..." }] }
```

### 5.5 Leave (M:N detach)

**`DELETE {{baseUrl}}/crisis/1/leave`** · no body.

**Expected — `200`** — `{ "message": "Left crisis successfully" }`

Call it again → `404` `"You have not joined this crisis"`.
Re-check `crisis_participation` — the row is gone.

> **Re-join crisis 1 before the next chapter**, so you have something to
> attach calls to.

---

## Chapter 6 — Volunteer calls (1:N)

> **What this demonstrates:** a one-to-many create, full CRUD, three filters,
> and ownership scoping.

### 6.1 Create one

**`POST {{baseUrl}}/volunteer-call`**

```json
{
  "title": "Flood relief volunteers needed",
  "description": "Distributing dry food and setting up shelters",
  "slots": 20,
  "city": "Dhaka",
  "crisisId": 1
}
```

**Expected — `201`** with the created row: `status` defaults to `"OPEN"`, and
the nested `ngo` and `crisis` it was attached to are included.

| Bad input | Result |
|---|---|
| `"crisisId": 999` | `404` `"Crisis not found"` |
| `"slots": 0` or `-3` | `400` `"slots must be a positive number"` |
| `"title"` over 120 characters | `400` |

Create a second one under crisis 2 with `"city": "Chittagong"`, so the filters
have something to separate.

### 6.2 List and filter

| Request | Returns |
|---|---|
| `GET {{baseUrl}}/volunteer-call` | both of your calls |
| `?status=OPEN` | both |
| `?crisisId=1` | 1 |
| `?city=Chittagong` | 1 |
| `?status=OPEN&crisisId=1&city=Dhaka` | 1 |
| `?status=NOPE` | `400` (must be `OPEN`/`CLOSED`) |
| `?crisisId=abc` | `400` — the filter only accepts digits |

**Say this:** *"This list only ever shows my own calls — the NGO comes from the
token, not the URL."*

### 6.3 Update, close, delete

**`PUT {{baseUrl}}/volunteer-call/1`**

```json
{
  "title": "Flood relief volunteers (updated)",
  "description": "Now also medical aid",
  "slots": 30,
  "city": "Dhaka"
}
```

→ `200` with the updated row. `crisisId` is not accepted — a call stays under
the crisis it was created for.

**`PATCH {{baseUrl}}/volunteer-call/1/status`** → `{ "status": "CLOSED" }` →
`200`. `{ "status": "MAYBE" }` → `400`.

**`DELETE {{baseUrl}}/volunteer-call/2`** →
`200` `{ "message": "Volunteer call deleted successfully" }`

### 6.4 Show that another NGO can't touch it

If you have a second NGO's token, repeat any of the three above with it.

**Expected — `404` `"Volunteer call not found"`** — the same answer as an id
that doesn't exist.

**Say this:** *"I return 404 rather than 403 on purpose. If I said 'forbidden'
I'd be confirming that id exists — this way nobody can probe for other
people's records."*

---

## Chapter 7 — Donation calls (1:N)

> **What this demonstrates:** the same 1:N pattern, plus how money is handled.

### 7.1 Create

**`POST {{baseUrl}}/donation-call`**

```json
{
  "title": "Flood relief fund",
  "description": "Covers food, shelter, and medical supplies",
  "targetAmount": "50000.00",
  "crisisId": 1
}
```

**Expected — `201`**, with `status: "OPEN"` and `raisedAmount: "0.00"` as
defaults.

**Say this:** *"`targetAmount` is a string on purpose. Postgres returns
`decimal` as a string, and money should never go through a floating-point
number — 0.1 + 0.2 isn't exactly 0.3."*

| Bad input | Result |
|---|---|
| `"targetAmount": "lots"` | `400` |
| `"targetAmount": "10.999"` | `400` — at most 2 decimal places |
| `"crisisId": 999` | `404` |

`raisedAmount` cannot be set here — the Donor role moves that.

### 7.2 List, filter, close

| Request | Returns |
|---|---|
| `GET {{baseUrl}}/donation-call` | your calls |
| `?status=OPEN` / `?crisisId=1` / both together | filtered |
| `PATCH {{baseUrl}}/donation-call/1/status` with `{"status":"CLOSED"}` | `200` |
| `PATCH {{baseUrl}}/donation-call/9999/status` | `404` |

---

## Chapter 8 — Applicants, approval and assignments (1:1)

> **What this demonstrates:** reading another role's table, and a one-to-one
> create.

> **Prerequisite:** a volunteer must have applied to one of your calls. The
> Volunteer role's apply route isn't built yet, so those rows were inserted
> directly for testing — say so honestly if asked.

### 8.1 See who applied

**`GET {{baseUrl}}/volunteer-call/1/applicants`**

**Expected — `200`**

```json
[
  {
    "id": 1,
    "volunteer": {
      "id": 1, "username": "ayesha_r", "fullName": "Ayesha Rahman",
      "phone": "1712000001", "city": "Dhaka", "isAvailable": true,
      "totalHours": 0, "profileImage": null,
      "skills": [{ "id": 1, "name": "first aid" }, { "id": 2, "name": "logistics" }]
    },
    "message": "I have first-aid experience",
    "status": "PENDING",
    "appliedAt": "..."
  }
]
```

Filter with `?status=PENDING` / `APPROVED` / `REJECTED`; anything else → `400`.
A call that isn't yours → `404`.

**Say this:** *"The volunteer's skills come through their own many-to-many
table. Notice I don't load the volunteer's `user` row — that holds the
password hash, and it must never appear in a response."*

### 8.2 Approve — creates the assignment (1:1)

**`POST {{baseUrl}}/application/1/approve`** · no body.

**Expected — `201`**

```json
{
  "message": "Application approved",
  "assignment": {
    "id": 1,
    "roleTitle": "Flood relief volunteers (updated)",
    "status": "ACTIVE",
    "assignedAt": "..."
  }
}
```

Three things just happened: an `assignment` row was created, the application
flipped to `APPROVED`, and the volunteer was emailed. **Show the email.**

Approve the same one again → `409`
`"This application has already been decided"`.

**Say this:** *"One application can only ever have one assignment — that's the
one-to-one. The 409 is what stops a second one being created."*

### 8.3 Reject a different one

**`PATCH {{baseUrl}}/application/2/reject`** · no body →
`200` `{ "message": "Application rejected" }`. No assignment is created.

### 8.4 Track the assignment

| Request | Returns |
|---|---|
| `GET {{baseUrl}}/assignment` | your assignments |
| `?status=ACTIVE` | filtered by status |
| `?volunteerCallId=1` | filtered by which call it came from |
| `PATCH {{baseUrl}}/assignment/1/complete` | `200`, status now `COMPLETED` |
| `PATCH {{baseUrl}}/assignment/9999/complete` | `404` |

---

## Chapter 9 — Error handling showcase

If your teacher asks "show me your error handling", these six requests cover
every code in about a minute.

| # | Request | Code | Class thrown |
|---|---|---|---|
| 1 | `POST /signup` with `{}` | **400** | `ValidationPipe` (automatic) |
| 2 | `GET /profile` with no header | **401** | `UnauthorizedException` |
| 3 | `GET /profile` with a VOLUNTEER token | **403** | `ForbiddenException` |
| 4 | `GET /volunteer-call/9999/applicants` | **404** | `NotFoundException` |
| 5 | `POST /signup` with an existing email | **409** | `ConflictException` |
| 6 | `POST /profile/image` with a 3 MB file | **413** | multer size limit |

**Say this:** *"These are all NestJS's built-in exception classes — I throw the
right class and NestJS turns it into the right HTTP status."*

---

## Chapter 10 — Quick reference

**Open (no token needed):**

| Verb | Route |
|---|---|
| POST | `/ngo/signup` |
| POST | `/ngo/verify-otp` |
| POST | `/ngo/resend-otp` |
| POST | `/ngo/login` |
| POST | `/ngo/verify-login-otp` |

**Guarded (`Authorization: Bearer <token>`):**

| Verb | Route | Filters |
|---|---|---|
| GET | `/ngo/profile` | — |
| PUT | `/ngo/profile` | — |
| PATCH | `/ngo/profile/active` | — |
| POST | `/ngo/profile/image` | — |
| GET | `/ngo/crisis` | `status`, `city`, `category` |
| POST | `/ngo/crisis/:crisisId/join` | — |
| DELETE | `/ngo/crisis/:crisisId/leave` | — |
| GET | `/ngo/my-crises` | — |
| POST | `/ngo/volunteer-call` | — |
| GET | `/ngo/volunteer-call` | `status`, `crisisId`, `city` |
| PUT | `/ngo/volunteer-call/:id` | — |
| PATCH | `/ngo/volunteer-call/:id/status` | — |
| DELETE | `/ngo/volunteer-call/:id` | — |
| POST | `/ngo/donation-call` | — |
| GET | `/ngo/donation-call` | `status`, `crisisId` |
| PATCH | `/ngo/donation-call/:id/status` | — |
| GET | `/ngo/volunteer-call/:id/applicants` | `status` |
| POST | `/ngo/application/:id/approve` | — |
| PATCH | `/ngo/application/:id/reject` | — |
| GET | `/ngo/assignment` | `status`, `volunteerCallId` |
| PATCH | `/ngo/assignment/:id/complete` | — |

**Relationships demonstrated:** 1:1 (`user`↔`ngo`, `application`↔`assignment`),
1:N (`ngo`→calls, `crisis`→calls), M:N (`ngo`↔`crisis` via
`crisis_participation`).

---

## Chapter 11 — If something goes wrong

| Symptom | Cause and fix |
|---|---|
| `EADDRINUSE: address already in use :::3000` | An old server is still running. `Get-NetTCPConnection -LocalPort 3000 -State Listen \| Select OwningProcess`, then `Stop-Process -Id <pid> -Force`. |
| `Unable to connect to the database` | Either Postgres isn't running, or you started the app from the wrong folder — `.env` is read relative to the working directory, so always run from `E:\CrisisConnect-Backend`. |
| Every guarded route returns `401` | The token expired (1 day) — log in again. Check the header is exactly `Bearer <token>`, with one space. |
| The OTP email never arrives | Check spam. Confirm `MAIL_USER`/`MAIL_PASS` in `.env` — the password must be a Gmail **app password**, not the account password. Also check you are looking at the right inbox. |
| `"Invalid verification code"` on a code you just received | You probably have two OTP emails open — only the **newest** code works; older ones are retired. |
| `400` on a filter you are sure is right | Enum filters are case-sensitive: `ACTIVE`, not `active`. |
| Changed an entity but the table didn't change | Restart the server — `synchronize: true` only applies the schema at startup. |
