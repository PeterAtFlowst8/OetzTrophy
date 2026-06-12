# Registration & Payment Preview Test Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing registration + Stripe Checkout flow for end-to-end testing on the preview environment (test keys, date-gate override, TEST banner), harden it (validation, rate limiting, webhook identity, log hygiene), add Cloudflare Turnstile, and ship a password-protected admin page with German-Excel-proof CSV export — per `docs/superpowers/specs/2026-06-12-registration-payment-test-design.md`.

**Architecture:** All test/live separation lives in environment configuration (Vercel Preview vs Production scopes); the code gains a server-decided test-mode gate with a hard `VERCEL_ENV === 'production'` kill switch. New pure modules (`registrationInput`, `rate-limit`, `turnstile`, `admin-auth`, `csv`) carry the logic and are vitest-covered; routes stay thin. UI strings go into `messages/*.json` under keys deliberately ABSENT from `EDITABLE_SITE_CONTENT_KEYS` so they never become Studio fields.

**Tech Stack:** Next.js 16 App Router (note: middleware file is `src/proxy.ts`), TypeScript, vitest (node env, `@` → `src`), Stripe v22 (`src/lib/stripe.ts` lazy init), Neon serverless Postgres (`src/lib/db.ts`), next-intl, Cloudflare Turnstile, Vercel CLI (authenticated, project linked).

**Branch:** all work lands on `preview`. Repo: `/Users/iixx/Documents/01 PROJECTS/02 Clients Sites/OetzTrophy`.

**Conventions for every task:** run tests with `npm test` (vitest run). Commit after each green step with the message given in the task. Inline styles + `var(--color-*)` tokens are the repo's UI idiom — match it. Never add new message keys to `src/lib/siteContentFields.ts` (that is what keeps them out of Studio).

---

## Phase 1 — Payment test wiring

### Task 1: Test-mode gate in `src/lib/registration.ts`

**Files:**
- Modify: `src/lib/registration.ts`
- Create: `src/lib/registration.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/registration.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  isRegistrationOpen,
  isRegistrationTestMode,
  REGISTRATION_OPENS_AT_FALLBACK,
} from '@/lib/registration';

describe('isRegistrationTestMode', () => {
  it('is off by default (no env vars)', () => {
    expect(isRegistrationTestMode({})).toBe(false);
  });

  it.each(['1', 'true', 'yes', 'on', 'TRUE', 'On'])('accepts truthy value %s', (v) => {
    expect(isRegistrationTestMode({ REGISTRATION_TEST_MODE: v })).toBe(true);
  });

  it.each(['0', 'false', 'off', '', 'banana'])('rejects non-truthy value %s', (v) => {
    expect(isRegistrationTestMode({ REGISTRATION_TEST_MODE: v })).toBe(false);
  });

  it('is ALWAYS off on production deployments, even when the flag is set', () => {
    expect(
      isRegistrationTestMode({ REGISTRATION_TEST_MODE: '1', VERCEL_ENV: 'production' }),
    ).toBe(false);
  });

  it('works on preview deployments', () => {
    expect(
      isRegistrationTestMode({ REGISTRATION_TEST_MODE: '1', VERCEL_ENV: 'preview' }),
    ).toBe(true);
  });
});

describe('isRegistrationOpen (unchanged behaviour)', () => {
  it('is closed before the fallback date', () => {
    expect(isRegistrationOpen(null, new Date('2026-06-16T00:00:00+02:00'))).toBe(false);
  });

  it('opens at the stored instant', () => {
    expect(isRegistrationOpen(null, new Date(REGISTRATION_OPENS_AT_FALLBACK))).toBe(true);
  });

  it('respects a Studio-managed date', () => {
    expect(
      isRegistrationOpen('2026-06-10T00:00:00+02:00', new Date('2026-06-12T00:00:00+02:00')),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/registration.test.ts`
Expected: FAIL — `isRegistrationTestMode` is not exported.

- [ ] **Step 3: Implement `isRegistrationTestMode`**

In `src/lib/registration.ts`, add below the existing exports:

```ts
const TEST_MODE_TRUTHY = new Set(['1', 'true', 'yes', 'on']);

/**
 * Preview-only override that opens registration for end-to-end payment
 * testing (spec: docs/superpowers/specs/2026-06-12-registration-payment-test-design.md).
 *
 * Hard-disabled on production deployments regardless of the env var, so a
 * mis-scoped variable can never open the live site early or banner it as a
 * test site. `env` is injectable for tests; defaults to process.env.
 */
export function isRegistrationTestMode(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if ((env.VERCEL_ENV ?? '').toLowerCase() === 'production') return false;
  return TEST_MODE_TRUTHY.has((env.REGISTRATION_TEST_MODE ?? '').toLowerCase());
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/lib/registration.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Run the full suite (guards against drift-guard surprises)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/registration.ts src/lib/registration.test.ts
git commit -m "feat: preview-only registration test-mode gate with production kill switch"
```

### Task 2: API route honours the test-mode gate

**Files:**
- Modify: `src/app/api/registration/route.ts:3` (import) and the open-gate block

- [ ] **Step 1: Update the import**

```ts
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';
```

- [ ] **Step 2: Compose the gate**

Replace:

```ts
    if (!isRegistrationOpen(settings.registrationOpensAt)) {
```

with:

```ts
    if (!isRegistrationOpen(settings.registrationOpensAt) && !isRegistrationTestMode()) {
```

- [ ] **Step 3: Type-check and test**

Run: `npx tsc --noEmit && npm test`
Expected: clean / PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/registration/route.ts
git commit -m "feat: registration API accepts submissions in preview test mode"
```

### Task 3: Banner strings in messages (Studio-invisible)

**Files:**
- Modify: `messages/en.json` (inside the existing `"registration"` object)
- Modify: `messages/de.json` (same place)
- Do NOT touch: `src/lib/siteContentFields.ts` (absence from the allowlist is what keeps these out of Studio)

- [ ] **Step 1: Add English strings**

Inside the `"registration": { … }` object of `messages/en.json`, add:

```json
"testBannerTitle": "Test mode — no real charges",
"testBannerBody": "This is the staging site. Pay with Stripe test card 4242 4242 4242 4242, any future expiry date and any 3-digit CVC. Registrations made here are test data and will be deleted before launch.",
"turnstileNotice": "This form is protected by Cloudflare Turnstile.",
"turnstileFailed": "Verification failed — please try again."
```

- [ ] **Step 2: Add German strings**

Inside the `"registration": { … }` object of `messages/de.json`, add:

```json
"testBannerTitle": "Testmodus — keine echten Zahlungen",
"testBannerBody": "Dies ist die Staging-Website. Zahle mit der Stripe-Testkarte 4242 4242 4242 4242, einem beliebigen zukünftigen Ablaufdatum und einem beliebigen 3-stelligen CVC. Anmeldungen hier sind Testdaten und werden vor dem Start gelöscht.",
"turnstileNotice": "Dieses Formular ist durch Cloudflare Turnstile geschützt.",
"turnstileFailed": "Verifizierung fehlgeschlagen — bitte versuche es erneut."
```

- [ ] **Step 3: Verify the Studio schema does NOT pick them up**

Run: `npm test && npx tsc --noEmit`
Expected: PASS — in particular no drift-guard throw from `src/sanity/schemaTypes/pageContent.ts` (it would throw at module load if a generated field weren't assigned to a page document; these keys generate nothing because they're not in `EDITABLE_SITE_CONTENT_KEYS.registration`).

Then confirm explicitly:

```bash
grep -c "testBannerTitle" src/lib/siteContentFields.ts || echo "OK: not in allowlist"
```

Expected: `OK: not in allowlist` (grep finds 0).

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/de.json
git commit -m "feat: test-mode banner and Turnstile strings (DE/EN, Studio-invisible)"
```

### Task 4: Server-decided props + TEST banner on form and success page

**Files:**
- Create: `src/components/TestModeBanner.tsx`
- Modify: `src/app/[locale]/registration/page.tsx`
- Modify: `src/app/[locale]/registration/RegistrationForm.tsx:12-26,46-64` (props + gate usage)
- Modify: `src/app/[locale]/registration/success/page.tsx`

- [ ] **Step 1: Create the banner component**

`src/components/TestModeBanner.tsx` (no hooks — usable from server and client components; strings passed in because the form uses `useTranslations` and the success page uses `getTranslations`):

```tsx
type Props = { title: string; body: string };

/** High-contrast staging banner. Rendered ONLY when the server decided
 *  isRegistrationTestMode() — never on production deployments. */
export default function TestModeBanner({ title, body }: Props) {
  return (
    <div
      role="status"
      className="px-5 py-4 mb-8"
      style={{
        backgroundColor: '#7c2d12',
        border: '2px dashed #fdba74',
        color: '#ffedd5',
        fontFamily: 'var(--font-body)',
      }}
    >
      <p
        className="uppercase mb-1"
        style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}
      >
        {title}
      </p>
      <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
```

- [ ] **Step 2: Decide state on the server page**

Replace the body of `src/app/[locale]/registration/page.tsx`:

```tsx
import RegistrationForm from './RegistrationForm';
import { getSiteSettings } from '@/lib/settings';
import { getSiteImage } from '@/lib/siteContent';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';

export const revalidate = 60;

export default async function RegistrationPage() {
  const [settings, headerImage] = await Promise.all([
    getSiteSettings(),
    getSiteImage('registration', '/images/event-boaterx.jpg', { width: 2000 }),
  ]);

  // Flip-once values are decided on the server and passed down as props
  // (hydration invariant — see Hero / commit 19581bf).
  const isTestMode = isRegistrationTestMode();
  const isOpen = isRegistrationOpen(settings.registrationOpensAt) || isTestMode;

  return (
    <RegistrationForm
      headerImage={headerImage}
      registrationOpensAt={settings.registrationOpensAt}
      registrationFeeEur={settings.registrationFeeEur}
      isOpen={isOpen}
      isTestMode={isTestMode}
    />
  );
}
```

- [ ] **Step 3: Use the props in the form**

In `src/app/[locale]/registration/RegistrationForm.tsx`:

1. Extend `Props` and the destructuring:

```ts
type Props = {
  headerImage: string;
  registrationOpensAt: string | null;
  registrationFeeEur: number | null;
  isOpen: boolean;
  isTestMode: boolean;
};

export default function RegistrationForm({
  headerImage,
  registrationOpensAt,
  registrationFeeEur,
  isOpen,
  isTestMode,
}: Props) {
```

2. Delete the line `const isOpen = isRegistrationOpen(registrationOpensAt);` and remove `isRegistrationOpen` from the import (keep `registrationOpensLabel` — still used for `opensLabel`).

3. Directly inside the `<form …>` element, before the `formTitle` heading block, render the banner:

```tsx
{isTestMode && (
  <TestModeBanner title={t('testBannerTitle')} body={t('testBannerBody')} />
)}
```

with import `import TestModeBanner from '@/components/TestModeBanner';`.

- [ ] **Step 4: Banner on the success page**

In `src/app/[locale]/registration/success/page.tsx`, import and decide on the server:

```tsx
import TestModeBanner from '@/components/TestModeBanner';
import { isRegistrationTestMode } from '@/lib/registration';
```

Inside the component before `return`, add `const isTestMode = isRegistrationTestMode();`, and render at the top of the inner `<div className="text-center max-w-lg">`:

```tsx
{isTestMode && (
  <TestModeBanner title={t('testBannerTitle')} body={t('testBannerBody')} />
)}
```

(Env-derived, not clock-derived: the value is baked per deployment at build/render time, identical on server and client — no hydration risk.)

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: all clean. The build proves both pages compile in App Router context.

- [ ] **Step 6: Commit**

```bash
git add src/components/TestModeBanner.tsx "src/app/[locale]/registration/page.tsx" "src/app/[locale]/registration/RegistrationForm.tsx" "src/app/[locale]/registration/success/page.tsx"
git commit -m "feat: server-decided registration open state + staging TEST banner"
```

### Task 5: Vercel env wiring (agent-doable, non-secret parts)

**Files:** none (Vercel project config). CLI is authenticated and linked (`.vercel/project.json` → `oetz-trophy`).

- [ ] **Step 1: Confirm current CLI syntax for env scoping**

Run: `npx -y vercel@latest env --help`
Confirm the forms `vercel env add <name> <environment> [gitbranch]` and `vercel env rm <name> <environment> [gitbranch]` and adjust the commands below if the CLI has changed.

- [ ] **Step 2: Add the preview-scoped non-secret vars (branch `preview`)**

```bash
cd "/Users/iixx/Documents/01 PROJECTS/02 Clients Sites/OetzTrophy"
printf '1' | npx vercel env add REGISTRATION_TEST_MODE preview preview
printf 'https://preview.oetz-trophy.com' | npx vercel env add NEXT_PUBLIC_SITE_URL preview preview
```

- [ ] **Step 3: Verify scoping**

Run: `npx vercel env ls`
Expected: both new vars listed with environment `Preview (preview)`. `NEXT_PUBLIC_URL` untouched (all scopes). Production unchanged.

- [ ] **Step 4: Confirm the Vercel protection-bypass query-param mechanics**

WebFetch `https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection` and confirm: secret can be supplied as query param `x-vercel-protection-bypass`, and `x-vercel-set-bypass-cookie=true` sets the cookie for subsequent same-domain requests. Record any deviation in the PR/commit notes — Task 6 and the webhook URL depend on it.

### Task 6: Peter's dashboard steps (Stripe test keys + bypass secret) — BLOCKING CHECKPOINT

**Owner: Peter** (secrets must not transit chat). Agent: present this checklist verbatim, then WAIT.

- [ ] **Step 1 (Peter): split the Stripe placeholders out of Preview scope**

Vercel dashboard → Project `oetz-trophy` → Settings → Environment Variables:
1. Edit the existing `STRIPE_SECRET_KEY` entry: UNTICK Preview (keep Development + Production with the placeholder). Save.
2. Add new `STRIPE_SECRET_KEY`: value = `sk_test_…` from the client's Stripe dashboard (test mode → Developers → API keys), environment = Preview only (branch `preview` if offered). Save.

- [ ] **Step 2 (Peter): enable Protection Bypass for Automation**

Project → Settings → Deployment Protection → Protection Bypass for Automation → Enable → copy the generated secret. Needed for Step 3 and for the tester link.

- [ ] **Step 3 (Peter): create the test-mode webhook endpoint**

Stripe dashboard (TEST mode, toggle top-right) → Developers → Webhooks → Add endpoint:
- URL: `https://preview.oetz-trophy.com/api/webhooks/stripe?x-vercel-protection-bypass=<the-secret-from-step-2>`
- Events: `checkout.session.completed` only.
Reveal the endpoint's signing secret (`whsec_…`).

- [ ] **Step 4 (Peter): scope the webhook secret like the key**

Same dance as Step 1 for `STRIPE_WEBHOOK_SECRET`: untick Preview from the placeholder entry; add a new Preview-scoped entry with the `whsec_…` value.

- [ ] **Step 5 (Peter): say "stripe env done" in chat** — the agent resumes with Task 7.

### Task 7: Deploy and verify the payment flow end-to-end

**Files:** none (push + browser verification).

- [ ] **Step 1: Push `preview`**

```bash
git push origin preview
```

Expected: Vercel builds the preview deployment. Verify via Vercel MCP `list_deployments` that the latest preview deployment is `READY` (memory: a webhook once silently missed a push — if no deployment appears, make an empty re-trigger commit).

- [ ] **Step 2: Open the staging site through the bypass link**

Using Playwright MCP, navigate to:
`https://preview.oetz-trophy.com/registration?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`
Expected: 200 (not 401), registration form visible despite the June-17 gate, TEST banner visible. Repeat on `/en/registration` for English.

- [ ] **Step 3: Submit a test registration**

Fill the form with: first name `Test`, last name `Runner`, email `test+1@flowst8.eu`, nationality `Austria`, t-shirt `M`, all three checkboxes ticked. Submit.
Expected: redirect to `checkout.stripe.com` showing **€135** (or the Studio-managed fee) for "OETZ TROPHY Race Weekend Registration 2026".

- [ ] **Step 4: Pay with the Stripe test card**

Card `4242 4242 4242 4242`, expiry `12/30`, CVC `123`, name `Test Runner`.
Expected: redirect to `https://preview.oetz-trophy.com/registration/success?session_id=cs_test_…` with the TEST banner. (If Stripe's checkout resists automation, hand this step to Peter — the link flow is identical.)

- [ ] **Step 5: Verify the webhook landed**

- Stripe dashboard (test mode) → the endpoint → recent deliveries: `checkout.session.completed` → HTTP 200.
- DB row check (read-only):

```bash
npx vercel env pull /tmp/oetz-preview-env --environment preview --git-branch preview
# extract DATABASE_URL and run:
psql "$DATABASE_URL" -c "SELECT id, email, status, left(stripe_session_id, 8) FROM registrations ORDER BY id DESC LIMIT 3;"
rm /tmp/oetz-preview-env
```

Expected: the `test+1@flowst8.eu` row has `status = 'paid'` and session id starting `cs_test_`. (If `psql` is unavailable, verify via a temporary `node -e` script using `@neondatabase/serverless` — delete it afterwards.)

- [ ] **Step 6: Production spot-check**

`curl -s https://oetz-trophy.com/de/registration | grep -i "testmodus"` → no match; the page still shows the opens-June-17 notice. **Phase 1 done — tell Peter the payment pipeline is verified.**

---

## Phase 2 — Hardening

### Task 8: Pure input validation module

**Files:**
- Create: `src/lib/registrationInput.ts`
- Create: `src/lib/registrationInput.test.ts`
- Modify: `src/app/api/registration/route.ts` (replace inline validation)

- [ ] **Step 1: Write the failing test**

`src/lib/registrationInput.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseRegistrationInput } from '@/lib/registrationInput';

const valid = {
  firstName: 'Anna',
  lastName: 'Müller',
  email: 'Anna.Mueller@Example.com',
  nationality: 'Austria',
  tshirtSize: 'm',
  acceptedTerms: true,
  acceptedAwpRules: true,
  confirmedOver18: true,
};

describe('parseRegistrationInput', () => {
  it('accepts a valid body and normalizes email/tshirt', () => {
    const r = parseRegistrationInput(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.email).toBe('anna.mueller@example.com');
      expect(r.value.tshirtSize).toBe('M');
      expect(r.value.name).toBe('Anna Müller');
    }
  });

  it.each([
    ['firstName', ''],
    ['lastName', ''],
    ['email', 'not-an-email'],
    ['email', 'a@b'],
    ['nationality', ''],
    ['tshirtSize', 'XXXL'],
  ])('rejects bad %s = %j', (key, val) => {
    expect(parseRegistrationInput({ ...valid, [key]: val }).ok).toBe(false);
  });

  it('rejects overlong fields', () => {
    expect(parseRegistrationInput({ ...valid, firstName: 'x'.repeat(101) }).ok).toBe(false);
    expect(parseRegistrationInput({ ...valid, email: 'x'.repeat(250) + '@a.com' }).ok).toBe(false);
    expect(parseRegistrationInput({ ...valid, nationality: 'x'.repeat(101) }).ok).toBe(false);
  });

  it('rejects missing confirmations', () => {
    expect(parseRegistrationInput({ ...valid, acceptedTerms: false }).ok).toBe(false);
    expect(parseRegistrationInput({ ...valid, confirmedOver18: 'yes' }).ok).toBe(false); // must be boolean true
  });

  it('rejects non-object bodies', () => {
    expect(parseRegistrationInput(null).ok).toBe(false);
    expect(parseRegistrationInput('hi').ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- src/lib/registrationInput.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/lib/registrationInput.ts`:

```ts
/** Validation for POST /api/registration bodies. Pure — vitest-covered. */

export const TSHIRT_SIZES = new Set(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_NATIONALITY = 100;
// Pragmatic email shape: something@something.tld — full RFC validation is a
// trap; Stripe re-validates on checkout anyway.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  nationality: string;
  tshirtSize: string;
  acceptedTerms: true;
  acceptedAwpRules: true;
  confirmedOver18: true;
  turnstileToken: string;
};

type ParseResult = { ok: true; value: RegistrationInput } | { ok: false; error: string };

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseRegistrationInput(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid request body' };
  }
  const b = body as Record<string, unknown>;

  const firstName = clean(b.firstName);
  const lastName = clean(b.lastName);
  const email = clean(b.email).toLowerCase();
  const nationality = clean(b.nationality);
  const tshirtSize = clean(b.tshirtSize).toUpperCase();
  const turnstileToken = clean(b.turnstileToken);

  if (!firstName || !lastName || !email || !nationality || !tshirtSize) {
    return { ok: false, error: 'First name, last name, email, nationality and t-shirt size are required' };
  }
  if (firstName.length > MAX_NAME || lastName.length > MAX_NAME || nationality.length > MAX_NATIONALITY) {
    return { ok: false, error: 'Please check the length of your entries' };
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email) || !TSHIRT_SIZES.has(tshirtSize)) {
    return { ok: false, error: 'Please check your email and t-shirt size' };
  }
  if (b.acceptedTerms !== true || b.acceptedAwpRules !== true || b.confirmedOver18 !== true) {
    return { ok: false, error: 'All confirmations are required' };
  }

  return {
    ok: true,
    value: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      nationality,
      tshirtSize,
      acceptedTerms: true,
      acceptedAwpRules: true,
      confirmedOver18: true,
      turnstileToken,
    },
  };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/registrationInput.test.ts`
Expected: PASS.

- [ ] **Step 5: Use it in the route**

In `src/app/api/registration/route.ts`: delete the local `TSHIRT_SIZES`, `clean()`, and the three inline validation blocks (required-fields check, email/tshirt check, confirmations check). After the gate check and `const body = await request.json();` insert:

```ts
    const parsed = parseRegistrationInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { firstName, lastName, name, email, nationality, tshirtSize } = parsed.value;
    const acceptedTerms = true;
    const acceptedAwpRules = true;
    const confirmedOver18 = true;
```

with import `import { parseRegistrationInput } from '@/lib/registrationInput';`. The rest of the route (upsert, Stripe session, session-id store) keeps using the same variable names — unchanged.

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit && npm test`
Expected: clean / PASS.

```bash
git add src/lib/registrationInput.ts src/lib/registrationInput.test.ts src/app/api/registration/route.ts
git commit -m "feat: hardened registration input validation (length caps, email shape)"
```

### Task 9: Rate limiting

**Files:**
- Create: `src/lib/rate-limit.ts`
- Create: `src/lib/rate-limit.test.ts`
- Modify: `src/app/api/registration/route.ts` (wire in, 429)

- [ ] **Step 1: Write the failing test**

`src/lib/rate-limit.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit, getClientIp, resetRateLimits } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to the limit, then blocks', () => {
    const opts = { key: 'reg:1.2.3.4', limit: 3, windowMs: 10_000, now: 1_000 };
    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(true);
    const blocked = checkRateLimit(opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets after the window', () => {
    const base = { key: 'reg:1.2.3.4', limit: 1, windowMs: 10_000 };
    expect(checkRateLimit({ ...base, now: 1_000 }).allowed).toBe(true);
    expect(checkRateLimit({ ...base, now: 2_000 }).allowed).toBe(false);
    expect(checkRateLimit({ ...base, now: 11_001 }).allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    const base = { limit: 1, windowMs: 10_000, now: 1_000 };
    expect(checkRateLimit({ ...base, key: 'a' }).allowed).toBe(true);
    expect(checkRateLimit({ ...base, key: 'b' }).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('takes the first x-forwarded-for hop', () => {
    const h = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' });
    expect(getClientIp(h)).toBe('203.0.113.7');
  });

  it('falls back to unknown', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- src/lib/rate-limit.test.ts` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/rate-limit.ts`:

```ts
/**
 * In-memory per-key token bucket. KNOWN LIMIT: on Vercel serverless this map
 * is per-lambda-instance and resets on cold start — it is a friction layer;
 * Turnstile is the real bot gate (spec §3/§4). No external infra by design.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastCleanupAt = 0;

function cleanup(now: number) {
  if (now - lastCleanupAt < 60_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  lastCleanupAt = now;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip') || 'unknown';
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const now = opts.now ?? Date.now();
  cleanup(now);

  const bucket = buckets.get(opts.key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > opts.limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test helper. */
export function resetRateLimits() {
  buckets.clear();
  lastCleanupAt = 0;
}
```

- [ ] **Step 4: Run tests** — `npm test -- src/lib/rate-limit.test.ts` — Expected: PASS.

- [ ] **Step 5: Wire into the registration route**

At the top of `POST` in `src/app/api/registration/route.ts` (before the open-gate check):

```ts
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit({ key: `reg:${ip}`, limit: 5, windowMs: 10 * 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }
```

Import: `import { checkRateLimit, getClientIp } from '@/lib/rate-limit';`

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit && npm test` — Expected: clean / PASS.

```bash
git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts src/app/api/registration/route.ts
git commit -m "feat: per-IP rate limiting on registration submissions"
```

### Task 10: Webhook identity + log hygiene

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts:21-38`

- [ ] **Step 1: Replace the email-keyed update**

Replace the `if (event.type === 'checkout.session.completed') { … }` block body with:

```ts
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentId = session.payment_intent as string;
    const email = session.metadata?.email || session.customer_email;
    const sql = getDb();

    // Primary match: the session id our server minted for exactly this
    // registration row. Email is user-supplied and only a fallback.
    let updated = await sql`
      UPDATE registrations
      SET status = 'paid', stripe_payment_id = ${paymentId}, updated_at = NOW()
      WHERE stripe_session_id = ${session.id}
      RETURNING id
    `;

    if (updated.length === 0 && email) {
      updated = await sql`
        UPDATE registrations
        SET status = 'paid', stripe_payment_id = ${paymentId}, updated_at = NOW()
        WHERE email = ${email}
        RETURNING id
      `;
    }

    if (updated.length > 0) {
      // GDPR: row id only — never log email addresses (PII) to Vercel logs.
      console.log(`Registration paid: row ${updated[0].id}`);
    } else {
      console.warn(`Webhook session ${session.id} matched no registration row`);
    }
  }
```

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit && npm test` — Expected: clean / PASS.

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "fix: webhook matches by session id first, logs row ids not emails"
```

- [ ] **Step 3: Re-verify delivery**

Push (`git push origin preview`), then Stripe dashboard (test mode) → webhook endpoint → resend the last `checkout.session.completed` event. Expected: 200, Vercel function log shows `Registration paid: row <id>` with no email.

---

## Phase 3 — Turnstile

### Task 11: Turnstile config + verification module

**Files:**
- Create: `src/lib/turnstile.ts`
- Create: `src/lib/turnstile.test.ts`

- [ ] **Step 1: Confirm the official test keys**

WebFetch `https://developers.cloudflare.com/turnstile/troubleshooting/testing/` and record the current always-pass sitekey/secret pair (expected: sitekey `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`). If they differ, use the documented values everywhere below.

- [ ] **Step 2: Write the failing test**

`src/lib/turnstile.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { getTurnstileConfig, verifyTurnstileToken } from '@/lib/turnstile';

describe('getTurnstileConfig', () => {
  it('disabled when both keys are absent', () => {
    expect(getTurnstileConfig({})).toBe('disabled');
  });
  it('enforced when both keys are present', () => {
    expect(
      getTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k', TURNSTILE_SECRET_KEY: 's' }),
    ).toBe('enforced');
  });
  it('misconfigured when exactly one key is present (fail closed)', () => {
    expect(getTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k' })).toBe('misconfigured');
    expect(getTurnstileConfig({ TURNSTILE_SECRET_KEY: 's' })).toBe('misconfigured');
  });
});

describe('verifyTurnstileToken', () => {
  const env = { TURNSTILE_SECRET_KEY: 'secret' };

  it('passes on success=true', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    await expect(verifyTurnstileToken('tok', '1.2.3.4', env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toContain('challenges.cloudflare.com');
    expect(String(init.body)).toContain('response=tok');
  });

  it('fails on success=false', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] })),
    );
    await expect(verifyTurnstileToken('tok', undefined, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails closed on network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(verifyTurnstileToken('tok', undefined, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails on empty token without calling Cloudflare', async () => {
    const fetchImpl = vi.fn();
    await expect(verifyTurnstileToken('', undefined, env, fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run to verify failure** — `npm test -- src/lib/turnstile.test.ts` — Expected: FAIL.

- [ ] **Step 4: Implement**

`src/lib/turnstile.ts`:

```ts
/**
 * Cloudflare Turnstile server-side verification (spec §4).
 * Config-symmetric: both keys present = enforced; both absent = disabled
 * (local dev); one present = misconfigured → callers must fail closed.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileConfig = 'enforced' | 'disabled' | 'misconfigured';

export function getTurnstileConfig(
  env: Record<string, string | undefined> = process.env,
): TurnstileConfig {
  const site = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = env.TURNSTILE_SECRET_KEY;
  if (site && secret) return 'enforced';
  if (!site && !secret) return 'disabled';
  return 'misconfigured';
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const res = await fetchImpl(SITEVERIFY_URL, { method: 'POST', body });
    if (!res.ok) return false;
    const outcome = (await res.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false; // network failure → fail closed when enforced
  }
}
```

- [ ] **Step 5: Run tests** — `npm test -- src/lib/turnstile.test.ts` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/turnstile.ts src/lib/turnstile.test.ts
git commit -m "feat: Turnstile config detection and server-side token verification"
```

### Task 12: Turnstile widget in the form

**Files:**
- Create: `src/components/TurnstileWidget.tsx`
- Modify: `src/app/[locale]/registration/RegistrationForm.tsx` (token state, widget above submit button, canSubmit)

- [ ] **Step 1: Create the widget component**

`src/components/TurnstileWidget.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type Props = {
  siteKey: string;
  locale: string;
  /** Called with the token on success, null when the token expires/errors. */
  onToken: (token: string | null) => void;
};

export default function TurnstileWidget({ siteKey, locale, onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        language: locale === 'de' ? 'de' : 'en',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderWidget);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, locale, onToken]);

  return <div ref={containerRef} />;
}
```

- [ ] **Step 2: Integrate into the form**

In `src/app/[locale]/registration/RegistrationForm.tsx`:

1. Imports + module constant:

```ts
import { useCallback } from 'react'; // extend the existing react import
import TurnstileWidget from '@/components/TurnstileWidget';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
```

(`NEXT_PUBLIC_*` is inlined into the client bundle at build time — per-deployment, like the banner.)

2. State + handler next to the other `useState` calls:

```ts
const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
const handleTurnstileToken = useCallback((token: string | null) => {
  setTurnstileToken(token);
}, []);
```

3. Extend `canSubmit` with `(!TURNSTILE_SITE_KEY || Boolean(turnstileToken)) &&` (insert as a line within the existing `Boolean(...)` conjunction).

4. Send the token: in `handleSubmit`, change the fetch body to
   `body: JSON.stringify({ ...form, turnstileToken: turnstileToken ?? '' })`.

5. Render the widget + GDPR notice between the error paragraph and the submit button:

```tsx
{TURNSTILE_SITE_KEY && (
  <div className="mt-6">
    <TurnstileWidget
      siteKey={TURNSTILE_SITE_KEY}
      locale={locale}
      onToken={handleTurnstileToken}
    />
    <p
      className="mt-2"
      style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-muted)' }}
    >
      {t('turnstileNotice')}
    </p>
  </div>
)}
```

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit && npm test && npm run build` — Expected: clean.

```bash
git add src/components/TurnstileWidget.tsx "src/app/[locale]/registration/RegistrationForm.tsx"
git commit -m "feat: Turnstile widget on the registration form (locale-aware, GDPR notice)"
```

### Task 13: Enforce Turnstile in the API route

**Files:**
- Modify: `src/app/api/registration/route.ts` (after parse, before any DB work)

- [ ] **Step 1: Add verification**

Imports: `import { getTurnstileConfig, verifyTurnstileToken } from '@/lib/turnstile';`

Directly after the `parseRegistrationInput` block (and before `const sql = getDb()`):

```ts
    const turnstile = getTurnstileConfig();
    if (turnstile === 'misconfigured') {
      console.error('Turnstile misconfigured: exactly one of site/secret key is set — failing closed');
      return NextResponse.json({ error: 'Registration is temporarily unavailable' }, { status: 500 });
    }
    if (turnstile === 'enforced') {
      const human = await verifyTurnstileToken(parsed.value.turnstileToken, ip);
      if (!human) {
        return NextResponse.json({ error: 'Verification failed — please try again' }, { status: 400 });
      }
    }
```

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit && npm test` — Expected: clean / PASS.

```bash
git add src/app/api/registration/route.ts
git commit -m "feat: enforce Turnstile verification before any registration DB work"
```

### Task 14: Turnstile env on preview (always-pass keys)

**Files:** none (Vercel config; values are Cloudflare's PUBLIC documented test keys — safe for CLI).

- [ ] **Step 1: Add the always-pass pair, Preview scope, branch `preview`** (values as confirmed in Task 11 Step 1):

```bash
printf '1x00000000000000000000AA' | npx vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY preview preview
printf '1x0000000000000000000000000000000AA' | npx vercel env add TURNSTILE_SECRET_KEY preview preview
```

- [ ] **Step 2: Push & spot-check**

`git push origin preview`, wait READY, then via the bypass link: widget box renders above the submit button with the notice, auto-passes without challenge, form submits successfully. Production check: `curl -s https://oetz-trophy.com/de/registration | grep -ci turnstile` → `0` (both keys absent in Production → disabled).

**(Peter, anytime before launch):** create the real Turnstile site in the Cloudflare account (Turnstile → Add site → domain `oetz-trophy.com`, managed mode) and keep the real sitekey/secret for the June-16 go-live env swap. Not needed for preview testing.

---

## Phase 4 — Admin page + CSV export

### Task 15: Admin session auth module

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `src/lib/admin-auth.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/admin-auth.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createAdminToken, verifyAdminToken, verifyAdminPassword } from '@/lib/admin-auth';

const env = { ADMIN_PASSWORD: 'correct-horse', ADMIN_SESSION_SECRET: 'sssh-signing-secret' };

describe('admin token round-trip', () => {
  it('verifies a freshly created token', () => {
    const token = createAdminToken(env, 1_000_000);
    expect(verifyAdminToken(token, env, 1_000_000 + 60_000)).toBe(true);
  });

  it('rejects an expired token', () => {
    const token = createAdminToken(env, 1_000_000);
    const thirteenHours = 13 * 60 * 60 * 1000;
    expect(verifyAdminToken(token, env, 1_000_000 + thirteenHours)).toBe(false);
  });

  it('rejects tampered payloads and bad signatures', () => {
    const token = createAdminToken(env, 1_000_000);
    const [payload] = token.split('.');
    expect(verifyAdminToken(`${payload}.AAAA`, env, 1_000_000)).toBe(false);
    expect(verifyAdminToken(`${payload}x.${token.split('.')[1]}`, env, 1_000_000)).toBe(false);
    expect(verifyAdminToken(undefined, env, 1_000_000)).toBe(false);
    expect(verifyAdminToken('garbage', env, 1_000_000)).toBe(false);
  });

  it('rejects tokens signed with a different secret', () => {
    const token = createAdminToken({ ...env, ADMIN_SESSION_SECRET: 'other' }, 1_000_000);
    expect(verifyAdminToken(token, env, 1_000_000)).toBe(false);
  });

  it('throws when creating without a secret', () => {
    expect(() => createAdminToken({ ADMIN_PASSWORD: 'x' }, 1_000_000)).toThrow();
  });
});

describe('verifyAdminPassword', () => {
  it('accepts the right password (timing-safe)', () => {
    expect(verifyAdminPassword('correct-horse', env)).toBe(true);
  });
  it('rejects wrong/empty passwords and unset env', () => {
    expect(verifyAdminPassword('wrong', env)).toBe(false);
    expect(verifyAdminPassword('', env)).toBe(false);
    expect(verifyAdminPassword('anything', {})).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- src/lib/admin-auth.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement**

`src/lib/admin-auth.ts`:

```ts
/**
 * Admin session auth for /admin (spec §5): HMAC-SHA256-signed expiry token in
 * an httpOnly cookie. Requires ADMIN_PASSWORD and ADMIN_SESSION_SECRET — no
 * fallback chain; missing secrets fail closed.
 */
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'oetz_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

type Env = Record<string, string | undefined>;

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

export function verifyAdminPassword(candidate: string, env: Env = process.env): boolean {
  const expected = env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  return safeEqual(candidate, expected);
}

export function createAdminToken(env: Env = process.env, now: number = Date.now()): string {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is required for admin sessions');
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000 }),
    'utf8',
  ).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminToken(
  token: string | undefined,
  env: Env = process.env,
  now: number = Date.now(),
): boolean {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  if (!safeEqual(sign(payload, secret), signature)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof session.expiresAt === 'number' && session.expiresAt > now;
  } catch {
    return false;
  }
}

/** Server-component/route helper: is the current request's cookie valid? */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}
```

- [ ] **Step 4: Run tests** — `npm test -- src/lib/admin-auth.test.ts` — Expected: PASS. (`next/headers` import is fine in vitest node env because the tests never call `isAdminAuthenticated`. If vitest nevertheless fails to RESOLVE the `next/headers` import, move only the `isAdminAuthenticated` function into a new `src/lib/admin-auth-server.ts` that imports the token helpers from `@/lib/admin-auth`, update the export-route/page imports to the new file, and keep this test file pointed at the pure helpers.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-auth.ts src/lib/admin-auth.test.ts
git commit -m "feat: HMAC admin session tokens with timing-safe password check"
```

### Task 16: Login/logout routes

**Files:**
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`

- [ ] **Step 1: Login route**

`src/app/api/admin/login/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminToken,
  verifyAdminPassword,
} from '@/lib/admin-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit({ key: `admin:${ip}`, limit: 5, windowMs: 15 * 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    );
  }

  let password = '';
  try {
    const body = await request.json();
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    /* fall through to rejection */
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
```

- [ ] **Step 2: Logout route**

`src/app/api/admin/logout/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
```

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit && npm test` — Expected: clean / PASS.

```bash
git add src/app/api/admin/login/route.ts src/app/api/admin/logout/route.ts
git commit -m "feat: admin login/logout with rate-limited password check"
```

### Task 17: `listRegistrations` in db.ts + CSV module

**Files:**
- Modify: `src/lib/db.ts` (append)
- Create: `src/lib/csv.ts`
- Create: `src/lib/csv.test.ts`

- [ ] **Step 1: Write the failing CSV test**

`src/lib/csv.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/csv';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
] as const;

describe('toCsv (German-Excel dialect)', () => {
  it('starts with a UTF-8 BOM and uses semicolons + CRLF', () => {
    const csv = toCsv([{ id: 1, name: 'Anna' }], columns);
    expect(csv.charCodeAt(0)).toBe(0xfeff); // explicit code point — the BOM is invisible in editors
    expect(csv).toContain('"ID";"Name"');
    expect(csv).toContain('\r\n');
  });

  it('preserves umlauts and escapes quotes/semicolons', () => {
    const csv = toCsv([{ id: 2, name: 'Jörg "Blade"; Müller' }], columns);
    expect(csv).toContain('"Jörg ""Blade""; Müller"');
  });

  it('renders null/undefined as empty cells', () => {
    const csv = toCsv([{ id: 3, name: null }], columns);
    expect(csv.trim().endsWith('"3";""')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- src/lib/csv.test.ts` — Expected: FAIL.

- [ ] **Step 3: Implement CSV**

`src/lib/csv.ts`:

```ts
/**
 * CSV for German/Austrian Excel (spec §5): UTF-8 BOM so Excel detects the
 * encoding (umlauts), semicolon delimiter (de-AT list separator), CRLF rows,
 * every cell quoted with " doubled.
 */

export type CsvColumn = { key: string; header: string };

function cell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(
  rows: ReadonlyArray<Record<string, unknown>>,
  columns: ReadonlyArray<CsvColumn>,
): string {
  const header = columns.map((c) => cell(c.header)).join(';');
  const lines = rows.map((row) => columns.map((c) => cell(row[c.key])).join(';'));
  return '\uFEFF' + [header, ...lines].join('\r\n') + '\r\n'; // explicit BOM escape — never paste the invisible char
}
```

- [ ] **Step 4: Run tests** — `npm test -- src/lib/csv.test.ts` — Expected: PASS.

- [ ] **Step 5: Add `listRegistrations` to `src/lib/db.ts`** (append at the end):

```ts
export type RegistrationRecord = {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  nationality: string | null;
  tshirtSize: string | null;
  status: string;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listRegistrations(): Promise<RegistrationRecord[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, first_name, last_name, email, nationality, tshirt_size,
           status, stripe_session_id, stripe_payment_id, created_at, updated_at
    FROM registrations
    ORDER BY created_at DESC
    LIMIT 2000
  `;
  return rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    firstName: (r.first_name as string) ?? null,
    lastName: (r.last_name as string) ?? null,
    email: r.email as string,
    nationality: (r.nationality as string) ?? null,
    tshirtSize: (r.tshirt_size as string) ?? null,
    status: r.status as string,
    stripeSessionId: (r.stripe_session_id as string) ?? null,
    stripePaymentId: (r.stripe_payment_id as string) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}
```

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit && npm test` — Expected: clean / PASS.

```bash
git add src/lib/csv.ts src/lib/csv.test.ts src/lib/db.ts
git commit -m "feat: registrations listing + German-Excel CSV serializer"
```

### Task 18: Export route + admin page

**Files:**
- Create: `src/app/api/admin/export/route.ts`
- Create: `src/app/[locale]/admin/page.tsx`
- Create: `src/app/[locale]/admin/AdminLogin.tsx`
- Create: `src/app/[locale]/admin/AdminActions.tsx`

- [ ] **Step 1: Export route**

`src/app/api/admin/export/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { listRegistrations } from '@/lib/db';
import { toCsv } from '@/lib/csv';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const registrations = await listRegistrations();
  const csv = toCsv(registrations, [
    { key: 'id', header: 'ID' },
    { key: 'firstName', header: 'First name' },
    { key: 'lastName', header: 'Last name' },
    { key: 'email', header: 'Email' },
    { key: 'nationality', header: 'Nationality' },
    { key: 'tshirtSize', header: 'T-shirt' },
    { key: 'status', header: 'Status' },
    { key: 'stripeSessionId', header: 'Stripe session' },
    { key: 'stripePaymentId', header: 'Stripe payment' },
    { key: 'createdAt', header: 'Created' },
    { key: 'updatedAt', header: 'Updated' },
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="registrations-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
```

- [ ] **Step 2: Login form (client)**

`src/app/[locale]/admin/AdminLogin.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full">
      <label
        htmlFor="admin-password"
        className="block mb-2 uppercase"
        style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}
      >
        Admin password
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="w-full px-4 py-3 mb-4"
        style={{ border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' }}
      />
      {error && (
        <p className="mb-4" style={{ color: '#b91c1c', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full py-3 uppercase disabled:opacity-45"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 700,
          backgroundColor: 'var(--color-ink)',
          color: 'white',
          border: 'none',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? '…' : 'Log in'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Export/logout actions (client)**

`src/app/[locale]/admin/AdminActions.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function AdminActions() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  const buttonStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 700,
    border: '1px solid var(--color-ink)',
    cursor: 'pointer',
  };

  return (
    <div className="flex gap-3">
      <a
        href="/api/admin/export"
        className="px-5 py-2 uppercase"
        style={{ ...buttonStyle, backgroundColor: 'var(--color-ink)', color: 'white' }}
      >
        Download CSV
      </a>
      <button
        type="button"
        onClick={handleLogout}
        className="px-5 py-2 uppercase"
        style={{ ...buttonStyle, backgroundColor: 'transparent', color: 'var(--color-ink)' }}
      >
        Log out
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Admin page (server)**

`src/app/[locale]/admin/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { listRegistrations } from '@/lib/db';
import AdminLogin from './AdminLogin';
import AdminActions from './AdminActions';

export const dynamic = 'force-dynamic'; // PII — never cache, always re-check the cookie

export const metadata: Metadata = {
  title: 'Registrations admin — OETZ TROPHY',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <AdminLogin />
      </main>
    );
  }

  const registrations = await listRegistrations();
  const paid = registrations.filter((r) => r.status === 'paid');
  const isTestRow = (sessionId: string | null) => sessionId?.startsWith('cs_test_') ?? false;

  const th: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: 700,
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid var(--color-ink)',
    textTransform: 'uppercase',
  };
  const td: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'top',
  };

  return (
    <main className="min-h-screen px-6 py-16 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1
            className="uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 700 }}
          >
            Registrations
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-body-text)' }}>
            {registrations.length} total · {paid.length} paid ·{' '}
            {registrations.length - paid.length} pending
          </p>
        </div>
        <AdminActions />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Nationality</th>
              <th style={th}>T-shirt</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.id} style={r.status === 'paid' ? { backgroundColor: '#f0fdf4' } : undefined}>
                <td style={td}>{r.id}</td>
                <td style={td}>
                  {r.name}
                  {isTestRow(r.stripeSessionId) && (
                    <span
                      className="ml-2 px-2 py-0.5 uppercase"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#7c2d12',
                        color: '#ffedd5',
                      }}
                    >
                      Test
                    </span>
                  )}
                </td>
                <td style={td}>{r.email}</td>
                <td style={td}>{r.nationality}</td>
                <td style={td}>{r.tshirtSize}</td>
                <td style={td}>{r.status}</td>
                <td style={td}>{new Date(r.createdAt).toLocaleString('de-AT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
```

(Admin UI is English-only by design — it's for the organizer, not site visitors; no `messages` keys, nothing for Studio.)

- [ ] **Step 5: Verify and commit**

Run: `npx tsc --noEmit && npm test && npm run build` — Expected: clean.

```bash
git add src/app/api/admin/export/route.ts "src/app/[locale]/admin/"
git commit -m "feat: password-protected registrations admin with CSV export"
```

### Task 19: Admin env vars on preview + deploy + verify

**Files:** none.

- [ ] **Step 1: Generate and set preview-scoped admin secrets** (test-rig values — fine to generate in shell):

```bash
printf 'oetz-preview-2026' | npx vercel env add ADMIN_PASSWORD preview preview
openssl rand -base64 32 | tr -d '\n' | npx vercel env add ADMIN_SESSION_SECRET preview preview
```

- [ ] **Step 2: Push and verify**

`git push origin preview`, wait READY. Via the bypass link open `https://preview.oetz-trophy.com/de/admin`:
1. Wrong password → "Wrong password"; 6 rapid attempts → 429 message.
2. Correct password (`oetz-preview-2026`) → table appears; the Task-7 row shows status `paid` with the orange TEST chip; totals correct.
3. Download CSV → file `registrations-<date>.csv`; open in Excel (or `xxd file | head -1` → starts `efbb bf` BOM; cells semicolon-separated; `Müller`-style umlauts intact).
4. Log out → login form returns; `/api/admin/export` direct → 401.

- [ ] **Step 3: Production note**

Production has NO `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` until the June-16 swap → `verifyAdminPassword` and `createAdminToken` fail closed → prod `/admin` cannot be logged into. Verify: `curl -s -o /dev/null -w "%{http_code}" -X POST https://oetz-trophy.com/api/admin/login -H 'Content-Type: application/json' -d '{"password":"x"}'` → `401`.

---

## Phase 5 — Final verification & handover

### Task 20: Full E2E re-run + spec checklist + walkthrough hand-off

- [ ] **Step 1: Full suite + build**

Run: `npm test && npx tsc --noEmit && npm run build` — Expected: green.

- [ ] **Step 2: Re-run the complete preview E2E (spec §10)**

Via the bypass link: form open + TEST banner (DE + EN) + Turnstile widget renders and auto-passes → submit `test+2@flowst8.eu` → Stripe test checkout → `4242…` → success page on `preview.oetz-trophy.com` with banner → Stripe webhook delivery 200 → admin shows the new row `paid` + TEST chip → CSV contains it → rapid-fire POSTs to `/api/registration` (e.g. 7× `curl` with the bypass param) → 429 after the 5th → logs show row ids, no emails.

- [ ] **Step 3: Production spot-checks (spec §10.9)**

- `curl -s https://oetz-trophy.com/de/registration` → opens-June-17 notice, no `Testmodus`, no Turnstile markup.
- Form POST to `https://oetz-trophy.com/api/registration` with a valid-shaped body → 403 "Registration is not open yet" (date gate, kill switch active).

- [ ] **Step 4: Walkthrough package for Peter**

Draft (do not send) a short DE/EN message for the client containing: the bypass click-link to `/registration`, the test card `4242 4242 4242 4242` + any-future-expiry/any-CVC instructions, the fake-email rule (`test+name@…` addresses only — real emails would block themselves at launch), and the admin URL + preview password for the export demo.

- [ ] **Step 5: Update the spec's launch checklist state**

In `docs/superpowers/specs/2026-06-12-registration-payment-test-design.md` §11, nothing changes in content — confirm each go-live item still matches reality (e.g. Turnstile real-site creation status from Task 14). Commit any corrections.

- [ ] **Step 6: Final commit + push**

```bash
git push origin preview
```

Report to Peter: payment pipeline verified end-to-end, hardening + Turnstile + admin live on staging, walkthrough package ready, June-16 go-live checklist unchanged in spec §11.

---

## Spec coverage map (self-review)

| Spec section | Tasks |
|---|---|
| §1 env matrix | 5, 6, 14, 19 (+ §11 launch items stay manual/Peter) |
| §2 test-mode gate + banner | 1, 2, 3, 4 |
| §3 hardening | 8, 9, 10 |
| §4 Turnstile | 11, 12, 13, 14 |
| §5 admin + export | 15, 16, 17, 18, 19 |
| §6 GDPR code items | 10 (logs), 12 (notice), 18 (access control, no-PII URLs, robots noindex) |
| §6 GDPR content/checklist | Task 20 Step 4/5 + spec §11 (Peter/client actions, deliberately not code) |
| §7 Stripe dashboard | 6 |
| §8 tester access | 5 (docs check), 6 (secret), 7 (first use) |
| §9 DB hygiene | encoded in walkthrough rules (Task 20 Step 4) + spec §11 cleanup SQL (manual, pre-launch) |
| §10 verification | 7, 14, 19, 20 |
| §11 go-live | documented in spec; deliberately NOT automated by this plan |
