# NGO API — Postman Testing Guide

Base URL: `http://localhost:3000/ngo`

Start the server first: `npm run start:dev` (make sure your `.env` is set up — see the repo README).

Endpoints 1–5 serve in-memory dummy data, so those responses are deterministic regardless of your local DB contents. Endpoints 6–11 are the **User Category 2** operations and hit the real `ngo` table in Postgres — ids there are generated UUIDs, so yours will differ from the examples.

For every request in Postman: set the method + URL as shown, and for POST requests set `Body` → `raw` → `JSON`.

---

## 1. GET `/ngo/crises`

List all crises, optionally filtered by `status` and/or `city` query params.

**Request:** `GET http://localhost:3000/ngo/crises`

**Expected output (200):**
```json
[
  { "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" },
  { "id": "2", "title": "Earthquake in Chittagong", "status": "resolved", "city": "Chittagong" },
  { "id": "3", "title": "Cyclone in Cox's Bazar", "status": "active", "city": "Cox's Bazar" }
]
```

**Request:** `GET http://localhost:3000/ngo/crises?status=active`

**Expected output (200):**
```json
[
  { "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" },
  { "id": "3", "title": "Cyclone in Cox's Bazar", "status": "active", "city": "Cox's Bazar" }
]
```

**Request:** `GET http://localhost:3000/ngo/crises?status=active&city=Dhaka`

**Expected output (200):**
```json
[
  { "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" }
]
```

---

## 2. GET `/ngo/crises/:id`

**Request:** `GET http://localhost:3000/ngo/crises/1`

**Expected output (200):**
```json
{ "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" }
```

**Request (not found):** `GET http://localhost:3000/ngo/crises/999`

**Expected output (200 — service returns an error payload, not an HTTP 404):**
```json
{ "error": "Crisis not found" }
```

---

## 3. GET `/ngo/crises/:id/tasks`

Tasks for a given crisis, optionally filtered by `status`.

**Request:** `GET http://localhost:3000/ngo/crises/1/tasks`

**Expected output (200):**
```json
[
  {
    "id": "1",
    "crisisId": "1",
    "title": "Distribute dry food",
    "requiredSkills": ["logistics", "field support"],
    "status": "open"
  },
  {
    "id": "2",
    "crisisId": "1",
    "title": "Set up temporary shelter",
    "requiredSkills": ["construction", "coordination"],
    "status": "in-progress"
  }
]
```

**Request:** `GET http://localhost:3000/ngo/crises/1/tasks?status=open`

**Expected output (200):**
```json
[
  {
    "id": "1",
    "crisisId": "1",
    "title": "Distribute dry food",
    "requiredSkills": ["logistics", "field support"],
    "status": "open"
  }
]
```

---

## 4. GET `/ngo/volunteers`

Volunteers, optionally filtered by `crisisId`.

**Request:** `GET http://localhost:3000/ngo/volunteers`

**Expected output (200):**
```json
[
  { "id": "1", "crisisId": "1", "name": "Ayesha Rahman", "skills": ["medical", "first aid"], "applicationStatus": "approved" },
  { "id": "2", "crisisId": "1", "name": "Tanvir Hasan", "skills": ["logistics", "driving"], "applicationStatus": "pending" },
  { "id": "3", "crisisId": "2", "name": "Nusrat Jahan", "skills": ["translation", "field support"], "applicationStatus": "approved" }
]
```

**Request:** `GET http://localhost:3000/ngo/volunteers?crisisId=1`

**Expected output (200):**
```json
[
  { "id": "1", "crisisId": "1", "name": "Ayesha Rahman", "skills": ["medical", "first aid"], "applicationStatus": "approved" },
  { "id": "2", "crisisId": "1", "name": "Tanvir Hasan", "skills": ["logistics", "driving"], "applicationStatus": "pending" }
]
```

---

## 5. POST `/ngo/insertngo`

Registers an NGO. Body is validated against `NgoDto` (`src/ngo/ngo.dto.ts`):

| Field | Rules |
| --- | --- |
| `name` | required, string, must not contain digits |
| `password` | required, string, must contain at least one of `@ # $ &` |
| `date` | required, ISO 8601 date string |
| `socialMediaLink` | required, must be a valid URL |

**Request:** `POST http://localhost:3000/ngo/insertngo`

Body:
```json
{
  "name": "Green Relief Foundation",
  "password": "Secure@123",
  "date": "2026-07-01",
  "socialMediaLink": "https://facebook.com/greenrelief"
}
```

**Expected output (201):**
```json
{
  "message": "NGO inserted successfully",
  "data": {
    "name": "Green Relief Foundation",
    "password": "Secure@123",
    "date": "2026-07-01",
    "socialMediaLink": "https://facebook.com/greenrelief"
  }
}
```

**Request (invalid — name has digits, weak password, bad date, bad URL):** `POST http://localhost:3000/ngo/insertngo`

Body:
```json
{
  "name": "NGO123",
  "password": "weakpass",
  "date": "not-a-date",
  "socialMediaLink": "not-a-url"
}
```

**Expected output (400 Bad Request):**
```json
{
  "message": [
    "Name should not contain any numbers",
    "Password must contain at least one special character (@ or # or $ or &)",
    "date must be a valid ISO 8601 date string",
    "Social media link must be a valid URL"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Request (empty body `{}`):** `POST http://localhost:3000/ngo/insertngo`

**Expected output (400 Bad Request):** one validation message per field per broken rule (both the format rule and the "should not be empty" rule fire together), e.g.:
```json
{
  "message": [
    "Name should not contain any numbers",
    "name must be a string",
    "name should not be empty",
    "Password must contain at least one special character (@ or # or $ or &)",
    "password must be a string",
    "password should not be empty",
    "date must be a valid ISO 8601 date string",
    "date should not be empty",
    "Social media link must be a valid URL",
    "socialMediaLink should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

# User Category 2 operations (real database)

These endpoints operate on the `ngo` table defined in `src/ngo/ngo.entity.ts`:

| Column | Definition |
| --- | --- |
| `id` | varchar(36) primary key, generated by `generateId()` in a `@BeforeInsert` hook (UUID) |
| `isActive` | boolean, defaults to `true` |
| `fullName` | varchar(100), nullable |
| `phone` | bigint, unsigned |

Two notes on `phone`. Postgres has no *unsigned* bigint, so the unsigned rule is enforced in the DTO with `@Min(0)` — a negative phone is rejected with a 400 before it reaches the DB. And TypeORM returns bigint values as **strings** in JavaScript to avoid precision loss, so `phone` comes back quoted (`"8801712345678"`) even though you send it as a number.

Run these in order — 6 gives you the ids that 8, 9, and 11 need, and the null-name row that 10 looks for. Endpoint 7 (`GET /ngo/users`) lists the whole table, so you can use it after any create, update, or delete to see the change land.

---

## 6. POST `/ngo/users` — Create a user

`fullName` is optional (the column is nullable); `phone` is required.

**Request:** `POST http://localhost:3000/ngo/users`

Body:
```json
{
  "fullName": "Rezwoan Ahmed",
  "phone": 8801712345678
}
```

**Expected output (201):** note that `id` and `isActive` are filled in for you.
```json
{
  "id": "c6e80b35-d5f7-427b-90ab-1bf04269c553",
  "isActive": true,
  "fullName": "Rezwoan Ahmed",
  "phone": "8801712345678"
}
```

**Request (omit `fullName` to create a null-name row — you need one of these for endpoint 10):** `POST http://localhost:3000/ngo/users`

Body:
```json
{
  "phone": 8801999888777
}
```

**Expected output (201):**
```json
{
  "id": "81167f15-f5b1-4484-933f-9b4de9157b7e",
  "isActive": true,
  "fullName": null,
  "phone": "8801999888777"
}
```

**Request (invalid — negative phone violates the unsigned rule):** `POST http://localhost:3000/ngo/users`

Body:
```json
{
  "fullName": "Bad",
  "phone": -5
}
```

**Expected output (400 Bad Request):**
```json
{
  "message": ["Phone must be unsigned (0 or greater)"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 7. GET `/ngo/users` — See all users

Lists every row in the `ngo` table. No query params. Use this to confirm what any other endpoint changed.

**Request:** `GET http://localhost:3000/ngo/users`

**Expected output (200):** whatever is in your table — for example, three seeded rows plus the two you created in endpoint 6.
```json
[
  {
    "id": "a1b2c3d4-0001-4000-8000-000000000001",
    "isActive": true,
    "fullName": "Red Crescent Sylhet",
    "phone": "8801711000001"
  },
  {
    "id": "a1b2c3d4-0003-4000-8000-000000000003",
    "isActive": false,
    "fullName": "Chittagong Aid Network",
    "phone": "8801711000003"
  },
  {
    "id": "81167f15-f5b1-4484-933f-9b4de9157b7e",
    "isActive": true,
    "fullName": null,
    "phone": "8801999888777"
  }
]
```

An empty table returns `[]` (200, not 404).

---

## 8. GET `/ngo/users/:id` — See one user

Fetch a single row by id — the quickest way to check that endpoint 9's phone update actually persisted.

**Request:** `GET http://localhost:3000/ngo/users/c6e80b35-d5f7-427b-90ab-1bf04269c553`

**Expected output (200):**
```json
{
  "id": "c6e80b35-d5f7-427b-90ab-1bf04269c553",
  "isActive": true,
  "fullName": "Rezwoan Ahmed",
  "phone": "8801712345678"
}
```

**Request (unknown id):** `GET http://localhost:3000/ngo/users/nope`

**Expected output (404 Not Found):**
```json
{
  "message": "No user found with id: nope",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 9. PUT `/ngo/users/:id/phone` — Modify the phone number

Copy the `id` from the first user you created in endpoint 6.

**Request:** `PUT http://localhost:3000/ngo/users/c6e80b35-d5f7-427b-90ab-1bf04269c553/phone`

Body:
```json
{
  "phone": 8801555000111
}
```

**Expected output (200):** the full updated row.
```json
{
  "id": "c6e80b35-d5f7-427b-90ab-1bf04269c553",
  "isActive": true,
  "fullName": "Rezwoan Ahmed",
  "phone": "8801555000111"
}
```

**Request (unknown id):** `PUT http://localhost:3000/ngo/users/00000000-0000-0000-0000-000000000000/phone` with the same body.

**Expected output (404 Not Found):**
```json
{
  "message": "No user found with id: 00000000-0000-0000-0000-000000000000",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 10. GET `/ngo/users/null-name` — Retrieve users with a null full name

Returns every row where `fullName IS NULL` (TypeORM's `IsNull()` operator). No query params.

**Request:** `GET http://localhost:3000/ngo/users/null-name`

**Expected output (200):** only the user you created without a `fullName` — the named one is excluded.
```json
[
  {
    "id": "81167f15-f5b1-4484-933f-9b4de9157b7e",
    "isActive": true,
    "fullName": null,
    "phone": "8801999888777"
  }
]
```

If no such rows exist, you get an empty array `[]` (200, not 404).

---

## 11. DELETE `/ngo/users/:id` — Remove a user by id

**Request:** `DELETE http://localhost:3000/ngo/users/c6e80b35-d5f7-427b-90ab-1bf04269c553`

**Expected output (200):**
```json
{
  "message": "User c6e80b35-d5f7-427b-90ab-1bf04269c553 removed successfully"
}
```

**Request (run the exact same DELETE a second time):** `DELETE http://localhost:3000/ngo/users/c6e80b35-d5f7-427b-90ab-1bf04269c553`

**Expected output (404 Not Found):** the row is already gone, so nothing is deleted.
```json
{
  "message": "No user found with id: c6e80b35-d5f7-427b-90ab-1bf04269c553",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Quick Postman collection setup

1. Create a collection called `CrisisConnect - NGO`.
2. Add a collection variable `baseUrl` = `http://localhost:3000/ngo`.
3. Add the 11 requests above using `{{baseUrl}}/...` as the URL.
4. For the POST requests, save both a "valid" and an "invalid" saved example so you can quickly re-run either case.
5. For endpoints 8, 9, and 11, add a collection variable `userId` and paste in the `id` returned by endpoint 6, then use `{{baseUrl}}/users/{{userId}}/phone`. That way you set the id once instead of editing two URLs.
