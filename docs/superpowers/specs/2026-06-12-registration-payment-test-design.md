# Registration & Payment — Preview Test Wiring, Hardening, Turnstile, Export & GDPR

**Date:** 2026-06-12 (v2, same day) · **Branch:** `preview` · **Status:** design approved by Peter, pending final spec review
**Deadline context:** registration opens publicly **2026-06-17** (Studio-managed date, fallback in `src/lib/registration.ts`).

## Goal

Make the existing registration + Stripe Checkout flow fully testable end-to-end on the preview
environment, hardened and bot-protected, with a client-facing registrations export — while
production remains physically unable to take payments or open registration early. Single client
walkthrough at the end, on the final form. GDPR obligations identified and routed (code vs.
content vs. checklist).

## Current state (verified 2026-06-12)

- Full flow already implemented on `preview`: `RegistrationForm` → `POST /api/registration`
  (validates, upserts row in Neon, creates Stripe Checkout session, stores `stripe_session_id`)
  → Stripe-hosted checkout → `/registration/success` + webhook `POST /api/webhooks/stripe`
  (signature-verified, sets `status='paid'`).
- **Stripe was never connected:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel are
  literal `"123"` placeholders, one entry spanning Development+Preview+Production (set ~April).
- One shared Neon DB across all environments (single `DATABASE_URL` entry, **eu-central-1**).
- Sanity dataset `production` is shared by prod and preview deploys → the registration-open
  date cannot be used for testing (flipping it in Studio would open prod early).
- `success_url`/`cancel_url` derive from `SITE_URL` (`src/lib/site.ts`); `NEXT_PUBLIC_URL` is
  currently `https://oetz-trophy.com` in all scopes → preview testers would be redirected to
  the production site after paying. Must be overridden in Preview scope.
- Stale branch `feature/registration-preproduction-test` (May 9, 51 commits behind) contains a
  Stripe-bypassing fake test mode + admin panel + rate limiter. **Reference material only** —
  patterns are re-implemented fresh against current code, never merged/rebased.
- Stripe account: client-owned, Peter has dashboard access. Test keys (`sk_test_…`) available.
- Cloudflare account available (client or Flowst8) for Turnstile site creation.
- Stable custom domain **`preview.oetz-trophy.com` is assigned to the `preview` branch**
  (verified via Vercel domains API 2026-06-12) — use it everywhere instead of the generated
  `…-git-preview-….vercel.app` alias.
- Vercel Authentication still returns **401 on the preview domain too** (custom domains on
  non-production branches are protected; only production domains are exempt — verified by curl
  2026-06-12). The bypass secret is therefore still required for Stripe and for testers.
- **Security audit findings in the current route** (fixed by this work): no field length
  limits; email validated only as `includes('@')`; webhook matches rows by user-supplied email
  although it has `session.id`; webhook logs email addresses to console (PII in Vercel logs);
  no rate limiting; no bot protection.

## Decisions (made during design)

1. **Approach:** environment-scoped Stripe **test mode** on Preview (real checkout, test money).
   Rejected: fake-checkout mode (tests nothing we care about), opening the Studio date early
   (opens prod), test keys in Production scope (loses the cannot-charge safety property).
2. **Database:** **shared** Neon DB — no branch/fork. Test rows are identified by
   `stripe_session_id LIKE 'cs_test_%'` and deleted before launch (Peter's call; trade-off:
   one table to clean vs. extra env plumbing).
3. **Access past the 401:** Vercel **Protection Bypass for Automation** secret — query param
   on the Stripe webhook URL, cookie-setting click-link for human testers. Protection stays on.
4. **Bot protection:** Cloudflare **Turnstile** (managed mode). Preview uses Cloudflare's
   official always-pass test key pair (widget visible, never challenges); real keys in
   Production scope only.
5. **Export:** mini admin page at `/[locale]/admin` (password login, registrations table,
   CSV download button). CSV is German-Excel-proofed: UTF-8 BOM + semicolon delimiter.
6. **Rate limiting:** in-memory per-IP token bucket (no new infrastructure). Known caveat:
   per-lambda-instance on Vercel — it is a friction layer; Turnstile is the real bot gate.
7. **Sequencing:** full package lands first, then ONE client walkthrough on the final form.
8. **GDPR basis:** registration processed under Art. 6(1)(b) contract performance — no extra
   consent checkbox. No marketing opt-in collected (conscious decision: client cannot email
   registrants for marketing unless this is added later).

## Design

### 1. Vercel env matrix (`oetz-trophy` project, team `peters-projects-2818a888`)

Split the existing all-environment placeholder entries so Preview gets real test values and
Production keeps placeholders:

| Variable | Preview (new value) | Production |
|---|---|---|
| `STRIPE_SECRET_KEY` | client's `sk_test_…` | `"123"` placeholder until launch → checkout creation fails loudly |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` of the new test endpoint | placeholder until launch |
| `REGISTRATION_TEST_MODE` | `1` | absent |
| `NEXT_PUBLIC_SITE_URL` | `https://preview.oetz-trophy.com` | absent |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` (always-pass) | real site key at launch |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` (always-pass) | real secret at launch |
| `ADMIN_PASSWORD` | test password | strong unique password at launch |
| `ADMIN_SESSION_SECRET` | random | different random at launch |
| `DATABASE_URL` | unchanged (shared) | unchanged |

Notes: the legacy `NEXT_PUBLIC_URL=https://oetz-trophy.com` stays as-is in ALL scopes — do not
delete it; production keeps using it, and on Preview the new `NEXT_PUBLIC_SITE_URL` simply wins
by precedence in `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_URL || default`).
`preview.oetz-trophy.com` is permanently assigned to the `preview` branch, so the webhook URL
and tester link never rot. Scope the Preview-environment vars to the `preview` git branch where
the Vercel UI offers it, so ad-hoc feature-branch previews don't silently become payment rigs.

### 2. Test-mode gate (code)

- `src/lib/registration.ts` — add:
  ```ts
  export function isRegistrationTestMode(): boolean
  ```
  True only when `REGISTRATION_TEST_MODE` is truthy (`1|true|yes|on`) **and**
  `process.env.VERCEL_ENV !== 'production'`. The second clause is a hard safety rail: a
  mis-scoped env var can never open production early or banner it as a test site.
- `src/app/api/registration/route.ts` — the 403 "not open yet" gate becomes
  `isRegistrationOpen(settings.registrationOpensAt) || isRegistrationTestMode()`.
- `src/app/[locale]/registration/page.tsx` — server component decides
  `isOpen` (date OR test mode) and `isTestMode`, passes both as props.
  `RegistrationForm.tsx` stops calling `isRegistrationOpen()` in client render and uses the
  props (repo hydration invariant: flip-once values are decided on the server — pattern from
  commit `19581bf` / `src/components/Hero.test.tsx`).
- **Test banner** — when `isTestMode`: high-contrast banner on the registration page and
  `/registration/success`: "TEST MODE — no real charges. Card 4242 4242 4242 4242, any future
  expiry/CVC." Strings live in `messages/de.json` + `messages/en.json` as plain keys, **not**
  Sanity-editable (must never depend on the shared dataset, and must not appear in Studio).
- **Tests** (`src/lib/registration.test.ts`): truthy parsing; production override
  (`VERCEL_ENV='production'` ⇒ always false); `isRegistrationOpen` unchanged behaviour;
  gate composition (closed date + test mode ⇒ open).

### 3. Hardening (code)

- `POST /api/registration` input validation: length caps (first/last name ≤ 100, email ≤ 254,
  nationality ≤ 100; t-shirt whitelist stays), pragmatic email regex instead of
  `includes('@')`. Overlong/invalid → 400 with the existing generic error shape.
- **Rate limiting** (`src/lib/rate-limit.ts`, fresh implementation, May branch as reference):
  per-IP token bucket, in-memory Map with periodic cleanup; IP from `x-forwarded-for`.
  Registration POST: 5 attempts / 10 min / IP → 429. Admin login: 5 / 15 min / IP.
- **Webhook** (`/api/webhooks/stripe`): match the row by `stripe_session_id = session.id`
  first (the only identifier our server minted for exactly this registration), fall back to
  email match only when no session match exists. Log **row id**, never email (PII out of
  Vercel logs). Signature verification and idempotent UPDATE stay as-is.
- `/registration/success`: audit during implementation — must not render any registration
  data derived from the unverified `session_id` query param (static thank-you is fine).
- No PII in URLs anywhere (admin/export are cookie-authed GETs without PII params).

### 4. Turnstile (code + Cloudflare dashboard)

- Create Turnstile site in the existing Cloudflare account (managed mode) → real site/secret
  keys held for Production scope at launch; Preview uses the official always-pass pair
  (key values in the matrix are from memory — verify against current Cloudflare docs during
  implementation; CF also publishes always-block and force-challenge pairs for negative tests).
- `RegistrationForm.tsx`: render the widget (locale-aware `de`/`en`), include its response
  token as `turnstileToken` in the existing JSON POST body. Small print near the widget:
  "protected by Cloudflare Turnstile" + privacy link (GDPR transparency).
- Server (`/api/registration`): verify the token against
  `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`
  **before any DB work**; failure → 400.
- **Config-symmetric switch:** both keys present → enforced; both absent → Turnstile fully
  disabled (widget not rendered, server skips verification — keeps local dev working);
  exactly one present → fail closed (500-with-log on server / widget renders but submit
  blocked). Launch checklist verifies the production pair explicitly.
- Tests: token-missing/invalid → 400; disabled mode → passthrough; mismatched config →
  fail closed.

### 5. Admin page + CSV export (code)

- `/[locale]/admin` (server component + small client form): password login →
  `POST /api/admin/login` sets an HMAC-signed session cookie (`httpOnly`, `secure`,
  `sameSite=lax`, 12 h expiry, timing-safe verification — May branch `admin-auth.ts` is the
  reference pattern, re-implemented in `src/lib/admin-auth.ts`). Logout button clears it.
- Page content: totals strip (total / paid / pending), table of registrations (id, name,
  email, nationality, t-shirt, status, created) — paid rows highlighted, **test rows
  (`cs_test_…`) visually flagged** so the client never mistakes them for athletes.
- `GET /api/admin/export` (cookie-gated): streams `registrations-YYYY-MM-DD.csv` —
  **UTF-8 BOM + semicolon delimiter** (German/Austrian Excel opens it correctly by
  double-click; umlauts survive), all registration fields + status + timestamps, proper
  quoting/escaping.
- Auth env vars per matrix; admin page works identically on preview (demo it in the
  walkthrough) and production.

### 6. GDPR (routed: code / content / checklist)

- **Code (this task):** no email in logs; Turnstile notice near widget; admin/export access
  control as above; no PII in URLs; data minimization holds (collected fields are all
  event-operationally necessary).
- **Content (Studio edit by Peter/client before launch):** update the Datenschutz page
  sections to name processing purposes and processors: **Stripe** (payment — card data never
  touches our servers, hosted checkout), **Neon** (registration DB, eu-central-1 Frankfurt),
  **Vercel** (hosting/functions), **Cloudflare** (Turnstile bot check — IP/browser signals),
  **Sanity** (site content only, no registrant PII). All offer standard DPAs.
- **Checklist (pre/post-launch):** retention default — delete or anonymize registration rows
  no later than 12 months after the event (documented manual SQL; client to confirm the
  window). Access/erasure requests served via admin page + documented SQL one-liner.
- **Conscious omission:** no marketing/newsletter opt-in is collected; the client cannot use
  registrant emails for marketing. Add an optional unticked checkbox later only if requested.

### 7. Stripe dashboard (client account, test mode)

- Create **test-mode** webhook endpoint:
  `https://preview.oetz-trophy.com/api/webhooks/stripe?x-vercel-protection-bypass=<automation-secret>`
  subscribed to `checkout.session.completed`. Copy its signing secret → Preview
  `STRIPE_WEBHOOK_SECRET`. (Stripe cannot send custom headers; Vercel accepts the bypass
  secret as a query parameter — confirm exact param behaviour against current Vercel docs
  during implementation.)
- No live-mode objects are created or touched by this task.

### 8. Tester access

- Enable **Protection Bypass for Automation** on the `oetz-trophy` project (generates the
  secret used above).
- Client/tester link (one click, sets bypass cookie for the whole staging session):
  `https://preview.oetz-trophy.com/registration?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`
- The Stripe Checkout round-trip returns to the same domain, so the cookie keeps working
  through payment → success page.
- Alternative if the bypass-param links feel clunky: exempt the preview environment from
  Vercel Authentication in Deployment Protection settings (makes `preview.oetz-trophy.com`
  plainly public until launch). Default remains protection on + bypass links.

### 9. Shared-DB hygiene (launch checklist item)

- Walkthrough rule: **fake emails only** (e.g. `test+n@flowst8.eu`). `email` is UNIQUE and the
  webhook falls back to email matching — a leftover paid test row would 409-block that
  address's real registration on launch day.
- Pre-launch cleanup (run before 2026-06-17, after testing ends):
  ```sql
  DELETE FROM registrations
  WHERE stripe_session_id LIKE 'cs_test_%'
     OR (status = 'pending' AND created_at < '2026-06-17');
  ```

### 10. Verification (definition of done)

1. `npm test` green: gate tests, Turnstile verification modes, rate-limit logic, CSV escaping.
2. On `preview.oetz-trophy.com` via bypass link: registration form open (despite date gate),
   TEST banner visible in DE and EN, Turnstile widget renders (always-pass, no challenge).
3. Submit with fake email → Stripe test checkout → pay with `4242 4242 4242 4242` →
   redirected to `https://preview.oetz-trophy.com/registration/success` (not oetz-trophy.com).
4. Stripe dashboard (test mode): webhook delivery `200`.
5. DB row: `status='paid'`, `stripe_session_id` starts `cs_test_`.
6. Rapid-fire POSTs from one IP → `429` after the limit.
7. Admin: wrong password rejected (and rate-limited); login works; table shows the test
   registration flagged as test; CSV downloads, opens correctly in German-locale Excel
   (umlauts + columns intact).
8. Webhook/server logs show row ids, no email addresses.
9. Production spot-check: prod registration page still shows "opens June 17", no banner,
   no Turnstile errors (config-symmetric: both keys absent → disabled).

Known quirk to observe (not fix) during E2E: `success_url`/`cancel_url` carry no locale
prefix — confirm the default-locale redirect lands correctly; log a follow-up if EN testers
get bounced to DE.

### 11. Go-live — executed **by June 16**, registration opens itself on the 17th

The opening is fully automatic; no midnight operations. How the flip works:

- **API gate** (`POST /api/registration`): evaluated per request against the server clock —
  opens at exactly the stored instant (default `2026-06-17T00:00 Europe/Vienna`, or whatever
  the client sets in Studio).
- **Registration page UI**: rendered per request (build route table shows all `[locale]`
  routes as dynamic — the `revalidate = 60` export is currently inert because the next-intl
  layout reads request headers), so a reload shows the open form immediately after the
  instant. Homepage Hero flips the same way (server-decided prop, `19581bf` pattern).
  Follow-up flagged: reconcile the inert ISR exports (real ISR via `setRequestLocale` vs
  removing the exports) before launch-day traffic.
- Caveat: if the client edits the open date in Studio at the last minute, allow ~1 min for
  Sanity CDN + ISR to propagate. The *flip itself* needs no content change — it's clock vs.
  stored date.

**The manual part is the Production env swap, and it is deliberately front-loaded: do it by
June 16.** Live values are inert while the date gate is closed (nobody can reach checkout
creation), so registration opens at midnight already fully armed.

**ORDERING (hard requirement):** Vercel binds env at deployment creation, and
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is additionally inlined into the client bundle at build.
Therefore: **set ALL Production env values FIRST, then merge preview→main** (the merge
triggers the production build that bakes them in). If any env value changes after that
deploy, redeploy. The config-symmetric Turnstile design means a missing prod key pair is
SILENT (widget simply absent) — so after the deploy, verify the live widget renders on
`https://oetz-trophy.com/de/registration?preview=form` (the form-preview mechanism renders
the real widget while the date gate is still closed; this is why `?preview=form` stays).

1. Live `sk_live_…` key; live-mode webhook endpoint at
   `https://oetz-trophy.com/api/webhooks/stripe` + its `whsec_…`.
2. Real Turnstile site/secret keys.
3. Strong unique `ADMIN_PASSWORD` + fresh `ADMIN_SESSION_SECRET`.
4. Run the cleanup SQL (§9) after testing ends.
5. Confirm `REGISTRATION_TEST_MODE` absent from Production.
6. Datenschutz processors + retention shipped in built-in copy (2026-06-12, commit
   `a2ac33a`); retention window (12 months) still to be confirmed by client.
6b. **Stripe customer receipts ON** (live mode → Settings → Customer emails → "Successful
   payments" + "Refunds"): the success page promises a Stripe payment receipt (commit
   `083fbbc`) — no other email is sent by the system. Branded confirmation email =
   possible post-launch follow-up.
7. **Post-swap, pre-open verification (June 16):** prod registration page still shows
   "opens June 17" (gate closed, banner-free); Stripe dashboard (live mode) shows the
   webhook endpoint enabled; admin login works on prod with the new password.

**Zero code changes.** Failure mode if the swap is skipped: registration opens on the 17th
but every checkout attempt fails on the placeholder key — hence the hard June 16 deadline
on this checklist, not the 17th.

## Implementation order

1. Payment test wiring (env split, gate, banner, Stripe test webhook) → Peter E2E-verifies.
2. Hardening (validation, rate limit, webhook session-id matching, log hygiene).
3. Turnstile (widget + server verify + config switch).
4. Admin page + CSV export.
5. GDPR content flags + launch checklist finalized.
6. Client walkthrough on the final form (test card, admin demo).

## Out of scope

Waiver/event-choice fields from the stale May branch; automated retention cron (manual SQL
documented instead); newsletter/marketing opt-in; distributed rate limiting (Upstash etc.);
`REGISTRATION_FEE_EURO` dead-var cleanup; disconnecting the duplicate `website` Vercel
project; locale-prefixed Stripe redirect URLs (observe only).
