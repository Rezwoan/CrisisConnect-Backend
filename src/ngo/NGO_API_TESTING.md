# NGO API — Postman Testing Guide

Base URL: `http://localhost:3000/ngo`

Start the server first: `npm run start:dev` (make sure your `.env` is set up — see the repo README). These endpoints currently serve in-memory dummy data (not the `ngo` database table yet), so responses below are deterministic regardless of your local DB contents.

For every request in Postman: set the method + URL as shown, and for POST requests set `Body` → `raw` → `JSON`.

---

## 1. GET `/ngo/crises`

List all crises, optionally filtered by `status` and/or `city` query params.

**Request:** `GET /ngo/crises`

**Expected output (200):**
```json
[
  { "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" },
  { "id": "2", "title": "Earthquake in Chittagong", "status": "resolved", "city": "Chittagong" },
  { "id": "3", "title": "Cyclone in Cox's Bazar", "status": "active", "city": "Cox's Bazar" }
]
```

**Request:** `GET /ngo/crises?status=active`

**Expected output (200):**
```json
[
  { "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" },
  { "id": "3", "title": "Cyclone in Cox's Bazar", "status": "active", "city": "Cox's Bazar" }
]
```

**Request:** `GET /ngo/crises?status=active&city=Dhaka`

**Expected output (200):**
```json
[
  { "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" }
]
```

---

## 2. GET `/ngo/crises/:id`

**Request:** `GET /ngo/crises/1`

**Expected output (200):**
```json
{ "id": "1", "title": "Flood in Dhaka", "status": "active", "city": "Dhaka" }
```

**Request (not found):** `GET /ngo/crises/999`

**Expected output (200 — service returns an error payload, not an HTTP 404):**
```json
{ "error": "Crisis not found" }
```

---

## 3. GET `/ngo/crises/:id/tasks`

Tasks for a given crisis, optionally filtered by `status`.

**Request:** `GET /ngo/crises/1/tasks`

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

**Request:** `GET /ngo/crises/1/tasks?status=open`

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

**Request:** `GET /ngo/volunteers`

**Expected output (200):**
```json
[
  { "id": "1", "crisisId": "1", "name": "Ayesha Rahman", "skills": ["medical", "first aid"], "applicationStatus": "approved" },
  { "id": "2", "crisisId": "1", "name": "Tanvir Hasan", "skills": ["logistics", "driving"], "applicationStatus": "pending" },
  { "id": "3", "crisisId": "2", "name": "Nusrat Jahan", "skills": ["translation", "field support"], "applicationStatus": "approved" }
]
```

**Request:** `GET /ngo/volunteers?crisisId=1`

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

**Request:** `POST /ngo/insertngo`

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

**Request (invalid — name has digits, weak password, bad date, bad URL):**

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

**Request (empty body `{}`):**

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

## Quick Postman collection setup

1. Create a collection called `CrisisConnect - NGO`.
2. Add a collection variable `baseUrl` = `http://localhost:3000/ngo`.
3. Add the 5 requests above using `{{baseUrl}}/...` as the URL.
4. For the POST request, save both a "valid" and an "invalid" saved example so you can quickly re-run either case.
