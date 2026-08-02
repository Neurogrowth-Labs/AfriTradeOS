# AfriTradeOS — Remediation Summary

**Target:** https://afritradeos.co.za  
**Last updated:** May 2026

Status legend: **Done (local)** = implemented in repo · **Live** = confirmed on production · **Pending** = not done yet

---

## Summary table

| Category                               | Done (local) | Live on production | Still required                                     |
| -------------------------------------- | :----------: | :----------------: | -------------------------------------------------- |
| Command injection fix (`/api/search`)  |     Yes      |        Yes         | Commit, push, redeploy; re-test curl               |
| Auth rate limiting (`/api/auth/login`) |     Yes      |        Yes         | Commit, push, redeploy; Supabase Auth settings     |
| UI / typography (#24)                  |     Yes      |        Yes         | —                                                  |
| SSRF (`url` / `redirect` / `src`)      |   Reviewed   |        N/A         | Only if a server-side fetch API is added           |
| Supabase / secrets in bundle           |   Reviewed   |         —          | Remove hardcoded fallbacks, rotate keys, audit RLS |

---

## P0 — Command injection (`q` / `search`)

| Item                                                                     | Status         | Notes                                                                                       |
| ------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------- |
| Root-cause analysis (no shell in repo; SPA served `/api/search` as HTML) | Done (local)   | Prod curl: ~0.12s both cases, HTML `200` — no ~5s delay; RCE not reproduced on current prod |
| `lib/validateSearchQuery.ts`                                             | Done (local)   | Allowlist + block `;`, `` ` ``, `sleep`, etc.                                               |
| `api/search.ts` (JSON only, no shell)                                    | Done (local)   | Not deployed — was untracked                                                                |
| `middleware.ts` guard for `/api/search`                                  | Done (local)   | Not deployed                                                                                |
| `vercel.json` — `/api/*` not rewritten to SPA                            | Done (local)   | Needs commit + push                                                                         |
| Production curl verification                                             | Done (testing) | Both requests return SPA HTML                                                               |
| Commit, push, Vercel redeploy                                            | Pending        | Required for production fix                                                                 |
| WAF / proxy metacharacter rules                                          | Pending        | Optional extra layer                                                                        |

---

## P1 — SSRF (`url` / `redirect` / `src`)

| Item                                               | Status       | Notes                                             |
| -------------------------------------------------- | ------------ | ------------------------------------------------- |
| Codebase review for server-side fetch of user URLs | Done (local) | SPA + Supabase; no SSRF vector found in this repo |
| Allowlist / block RFC-1918 and `169.254.x.x`       | Pending      | N/A unless a backend proxy is added               |

---

## P1 — Auth rate limiting

| Item                                                         | Status       | Notes                                                  |
| ------------------------------------------------------------ | ------------ | ------------------------------------------------------ |
| Pen test review (`POST /api/auth/login` → `405`)             | Done (local) | Real login uses Supabase from the client               |
| Turnstile CAPTCHA (login / signup / forgot password)         | Done (local) | `Onboarding.tsx`, `TurnstileCaptcha.tsx`               |
| Client lockout (5 failures → 15 min)                         | Done (local) | `lib/loginRateLimitClient.ts`                          |
| `POST /api/auth/login` + IP/email rate limits                | Done (local) | `api/auth/login.ts`, `lib/rateLimit.ts` — not deployed |
| Middleware on `POST /api/auth/login`                         | Done (local) | `middleware.ts` — not deployed                         |
| Login via `/api/auth/login` (prod); dev fallback to Supabase | Done (local) |                                                        |
| Supabase Dashboard: CAPTCHA + auth rate limits               | Pending      | Platform configuration                                 |
| Commit, push, deploy                                         | Pending      | Same as P0 API files                                   |

---

## P2 — SPA route & file exposure

| Item                                   | Status       | Notes                     |
| -------------------------------------- | ------------ | ------------------------- |
| `vercel.json` routing (`/api` vs SPA)  | Done (local) | Not deployed              |
| `404`/`403` for invalid `/api/*` paths | Partial      | Improves after API deploy |
| Proxy / WAF hardening                  | Pending      | Vercel or edge config     |

---

## P2 — Supabase / frontend secret exposure

| Item                                                      | Status       | Notes                                         |
| --------------------------------------------------------- | ------------ | --------------------------------------------- |
| Hardcoded fallbacks in `services/supabase.ts`             | Done (local) | Analysis only                                 |
| AI key bundle risk (`geminiService.ts`, `vite.config.ts`) | Done (local) | Analysis only                                 |
| Remove hardcoded keys; env-only builds                    | Pending      |                                               |
| Rotate exposed keys                                       | Pending      |                                               |
| Move sensitive calls server-side                          | Partial      | Login API started; Supabase still client-side |

---

## #23 — Onboarding bypass

| Item                                                        | Status       | Notes                                 |
| ----------------------------------------------------------- | ------------ | ------------------------------------- |
| Root cause documented                                       | Done (local) | “Profile exists” treated as onboarded |
| `onboarding_completed` / `onboarding_step` (types + schema) | Done (local) |                                       |
| `services/onboardingService.ts`                             | Done (local) |                                       |
| `App.tsx` route guards and redirects                        | Done (local) |                                       |
| `Onboarding.tsx` — step persistence, no login bypass        | Done (local) |                                       |
| `mockDatabase.ts` guards                                    | Done (local) |                                       |
| `supabase/onboarding_state.sql`                             | Done (local) | File ready                            |
| Run migration on production Supabase                        | Pending      |                                       |

---

## #24 — UI typography & buttons

| Item                                  | Status       | Notes                  |
| ------------------------------------- | ------------ | ---------------------- |
| Design system in `index.html`         | Done (local) | **Live** on production |
| Onboarding, app shell, footer UI pass | Done (local) | **Live** on production |

---

## Executive summary

Code fixes for **secure `/api/search`**, **auth rate limiting**, **onboarding state**, and the **UI design system** are implemented locally. Production still returns the **SPA HTML** for `/api/search` because `api/`, `middleware.ts`, and related libraries were **not committed or deployed** at the time of testing. Current curl tests **do not confirm** command injection (similar latency, HTML responses, no ~5s delay on inject).

### Deploy checklist

```bash
git add api/ middleware.ts lib/validateSearchQuery.ts lib/rateLimit.ts lib/loginRateLimitClient.ts vercel.json
git add components/Onboarding.tsx services/onboardingService.ts supabase/onboarding_state.sql
git commit -m "Security: safe /api/search, auth rate limits, onboarding enforcement"
git push
```

### Post-deploy verification

```bash
# Expect JSON, not HTML
curl -s "https://afritradeos.co.za/api/search?q=test" | head -c 200

# Expect 400 + JSON error, fast response
curl -s -w "\ncode:%{http_code} time:%{time_total}s\n" \
  "https://afritradeos.co.za/api/search?q=test%3B+sleep+5"
```
