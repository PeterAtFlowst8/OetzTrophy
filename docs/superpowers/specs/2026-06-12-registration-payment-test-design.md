# Registration & Payment Gateway — Preview-Only Test Wiring

**Date:** 2026-06-12 · **Branch:** `preview` · **Status:** approved by Peter (design), pending spec review
**Deadline context:** registration opens publicly **2026-06-17** (Studio-managed date, fallback in `src/lib/registration.ts`).

## Goal

Make the existing registration + Stripe Checkout flow fully testable end-to-end on the preview
environment — by Peter first, then a client walkthrough — while production remains physically
unable to take payments or open registration early.

## Current state (verified 2026-06-12)

- Full flow already implemented on `preview`: `RegistrationForm` → `POST /api/registration`
  (validates, upserts row in Neon, creates Stripe Checkout session, stores `stripe_session_id`)
  → Stripe-hosted checkout → `/registration/success` + webhook `POST /api/webhooks/stripe`
  (signature-verified, sets `status='paid'`).
- **Stripe was never connected:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel are
  literal `"123"` placeholders, one entry spanning Development+Preview+Production (set ~April).
- One shared Neon DB across all environments (single `DATABASE_URL` entry).
- Sanity dataset `production` is shared by prod and preview deploys → the registration-open
  date cannot be used for testing (flipping it in Studio would open prod early).
- `success_url`/`cancel_url` derive from `SITE_URL` (`src/lib/site.ts`); `NEXT_PUBLIC_URL` is
  currently `https://oetz-trophy.com` in all scopes → preview testers would be redirected to
  the production site after paying. Must be overridden in Preview scope.
- Stale branch `feature/registration-preproduction-test` (May 9, 51 commits behind) contains a
  Stripe-bypassing fake test mode + admin panel. **Reference material only** — not revived here.
- Stripe account: client-owned, Peter has dashboard access. Test keys (`sk_test_…`) available.
- Vercel preview deployments are auth-protected (401).

## Decisions (made during design)

1. **Approach:** environment-scoped Stripe **test mode** on Preview (real checkout, test money).
   Rejected: fake-checkout mode (tests nothing we care about), opening the Studio date early
   (opens prod), test keys in Production scope (loses the cannot-charge safety property).
2. **Database:** **shared** Neon DB — no branch/fork. Test rows are identified by
   `stripe_session_id LIKE 'cs_test_%'` and deleted before launch (Peter's call; trade-off:
   one table to clean vs. extra env plumbing).
3. **Access past the 401:** Vercel **Protection Bypass for Automation** secret — query param
   on the Stripe webhook URL, cookie-setting click-link for human testers. Protection stays on.

## Design

### 1. Vercel env matrix (`oetz-trophy` project, team `peters-projects-2818a888`)

Split the existing all-environment placeholder entries so Preview gets real test values and
Production keeps placeholders:

| Variable | Preview (new value) | Production (unchanged) |
|---|---|---|
| `STRIPE_SECRET_KEY` | client's `sk_test_…` | `"123"` placeholder → checkout creation fails loudly |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` of the new test endpoint | placeholder |
| `REGISTRATION_TEST_MODE` | `1` | absent |
| `NEXT_PUBLIC_SITE_URL` | `https://oetz-trophy-git-preview-peters-projects-2818a888.vercel.app` | absent |
| `DATABASE_URL` | unchanged (shared) | unchanged |

Notes: the legacy `NEXT_PUBLIC_URL=https://oetz-trophy.com` stays as-is in ALL scopes — do not
delete it; production keeps using it, and on Preview the new `NEXT_PUBLIC_SITE_URL` simply wins
by precedence in `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL || NEXT_PUBLIC_URL || default`).
The `…-git-preview-…` branch alias is stable across deploys, so webhook URL and tester
link never rot. The leftover `website` Vercel project (disconnection candidate) gets nothing.
Dead var `REGISTRATION_FEE_EURO` (code reads Studio `registrationFeeEur`, fallback
`REGISTRATION_FEE_CENTS`, default €135) is out of scope — do not propagate it.

### 2. Code changes

- `src/lib/registration.ts` — add:
  ```ts
  export function isRegistrationTestMode(): boolean
  ```
  True only when `REGISTRATION_TEST_MODE` is truthy (`1|true|yes|on`) **and**
  `process.env.VERCEL_ENV !== 'production'`. The second clause is a hard safety rail: a
  mis-scoped env var can never open production early or banner it as a test site.
- `src/app/api/registration/route.ts` — the 403 "not open yet" gate becomes
  `isRegistrationOpen(settings.registrationOpensAt) || isRegistrationTestMode()`.
  No other change to the payment path: Stripe test mode is purely a property of the key.
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

### 3. Stripe dashboard (client account, test mode)

- Create **test-mode** webhook endpoint:
  `https://oetz-trophy-git-preview-peters-projects-2818a888.vercel.app/api/webhooks/stripe?x-vercel-protection-bypass=<automation-secret>`
  subscribed to `checkout.session.completed`. Copy its signing secret → Preview
  `STRIPE_WEBHOOK_SECRET`. (Stripe cannot send custom headers; Vercel accepts the bypass
  secret as a query parameter — confirm exact param behaviour against current Vercel docs
  during implementation.)
- No live-mode objects are created or touched by this task.

### 4. Tester access

- Enable **Protection Bypass for Automation** on the `oetz-trophy` project (generates the
  secret used above).
- Client/tester link (one click, sets bypass cookie for the whole staging session):
  `https://oetz-trophy-git-preview-…vercel.app/registration?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`
- The Stripe Checkout round-trip returns to the same domain, so the cookie keeps working
  through payment → success page.

### 5. Shared-DB hygiene (launch checklist item)

- Walkthrough rule: **fake emails only** (e.g. `test+n@flowst8.eu`). `email` is UNIQUE and the
  webhook matches rows by email — a leftover paid test row would 409-block that address's real
  registration on launch day.
- Pre-launch cleanup (run before 2026-06-17, after testing ends):
  ```sql
  DELETE FROM registrations
  WHERE stripe_session_id LIKE 'cs_test_%'
     OR (status = 'pending' AND created_at < '2026-06-17');
  ```

### 6. Verification (definition of done)

1. `npm test` green, including new gate tests.
2. On the preview deployment via bypass link: registration form is open (despite date gate),
   TEST banner visible in DE and EN.
3. Submit with fake email → Stripe test checkout → pay with `4242 4242 4242 4242` →
   redirected to `/registration/success` **on the preview domain** (not oetz-trophy.com).
4. Stripe dashboard (test mode): webhook delivery `200`.
5. DB row: `status='paid'`, `stripe_session_id` starts `cs_test_`.
6. Production spot-check: prod registration page still shows "opens June 17", no banner.

Known quirk to observe (not fix) during E2E: `success_url`/`cancel_url` carry no locale
prefix — confirm the default-locale redirect lands correctly; log a follow-up if EN testers
get bounced to DE.

### 7. Go-live (June 17) — documented here, executed separately

Swap **Production** scope only: live `sk_live_…` key; live-mode webhook endpoint at
`https://oetz-trophy.com/api/webhooks/stripe` + its `whsec_…`; run the cleanup SQL; confirm
`REGISTRATION_TEST_MODE` absent from Production. Date gate opens automatically via the
Studio-managed date. **Zero code changes.**

## Out of scope

Admin panel / CSV export / rate limiting / waiver fields from the stale May branch (separate
task before launch); `REGISTRATION_FEE_EURO` cleanup; disconnecting the duplicate `website`
Vercel project; locale-prefixed Stripe redirect URLs (observe only).
