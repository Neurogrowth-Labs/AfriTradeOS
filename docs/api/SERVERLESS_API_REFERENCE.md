# Serverless API Reference

## Overview

AfriTrade OS includes Vercel-style serverless API routes under `api/`. These routes support authentication-related server behavior and search. Shared utilities under `api/_lib/` and `lib/` support rate limiting and validation.

## Routes

### POST `/api/auth/login`

Authenticates a login request through Supabase Auth and applies server-side IP and email rate limiting.

#### Request body

```json
{
  "email": "user@example.com",
  "password": "example-password",
  "captchaToken": "captcha-token-from-client"
}
```

#### Behavior

- Accepts only `POST` requests.
- Requires `email`, `password`, and `captchaToken`.
- Applies IP-based and email-based login rate limiting.
- Calls Supabase password authentication using server-provided environment variables.
- Returns session and user data on success.
- Returns structured errors on validation, rate limit, and authentication failures.

#### Responses

| Status | Meaning                                                            |
| ------ | ------------------------------------------------------------------ |
| `200`  | Login succeeded.                                                   |
| `400`  | Missing fields, missing CAPTCHA, or Supabase authentication error. |
| `401`  | Incorrect email or password.                                       |
| `403`  | Email confirmation may be required.                                |
| `405`  | Method not allowed.                                                |
| `429`  | Too many login attempts.                                           |
| `503`  | Auth service is not configured.                                    |

#### Environment

- `VITE_SUPABASE_URL` or `SUPABASE_URL`.
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`.

### GET `/api/search`

Runs strict query validation and returns a JSON search response stub that can be extended with parameterized Supabase access.

#### Query parameters

| Parameter | Required | Description        |
| --------- | -------- | ------------------ |
| `q`       | Yes      | Search query text. |

#### Behavior

- Accepts only `GET` requests.
- Validates query text through shared search validation.
- Returns an empty results array with a message in the current implementation.
- Does not execute shell commands or interpolate raw input into SQL.

#### Responses

| Status | Meaning                   |
| ------ | ------------------------- |
| `200`  | Search succeeded.         |
| `400`  | Missing or invalid query. |
| `405`  | Method not allowed.       |
| `500`  | Unexpected server error.  |

## Shared API utilities

### `api/_lib/rateLimit.ts`

Provides serverless-friendly rate limiting. Use this for API routes that need method/IP-based throttling.

### `lib/rateLimit.ts`

Shared rate-limiting utility for application code.

### `lib/loginRateLimitClient.ts`

Login-specific rate-limit client helper. The login route currently also contains an inline in-memory limiter for IP and email buckets.

### `lib/validateSearchQuery.ts`

Validates and normalizes search query input. Search routes should reject invalid queries before executing work.

## API design rules

- Validate method before parsing behavior.
- Validate input before calling providers or database clients.
- Apply rate limiting to public or unauthenticated endpoints.
- Return consistent JSON responses.
- Do not expose provider secrets, stack traces, or raw database errors to clients.
- Use server-side environment variables for provider credentials.
- Add route-level documentation whenever new files are added under `api/`.

## Adding a new serverless route

1. Create a file under `api/` using Vercel function conventions.
2. Define allowed HTTP methods.
3. Validate request body/query parameters.
4. Apply rate limiting if public or sensitive.
5. Use Supabase or external providers through server-side credentials.
6. Return JSON responses with clear status codes.
7. Add the route to this API reference.
8. Add tests or smoke-check instructions.
