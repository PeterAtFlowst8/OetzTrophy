# Registration capacity caps + waiting list — design

**Date:** 2026-06-15
**Status:** Awaiting review
**Context:** Registration opens 2026-06-17 18:00 CEST. The client wants per-category
participant caps, an automatic waiting-list fallback when a category is full, and a
one-off cleanup of test data left over from end-to-end payment testing.

## Goal

1. Remove the leftover test registration(s) from the database safely.
2. Enforce a maximum of **130 men** and **50 women** paid participants.
3. When a category is full, the registration button becomes **"Join the waiting list"**
   and the entrant is captured (no payment) and emailed a confirmation.

## Decisions (resolved with the client)

- **Category field:** a required **race category** radio — *Herren (Men) / Damen (Women)* —
  framed as a competition class for fairness, not a gender-identity question. Stored as
  `category` = `men` | `women`. GDPR: ordinary personal data (not Art. 9 special category);
  lawful basis Art. 6(1)(b) "necessary for the contract." *Owner to confirm whether a third
  inclusive class is wanted; default Men/Women ships now and is trivially extensible.*
- **Waitlist form:** the **full registration form including consents**, minus payment.
- **Cap strictness:** **count paid registrations only.** A category is full when
  `COUNT(paid, category) >= cap`. Simplest to build/test. Accepted trade-off: during the
  opening-minute rush, a handful of people mid-checkout could pay and push a category
  slightly over its cap. The client accepted this over the added complexity of holds/reservations.
- **Caps location:** code defaults (`130`/`50`), overridable via Sanity `siteSettings`
  (`maxMen` / `maxWomen`) — same pattern as `registrationFeeEur`. Works immediately; becomes
  client-editable after a schema deploy; lets us set a tiny cap on preview to test the waitlist path.
- **Test cleanup:** an admin **"Delete test data"** button (runs with the app's own DB
  credentials), shipped first as a small independent deploy. No local DB access exists, so a
  raw one-off delete is rejected (would require copying live prod secrets to disk).

## Data model

**`registrations`** — add one column (idempotent, via existing `ensureRegistrationSchema` + `initDb`):
- `category TEXT` — `'men'` | `'women'`. Nullable for legacy/test rows; required for all new inserts at the app layer.

Test rows in `registrations` need **no** new marker: test-mode always produces a `cs_test_…`
Stripe session id, which already identifies them.

**`waitlist`** — new table:
```
id                   SERIAL PRIMARY KEY
name                 TEXT NOT NULL
first_name           TEXT
last_name            TEXT
email                TEXT NOT NULL UNIQUE
category             TEXT NOT NULL            -- 'men' | 'women'
nationality          TEXT
tshirt_size          TEXT
accepted_terms       BOOLEAN NOT NULL DEFAULT FALSE
accepted_awp_rules   BOOLEAN NOT NULL DEFAULT FALSE
confirmed_over_18    BOOLEAN NOT NULL DEFAULT FALSE
is_test              BOOLEAN NOT NULL DEFAULT FALSE   -- waitlist has no Stripe id, so it needs its own test marker
confirmation_sent_at TIMESTAMP WITH TIME ZONE
created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
`is_test` is set `TRUE` when the row is created while `isRegistrationTestMode()` is true
(i.e. on preview). On production that helper is hard-disabled, so production waitlist rows are
always `is_test = FALSE`.

## Capacity logic

New pure module `src/lib/capacity.ts`:
- `resolveCaps(settings)` → `{ men, women }` from `settings.maxMen/maxWomen ?? {130, 50}`.
- `isCategoryFull(paidCount, cap)` → `paidCount >= cap`.
- Count query (in the route / a thin db helper): `SELECT count(*)::int FROM registrations WHERE category = $1 AND status = 'paid'`.
- `getCategoryAvailability()` (db helper) → `{ men: {paid, cap, full}, women: {paid, cap, full} }`
  for the page to render the correct button per category.

## API behaviour — `POST /api/registration`

Gate order (additions in **bold**):
1. Rate limit (429)
2. Registration open? (403)
3. Parse input (400) — **now requires `category ∈ {men, women}`**
4. Turnstile (400 / 500)
5. Already-paid for this email? → 409 `already_registered`
6. **Capacity check for the submitted category:**
   - **Full → waitlist path:** upsert `waitlist` (`ON CONFLICT (email) DO UPDATE`), send the
     waitlist email once (claim via `confirmation_sent_at`), return **200 `{ waitlisted: true }`**.
     No pending registration row is created; no Stripe session.
   - **Space → existing flow:** upsert the `pending` registration row (now including `category`),
     create the Stripe Checkout session (metadata + product description include category),
     store `stripe_session_id`, return `{ url }`.

The server is authoritative: a stale "pay" button still results in a correct waitlist outcome.

## Form / UX — `RegistrationForm.tsx` + `registration/page.tsx`

- The page becomes **dynamic** (fresh availability) and passes `availability` (per-category
  `full` flags) plus the caps to the form.
- Add the required category radio.
- Button label is derived from the **selected** category + availability:
  - selected category open → "Anmelden & Bezahlen" / "Register & Pay" (unchanged)
  - selected category full → "Auf die Warteliste / Join the waiting list", payment note hidden
- Submit handler: response `{ url }` → redirect to Stripe; response `{ waitlisted: true }` →
  inline success state ("you're on the waiting list…").
- Turnstile + all consents still required in both modes (anti-spam + you chose full form).

New i18n keys (de + en): `categoryLabel`, `categoryMen`, `categoryWomen`, `joinWaitlist`,
`waitlistNote`, `waitlistSuccessTitle`, `waitlistSuccessText`, `categoryFullNote`, plus the
waitlist email copy.

## Waitlist email

New `src/lib/waitlist-email.ts` mirroring `confirmation-email.ts`:
- Bilingual (DE + EN in one message), Resend, best-effort, HTML-escaped.
- Subject: *"Auf der Warteliste / On the waiting list — OETZ TROPHY 2026"*.
- Body: confirms they're on the waiting list for their category, **no payment taken**, the
  organiser will contact them if a spot opens. Same footer/branding as the confirmation email.
- Enabled iff `RESEND_API_KEY` is set (same `isConfirmationEmailEnabled` symmetry).

## Admin — `admin/page.tsx` + new endpoint

- **Waitlist view:** a second table (id, name, email, category, created) with a count summary.
- **"Delete test data"** button → `POST /api/admin/delete-test` (auth-gated like export):
  - `DELETE FROM registrations WHERE stripe_session_id LIKE 'cs_test_%'`
  - `DELETE FROM waitlist WHERE is_test = TRUE`
  - returns counts; the page refreshes. Safe on production (real rows match neither predicate).

## Phasing

- **Phase 0 — cleanup button (ships first, independently):** `POST /api/admin/delete-test`
  (registrations `cs_test_%` only) + the admin button. Deploy → client clears today's row.
  No schema change.
- **Phase 1 — data + capacity core:** `category` column, `waitlist` table, `capacity.ts`,
  settings `maxMen/maxWomen`, extended `parseRegistrationInput`.
- **Phase 2 — route branching:** waitlist path in `POST /api/registration` + `waitlist-email.ts`.
- **Phase 3 — form/UX:** category radio, button switch, waitlist success state, i18n.
- **Phase 4 — admin:** waitlist view + extend delete-test to the waitlist table.

## Test plan (TDD)

- **Unit (vitest):**
  - `capacity.ts`: `resolveCaps` (defaults + override), `isCategoryFull` boundaries (cap-1, cap, cap+1).
  - `registrationInput.test.ts`: category required (400), invalid value (400), valid passes.
  - `route.test.ts`: category full → waitlist insert + email + **no** Stripe + `{waitlisted:true}`;
    category has space → Stripe (existing); the two categories are counted independently;
    already-paid still 409.
  - `waitlist-email.test.ts`: `buildWaitlistEmail` subject/html/text, bilingual, escaping
    (mirror `confirmation-email.test.ts`).
- **E2E (Playwright on preview):** set a cap to 1 via settings/env →
  (a) first registrant in a category pays → paid, category recorded;
  (b) second registrant → button shows "join waiting list" → submit → waitlist success + email + admin row;
  (c) the other category is unaffected;
  (d) admin "Delete test data" clears test rows.

## Non-goals (explicit)

- **No auto-promotion** from waitlist to a paid spot. The organiser promotes manually using the
  admin/CSV. (Not requested; keeps scope tight for the 2-day window.)
- No third/"diverse" race category in v1 (pending owner decision; extensible later).
- No change to the existing payment, webhook, or confirmation-email flows beyond adding `category`.

## Rollout / migration safety

- All schema changes are additive and idempotent (`ADD COLUMN IF NOT EXISTS`,
  `CREATE TABLE IF NOT EXISTS`) — safe to run against the live DB; no destructive migration.
- `maxMen/maxWomen` default in code, so the caps are active even before the client adds Studio values.
- Ship per phase to **preview**, verify, then fast-forward `preview → main` (prod) as established.

## Open items

- Owner to confirm the inclusivity stance on race categories (Men/Women vs. adding a third class).
  Does not block launch; copy/enum is trivially adjustable.
