# Registration Capacity Caps + Waiting List — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cap paid participants at 130 men / 50 women, divert full categories to a waiting list (capture + bilingual email, no payment), and give admins a one-click "delete test data" cleanup.

**Architecture:** A required `category` (`men`/`women`) is added to the registration form and table. `POST /api/registration` counts *paid* rows for the submitted category and, when at/over the cap, writes a `waitlist` row + sends a waitlist email instead of creating a Stripe session (server is authoritative). The page passes per-category availability to the form so the button reads "Register & Pay" or "Join the waiting list". Caps default in code (130/50) and are overridable via Sanity settings.

**Tech Stack:** Next.js 16 App Router, next-intl (de/en), Neon serverless Postgres (`@neondatabase/serverless`), Stripe Checkout, Resend, Cloudflare Turnstile, Vitest.

**Conventions:**
- Run a single test file: `npx vitest run <path>`. Run all: `npm test`. Typecheck: `npx tsc --noEmit`.
- DB helpers that hit Neon are not unit-tested (no infra); they are covered by the route tests (mocked `sql`) and the preview E2E. Pure logic lives in `capacity.ts` and is unit-tested.
- Schema changes are additive/idempotent (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`).

**Spec:** `docs/superpowers/specs/2026-06-15-registration-caps-waitlist-design.md`

---

## File Structure

**Create:**
- `src/lib/capacity.ts` — pure cap logic (`resolveCaps`, `isCategoryFull`, `isSelectedCategoryFull`, types)
- `src/lib/capacity.test.ts`
- `src/lib/waitlist-email.ts` — bilingual waitlist email (mirror of `confirmation-email.ts`)
- `src/lib/waitlist-email.test.ts`
- `src/app/api/admin/delete-test/route.ts` — auth-gated test-data deletion
- `src/app/api/admin/delete-test/route.test.ts`

**Modify:**
- `src/lib/db.ts` — centralised `ensureSchema`, `category` column, `waitlist` table, read/delete helpers
- `src/lib/settings.ts` — `maxMen`/`maxWomen`
- `src/sanity/schemaTypes/siteSettings.ts` — Studio fields for the caps
- `src/lib/registrationInput.ts` — require/validate `category`
- `src/lib/registrationInput.test.ts` — category fixture + cases
- `src/app/api/registration/route.ts` — `ensureSchema`, capacity check, waitlist branch, `category` in insert/metadata
- `src/app/api/registration/route.test.ts` — `category` fixture, `ensureSchema`/waitlist-email mocks, waitlist cases
- `src/app/[locale]/registration/page.tsx` — availability props, dynamic render
- `src/app/[locale]/registration/RegistrationForm.tsx` — category radio, button switch, waitlist success
- `src/app/[locale]/admin/AdminActions.tsx` — Delete-test button
- `src/app/[locale]/admin/page.tsx` — waitlist table
- `messages/de.json`, `messages/en.json` — new `registration` keys

---

# PHASE 0 — Test-data cleanup button (ships first, standalone)

### Task 1: `deleteTestRegistrations` db helper

**Files:**
- Modify: `src/lib/db.ts` (append a new exported function)

- [ ] **Step 1: Add the helper**

Append to `src/lib/db.ts`:

```ts
/**
 * Delete leftover test registrations. Test-mode checkouts always carry a
 * `cs_test_…` Stripe session id, so this never matches real (live) rows.
 * Returns the number of rows removed.
 */
export async function deleteTestRegistrations(): Promise<number> {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM registrations WHERE stripe_session_id LIKE 'cs_test_%' RETURNING id
  `;
  return rows.length;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat(admin): add deleteTestRegistrations db helper"
```

---

### Task 2: `POST /api/admin/delete-test` route (TDD)

**Files:**
- Create: `src/app/api/admin/delete-test/route.ts`
- Test: `src/app/api/admin/delete-test/route.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/api/admin/delete-test/route.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin-auth-server', () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock('@/lib/db', () => ({ deleteTestRegistrations: vi.fn() }));

import { POST } from './route';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { deleteTestRegistrations } from '@/lib/db';

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('POST /api/admin/delete-test', () => {
  it('rejects unauthenticated callers with 401 and never touches the db', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false);
    const res = await POST();
    expect(res.status).toBe(401);
    expect(deleteTestRegistrations).not.toHaveBeenCalled();
  });

  it('deletes test registrations and returns the count when authenticated', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    vi.mocked(deleteTestRegistrations).mockResolvedValue(3);
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: { registrations: 3 } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/admin/delete-test/route.test.ts`
Expected: FAIL — cannot find module `./route`.

- [ ] **Step 3: Write the route**

Create `src/app/api/admin/delete-test/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { deleteTestRegistrations } from '@/lib/db';

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const registrations = await deleteTestRegistrations();
  return NextResponse.json({ deleted: { registrations } });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/admin/delete-test/route.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/delete-test/route.ts src/app/api/admin/delete-test/route.test.ts
git commit -m "feat(admin): add auth-gated delete-test endpoint"
```

---

### Task 3: "Delete test data" admin button

**Files:**
- Modify: `src/app/[locale]/admin/AdminActions.tsx`

- [ ] **Step 1: Add the handler + button**

In `src/app/[locale]/admin/AdminActions.tsx`, add a handler alongside `handleLogout`:

```tsx
  async function handleDeleteTest() {
    if (!window.confirm('Delete ALL test registrations (cs_test_…)? This cannot be undone.')) return;
    const res = await fetch('/api/admin/delete-test', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      window.alert(`Deleted ${data?.deleted?.registrations ?? 0} test registration(s).`);
      router.refresh();
    } else {
      window.alert('Delete failed.');
    }
  }
```

Then add the button as the first child of the `<div className="flex gap-3">`, before the "Download CSV" link:

```tsx
      <button
        type="button"
        onClick={handleDeleteTest}
        className="px-5 py-2 uppercase"
        style={{ ...buttonStyle, backgroundColor: '#7c2d12', color: '#ffedd5' }}
      >
        Delete test data
      </button>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/AdminActions.tsx
git commit -m "feat(admin): Delete test data button"
```

- [ ] **Step 4: Deploy Phase 0 to preview + checkpoint**

Push `preview`, confirm the Vercel preview deploy is READY, and ask Peter to open `/de/admin` → "Delete test data" to clear the leftover row. (Pushing to `main`/production requires Peter's explicit go-ahead.)

---

# PHASE 1 — Data model + capacity core

### Task 4: `capacity.ts` pure logic (TDD)

**Files:**
- Create: `src/lib/capacity.ts`
- Test: `src/lib/capacity.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/capacity.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveCaps, isCategoryFull, isSelectedCategoryFull, DEFAULT_CAPS } from '@/lib/capacity';

describe('resolveCaps', () => {
  it('falls back to 130/50 when settings are blank', () => {
    expect(resolveCaps({ maxMen: null, maxWomen: null })).toEqual({ men: 130, women: 50 });
    expect(DEFAULT_CAPS).toEqual({ men: 130, women: 50 });
  });
  it('uses positive settings values when present', () => {
    expect(resolveCaps({ maxMen: 140, maxWomen: 60 })).toEqual({ men: 140, women: 60 });
  });
  it('ignores zero/negative overrides and keeps the defaults', () => {
    expect(resolveCaps({ maxMen: 0, maxWomen: -5 })).toEqual({ men: 130, women: 50 });
  });
});

describe('isCategoryFull', () => {
  it('is true only at or above the cap', () => {
    expect(isCategoryFull(129, 130)).toBe(false);
    expect(isCategoryFull(130, 130)).toBe(true);
    expect(isCategoryFull(131, 130)).toBe(true);
  });
});

describe('isSelectedCategoryFull', () => {
  const av = { men: { full: true }, women: { full: false } };
  it('maps the selected category to its availability flag', () => {
    expect(isSelectedCategoryFull('men', av)).toBe(true);
    expect(isSelectedCategoryFull('women', av)).toBe(false);
  });
  it('is false when no category is selected', () => {
    expect(isSelectedCategoryFull('', av)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/capacity.test.ts`
Expected: FAIL — cannot find module `@/lib/capacity`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/capacity.ts`:

```ts
/** Per-category participant caps and the pure logic around them. */

export type Category = 'men' | 'women';
export type Caps = { men: number; women: number };

export const DEFAULT_CAPS: Caps = { men: 130, women: 50 };

/** Caps come from Sanity settings when set to a positive number, else the defaults. */
export function resolveCaps(settings: { maxMen?: number | null; maxWomen?: number | null }): Caps {
  const pick = (v: number | null | undefined, d: number) =>
    typeof v === 'number' && v > 0 ? v : d;
  return {
    men: pick(settings.maxMen, DEFAULT_CAPS.men),
    women: pick(settings.maxWomen, DEFAULT_CAPS.women),
  };
}

/** A category is full once paid registrations reach its cap. */
export function isCategoryFull(paidCount: number, cap: number): boolean {
  return paidCount >= cap;
}

export type CategoryAvailability = {
  men: { paid: number; cap: number; full: boolean };
  women: { paid: number; cap: number; full: boolean };
};

/** Form helper: is the currently-selected category full? Unknown/empty → not full. */
export function isSelectedCategoryFull(
  category: string,
  availability: { men: { full: boolean }; women: { full: boolean } },
): boolean {
  if (category === 'men') return availability.men.full;
  if (category === 'women') return availability.women.full;
  return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/capacity.test.ts`
Expected: PASS (7 assertions across the describes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/capacity.ts src/lib/capacity.test.ts
git commit -m "feat(capacity): pure cap-resolution and fullness logic"
```

---

### Task 5: Caps in settings + Sanity schema

**Files:**
- Modify: `src/lib/settings.ts`
- Modify: `src/sanity/schemaTypes/siteSettings.ts`

- [ ] **Step 1: Extend `SiteSettings`**

In `src/lib/settings.ts`:

Add to the `SiteSettings` type:
```ts
  maxMen: number | null;
  maxWomen: number | null;
```
Add to `settingsQuery` (inside the projection):
```ts
  maxMen,
  maxWomen,
```
Add to `defaults`:
```ts
  maxMen: 130,
  maxWomen: 50,
```
Add to the merged return object in `getSiteSettings`:
```ts
      maxMen: settings?.maxMen ?? defaults.maxMen,
      maxWomen: settings?.maxWomen ?? defaults.maxWomen,
```

- [ ] **Step 2: Add Studio fields**

In `src/sanity/schemaTypes/siteSettings.ts`, add two fields after `registrationFeeEur`:

```ts
    defineField({
      name: 'maxMen',
      title: 'Max participants — Men',
      type: 'number',
      description: 'Maximum PAID men. When reached, the registration button becomes "Join the waiting list". Leave blank for the default (130).',
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'maxWomen',
      title: 'Max participants — Women',
      type: 'number',
      description: 'Maximum PAID women. When reached, the registration button becomes "Join the waiting list". Leave blank for the default (50).',
      validation: (Rule) => Rule.min(0).integer(),
    }),
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/settings.ts src/sanity/schemaTypes/siteSettings.ts
git commit -m "feat(settings): client-overridable men/women caps"
```

---

### Task 6: Require `category` in registration input (TDD)

**Files:**
- Modify: `src/lib/registrationInput.ts`
- Modify: `src/lib/registrationInput.test.ts`
- Modify: `src/app/api/registration/route.test.ts` (fixture only — keep suite green)

- [ ] **Step 1: Update the tests first**

In `src/lib/registrationInput.test.ts`, add `category: 'men'` to the `valid` fixture object, then add these cases inside the `describe`:

```ts
  it('accepts and lowercases a valid category', () => {
    const r = parseRegistrationInput({ ...valid, category: 'WOMEN' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.category).toBe('women');
  });

  it.each([['category', ''], ['category', 'mixed'], ['category', 'mann']])(
    'rejects bad %s = %j',
    (key, val) => {
      expect(parseRegistrationInput({ ...valid, [key]: val }).ok).toBe(false);
    },
  );
```

In `src/app/api/registration/route.test.ts`, add `category: 'men',` to the `VALID_BODY` object (so its existing 200-path tests still pass once category is required).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/registrationInput.test.ts`
Expected: FAIL — `category` is not on the parsed value / bad-category cases still pass parsing.

- [ ] **Step 3: Implement category validation**

In `src/lib/registrationInput.ts`:

Add to the `RegistrationInput` type:
```ts
  category: 'men' | 'women';
```
In `parseRegistrationInput`, after `const tshirtSize = ...`:
```ts
  const category = clean(b.category).toLowerCase();
```
Add `category` to the required-presence check and validate the value — replace the t-shirt check block with one that also guards category:
```ts
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email) || !TSHIRT_SIZES.has(tshirtSize)) {
    return { ok: false, error: 'Please check your email and t-shirt size' };
  }
  if (category !== 'men' && category !== 'women') {
    return { ok: false, error: 'Please choose a race category' };
  }
```
Add `category,` to the returned `value` object (TypeScript narrows it to the union after the guard).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/registrationInput.test.ts src/app/api/registration/route.test.ts`
Expected: PASS (both files).

- [ ] **Step 5: Commit**

```bash
git add src/lib/registrationInput.ts src/lib/registrationInput.test.ts src/app/api/registration/route.test.ts
git commit -m "feat(registration): require men/women race category"
```

---

### Task 7: Schema (category column + waitlist table) + read helpers

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `src/app/api/registration/route.ts` (swap local schema fn for shared `ensureSchema`)
- Modify: `src/app/api/registration/route.test.ts` (add `ensureSchema` to the db mock)

- [ ] **Step 1: Add `ensureSchema` + helpers to db.ts**

In `src/lib/db.ts`, add the imports at the top:
```ts
import type { Caps, Category, CategoryAvailability } from './capacity';
```

Add a shared schema function (the authoritative runtime DDL, including the new `category` column and `waitlist` table):
```ts
export async function ensureSchema(sql: ReturnType<typeof getDb>) {
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT NOT NULL UNIQUE,
      club TEXT,
      nationality TEXT,
      tshirt_size TEXT,
      experience_level TEXT NOT NULL,
      accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
      accepted_awp_rules BOOLEAN NOT NULL DEFAULT FALSE,
      confirmed_over_18 BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_session_id TEXT,
      stripe_payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS first_name TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_name TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tshirt_size TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS accepted_awp_rules BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS confirmed_over_18 BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS category TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      nationality TEXT,
      tshirt_size TEXT,
      accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
      accepted_awp_rules BOOLEAN NOT NULL DEFAULT FALSE,
      confirmed_over_18 BOOLEAN NOT NULL DEFAULT FALSE,
      is_test BOOLEAN NOT NULL DEFAULT FALSE,
      confirmation_sent_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
```

Replace the body of `initDb` so it delegates (DRY):
```ts
export async function initDb() {
  await ensureSchema(getDb());
}
```

Add the availability helper (resilient — never breaks the page):
```ts
export async function getCategoryAvailability(caps: Caps): Promise<CategoryAvailability> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT category, count(*)::int AS n
      FROM registrations
      WHERE status = 'paid' AND category IN ('men','women')
      GROUP BY category
    `;
    const paid = { men: 0, women: 0 };
    for (const r of rows) {
      if (r.category === 'men') paid.men = r.n as number;
      else if (r.category === 'women') paid.women = r.n as number;
    }
    return {
      men: { paid: paid.men, cap: caps.men, full: paid.men >= caps.men },
      women: { paid: paid.women, cap: caps.women, full: paid.women >= caps.women },
    };
  } catch {
    return {
      men: { paid: 0, cap: caps.men, full: false },
      women: { paid: 0, cap: caps.women, full: false },
    };
  }
}
```

Add `category` to `RegistrationRecord` and `listRegistrations`:
- In the `RegistrationRecord` type add: `category: string | null;`
- In `listRegistrations`, add `category,` to the SELECT column list and `category: (r.category as string) ?? null,` to the mapped object.

Add a waitlist reader + test-data deletion for waitlist (used in Phase 4):
```ts
export type WaitlistRecord = {
  id: number;
  name: string;
  email: string;
  category: string;
  createdAt: string;
};

export async function listWaitlist(): Promise<WaitlistRecord[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, email, category, created_at
    FROM waitlist
    ORDER BY created_at ASC
    LIMIT 2000
  `;
  return rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    email: r.email as string,
    category: r.category as string,
    createdAt: String(r.created_at),
  }));
}

export async function deleteTestWaitlist(): Promise<number> {
  const sql = getDb();
  const rows = await sql`DELETE FROM waitlist WHERE is_test = TRUE RETURNING id`;
  return rows.length;
}
```

- [ ] **Step 2: Use `ensureSchema` in the registration route**

In `src/app/api/registration/route.ts`:
- Change the db import to: `import { getDb, ensureSchema } from '@/lib/db';`
- Delete the local `ensureRegistrationSchema` function (the whole `async function ensureRegistrationSchema(...) { ... }` block).
- Replace the call `await ensureRegistrationSchema(sql);` with `await ensureSchema(sql);`

- [ ] **Step 3: Keep the route test green (mock `ensureSchema`)**

In `src/app/api/registration/route.test.ts`, update the db mock:
```ts
vi.mock('@/lib/db', () => ({ getDb: vi.fn(), ensureSchema: vi.fn() }));
```

- [ ] **Step 4: Typecheck + full test run**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db.ts src/app/api/registration/route.ts src/app/api/registration/route.test.ts
git commit -m "feat(db): shared ensureSchema, category column, waitlist table + helpers"
```

---

# PHASE 2 — Waitlist email + route branching

### Task 8: `waitlist-email.ts` (TDD)

**Files:**
- Create: `src/lib/waitlist-email.ts`
- Test: `src/lib/waitlist-email.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/waitlist-email.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  buildWaitlistEmail,
  isWaitlistEmailEnabled,
  sendWaitlistEmail,
} from '@/lib/waitlist-email';

describe('isWaitlistEmailEnabled', () => {
  it('is disabled without RESEND_API_KEY', () => {
    expect(isWaitlistEmailEnabled({})).toBe(false);
  });
  it('is enabled with a key', () => {
    expect(isWaitlistEmailEnabled({ RESEND_API_KEY: 're_x' })).toBe(true);
  });
});

describe('buildWaitlistEmail', () => {
  const built = buildWaitlistEmail({ firstName: 'Anna', name: 'Anna Müller' });

  it('has the bilingual waiting-list subject', () => {
    expect(built.subject).toBe('Warteliste / Waiting list — OETZ TROPHY 2026');
  });
  it('greets by first name in both languages', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('Hallo Anna');
      expect(body).toContain('Hi Anna');
    }
  });
  it('states clearly that no payment was taken, in both languages', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('keine Zahlung');
      expect(body).toContain('No payment');
    }
  });
  it('escapes HTML in names (html body only)', () => {
    const b = buildWaitlistEmail({ firstName: '<b>X</b>', name: '<b>X</b>' });
    expect(b.html).not.toContain('<b>X</b>');
    expect(b.html).toContain('&lt;b&gt;X&lt;/b&gt;');
  });
});

describe('sendWaitlistEmail', () => {
  const env = { RESEND_API_KEY: 're_test_key' };
  const input = { firstName: 'Anna', name: 'Anna Müller' };

  it('POSTs the right shape to Resend and passes on 200', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await expect(sendWaitlistEmail('anna@example.com', input, env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['anna@example.com']);
    expect(body.subject).toContain('Waiting list');
  });

  it('fails closed on non-OK and network errors, and without key/recipient', async () => {
    const bad = vi.fn().mockResolvedValue(new Response('x', { status: 500 }));
    await expect(sendWaitlistEmail('a@b.co', input, env, bad)).resolves.toBe(false);
    const boom = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(sendWaitlistEmail('a@b.co', input, env, boom)).resolves.toBe(false);
    const noop = vi.fn();
    await expect(sendWaitlistEmail('', input, env, noop)).resolves.toBe(false);
    await expect(sendWaitlistEmail('a@b.co', input, {}, noop)).resolves.toBe(false);
    expect(noop).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/waitlist-email.test.ts`
Expected: FAIL — cannot find module `@/lib/waitlist-email`.

- [ ] **Step 3: Implement the module**

Create `src/lib/waitlist-email.ts`:

```ts
/**
 * Bilingual waiting-list email via Resend. Mirrors confirmation-email.ts:
 * config-symmetric (no RESEND_API_KEY → disabled) and best-effort (never blocks
 * the registration response). Sent inline when a full category diverts an entry
 * to the waiting list. No payment is involved.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'OETZ TROPHY <noreply@oetz-trophy.com>';
const REPLY_TO = 'info@oetz-trophy.com';

export type WaitlistEmailInput = { firstName: string | null; name: string };

export function isWaitlistEmailEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildWaitlistEmail(input: WaitlistEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const greetName = (input.firstName || '').trim() || input.name;
  const safeName = escapeHtml(greetName);

  const subject = 'Warteliste / Waiting list — OETZ TROPHY 2026';

  const text = [
    `Hallo ${greetName},`,
    '',
    'danke für dein Interesse am OETZ TROPHY Rennwochenende 2026. Aktuell sind alle Startplätze in deiner Wertung vergeben — du stehst jetzt auf der Warteliste.',
    '',
    'Es wurde keine Zahlung vorgenommen. Sobald ein Platz frei wird, melden wir uns per E-Mail mit dem Link zur Anmeldung.',
    '',
    'Wann: 17.–20. September 2026',
    'Wo: Oetz, Ötztal (Tirol)',
    'Fragen? info@oetz-trophy.com',
    '',
    'Wir hoffen, dich auf der Ötztaler Ache zu sehen!',
    '',
    '— — —',
    '',
    `Hi ${greetName},`,
    '',
    'thanks for your interest in the OETZ TROPHY race weekend 2026. All spots in your category are currently taken — you are now on the waiting list.',
    '',
    'No payment has been taken. As soon as a spot opens up, we will email you with the link to register.',
    '',
    'When: 17–20 September 2026',
    'Where: Oetz, Ötztal (Tyrol)',
    'Questions? info@oetz-trophy.com',
    '',
    'We hope to see you on the Ötztaler Ache!',
    '',
    'OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria',
  ].join('\n');

  const block = (lines: string[]) =>
    lines.map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;">${l}</p>`).join('');

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1c1917;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;letter-spacing:0.06em;">OETZ TROPHY</div>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-top:4px solid #f59e0b;padding:24px;">
      ${block([
        `Hallo ${safeName},`,
        'danke für dein Interesse am <strong>OETZ TROPHY Rennwochenende 2026</strong>. Aktuell sind alle Startplätze in deiner Wertung vergeben — du stehst jetzt auf der <strong>Warteliste</strong>.',
        'Es wurde <strong>keine Zahlung</strong> vorgenommen. Sobald ein Platz frei wird, melden wir uns per E-Mail mit dem Link zur Anmeldung.',
        '<strong>Wann:</strong> 17.–20. September 2026<br/><strong>Wo:</strong> Oetz, Ötztal (Tirol)',
        'Fragen? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
        'Wir hoffen, dich auf der Ötztaler Ache zu sehen!',
      ])}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;"/>
      ${block([
        `Hi ${safeName},`,
        'thanks for your interest in the <strong>OETZ TROPHY race weekend 2026</strong>. All spots in your category are currently taken — you are now on the <strong>waiting list</strong>.',
        '<strong>No payment</strong> has been taken. As soon as a spot opens up, we will email you with the link to register.',
        '<strong>When:</strong> 17–20 September 2026<br/><strong>Where:</strong> Oetz, Ötztal (Tyrol)',
        'Questions? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
        'We hope to see you on the Ötztaler Ache!',
      ])}
    </div>
    <p style="font-size:12px;color:#78716c;padding:14px 4px;margin:0;">OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendWaitlistEmail(
  to: string,
  input: WaitlistEmailInput,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!to || !apiKey) return false;
  try {
    const { subject, html, text } = buildWaitlistEmail(input);
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html, text }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/waitlist-email.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/waitlist-email.ts src/lib/waitlist-email.test.ts
git commit -m "feat(email): bilingual waiting-list confirmation email"
```

---

### Task 9: Capacity branch in the registration route (TDD)

**Files:**
- Modify: `src/app/api/registration/route.ts`
- Modify: `src/app/api/registration/route.test.ts`

- [ ] **Step 1: Add the failing tests**

In `src/app/api/registration/route.test.ts`:

Add the waitlist-email mock near the other `vi.mock` calls:
```ts
vi.mock('@/lib/waitlist-email', () => ({
  sendWaitlistEmail: vi.fn().mockResolvedValue(true),
  isWaitlistEmailEnabled: vi.fn().mockReturnValue(true),
}));
```
Add to the imports:
```ts
import { sendWaitlistEmail } from '@/lib/waitlist-email';
```
Add these cases inside `describe('POST /api/registration', ...)`:
```ts
  it('diverts to the waitlist (no Stripe) when the category is full', async () => {
    // count(*) for the category returns the cap (130 men) → full
    const sql = makeSql((text) =>
      text.includes("status = 'paid'") && text.includes('count(') ? [{ n: 130 }] :
      text.includes('INSERT INTO waitlist') ? [{ id: 7 }] : [],
    );
    vi.mocked(getDb).mockReturnValue(sql as never);
    const create = vi.fn();
    vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create } } } as never);

    const res = await POST(request(VALID_BODY));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ waitlisted: true });
    expect(create).not.toHaveBeenCalled();
    expect(ran(sql, 'INSERT INTO waitlist')).toBe(true);
    expect(sendWaitlistEmail).toHaveBeenCalledTimes(1);
  });

  it('does NOT resend the waitlist email when the entry already existed', async () => {
    const sql = makeSql((text) =>
      text.includes("status = 'paid'") && text.includes('count(') ? [{ n: 130 }] :
      text.includes('INSERT INTO waitlist') ? [] : [], // ON CONFLICT DO NOTHING → no row
    );
    vi.mocked(getDb).mockReturnValue(sql as never);
    const res = await POST(request(VALID_BODY));
    expect(await res.json()).toEqual({ waitlisted: true });
    expect(sendWaitlistEmail).not.toHaveBeenCalled();
  });

  it('proceeds to Stripe when the category still has space', async () => {
    const sql = makeSql((text) =>
      text.includes("status = 'paid'") && text.includes('count(') ? [{ n: 0 }] : [],
    );
    vi.mocked(getDb).mockReturnValue(sql as never);
    const create = vi.fn().mockResolvedValue({ id: 'cs_test_x', url: 'https://checkout.stripe.com/x' });
    vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create } } } as never);

    const res = await POST(request(VALID_BODY));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/x' });
    expect(ran(sql, 'INSERT INTO registrations')).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/api/registration/route.test.ts`
Expected: FAIL — route does not yet count/branch; `waitlisted` path missing.

- [ ] **Step 3: Implement the branch in the route**

In `src/app/api/registration/route.ts`:

Add imports:
```ts
import { resolveCaps, isCategoryFull } from '@/lib/capacity';
import { isWaitlistEmailEnabled, sendWaitlistEmail } from '@/lib/waitlist-email';
```

Destructure `category` from the parsed value:
```ts
    const { firstName, lastName, name, email, nationality, tshirtSize, category, acceptedTerms, acceptedAwpRules, confirmedOver18 } = parsed.value;
```

After `await ensureSchema(sql);` and the existing-registration `SELECT`, replace the block that currently runs from the `if (existing.length > 0) { ... }` upsert down to just before the Stripe session creation with:

```ts
    // Already paid? short-circuit before any capacity work.
    if (existing.length > 0 && existing[0].status === 'paid') {
      return NextResponse.json(
        { error: 'This email is already registered and paid', code: 'already_registered' },
        { status: 409 },
      );
    }

    // Capacity (paid-only) for the chosen category.
    const caps = resolveCaps(settings);
    const cap = category === 'men' ? caps.men : caps.women;
    const paidRows = await sql`
      SELECT count(*)::int AS n FROM registrations WHERE category = ${category} AND status = 'paid'
    `;
    const paidCount = (paidRows[0]?.n as number) ?? 0;

    if (isCategoryFull(paidCount, cap)) {
      // Full → waiting list. No pending row, no Stripe. Insert-if-new is idempotent.
      const inserted = await sql`
        INSERT INTO waitlist (
          name, first_name, last_name, email, category, nationality, tshirt_size,
          accepted_terms, accepted_awp_rules, confirmed_over_18, is_test
        )
        VALUES (
          ${name}, ${firstName}, ${lastName}, ${email}, ${category}, ${nationality}, ${tshirtSize},
          ${acceptedTerms}, ${acceptedAwpRules}, ${confirmedOver18}, ${isRegistrationTestMode()}
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      if (inserted.length > 0 && isWaitlistEmailEnabled()) {
        await sendWaitlistEmail(email, { firstName, name });
      }
      return NextResponse.json({ waitlisted: true });
    }

    // Space available → existing flow (now carrying category).
    if (existing.length > 0) {
      await sql`
        UPDATE registrations
        SET name = ${name}, first_name = ${firstName}, last_name = ${lastName}, club = NULL,
            nationality = ${nationality}, tshirt_size = ${tshirtSize}, category = ${category},
            experience_level = ${DEFAULT_EXPERIENCE_LEVEL},
            accepted_terms = ${acceptedTerms}, accepted_awp_rules = ${acceptedAwpRules},
            confirmed_over_18 = ${confirmedOver18}, updated_at = NOW()
        WHERE email = ${email}
      `;
    } else {
      await sql`
        INSERT INTO registrations (
          name, first_name, last_name, email, club, nationality, tshirt_size, category,
          experience_level, accepted_terms, accepted_awp_rules, confirmed_over_18
        )
        VALUES (
          ${name}, ${firstName}, ${lastName}, ${email}, NULL, ${nationality}, ${tshirtSize}, ${category},
          ${DEFAULT_EXPERIENCE_LEVEL}, ${acceptedTerms}, ${acceptedAwpRules}, ${confirmedOver18}
        )
      `;
    }
```

Add `category` to the Stripe `metadata` object:
```ts
        category,
```

`isRegistrationTestMode` is already imported in the route.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/api/registration/route.test.ts`
Expected: PASS (original cases + 3 new).

- [ ] **Step 5: Full suite + typecheck**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean; all green.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/registration/route.ts src/app/api/registration/route.test.ts
git commit -m "feat(registration): paid-only cap check with waiting-list fallback"
```

---

# PHASE 3 — Form, page, and i18n

### Task 10: Pass availability into the form (page)

**Files:**
- Modify: `src/app/[locale]/registration/page.tsx`

- [ ] **Step 1: Compute availability, render dynamically, pass props**

Rewrite `src/app/[locale]/registration/page.tsx`:

```tsx
import RegistrationForm from './RegistrationForm';
import { getSiteSettings } from '@/lib/settings';
import { getSiteImage } from '@/lib/siteContent';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';
import { getCategoryAvailability } from '@/lib/db';
import { resolveCaps } from '@/lib/capacity';

// Availability must be fresh during the opening rush; the server re-checks on submit regardless.
export const dynamic = 'force-dynamic';

export default async function RegistrationPage() {
  const [settings, headerImage] = await Promise.all([
    getSiteSettings(),
    getSiteImage('registration', '/images/event-boaterx.jpg', { width: 2000 }),
  ]);

  const availability = await getCategoryAvailability(resolveCaps(settings));

  const isTestMode = isRegistrationTestMode();
  const isOpen = isRegistrationOpen(settings.registrationOpensAt) || isTestMode;

  return (
    <RegistrationForm
      headerImage={headerImage}
      registrationOpensAt={settings.registrationOpensAt}
      registrationFeeEur={settings.registrationFeeEur}
      isOpen={isOpen}
      isTestMode={isTestMode}
      availability={availability}
    />
  );
}
```

- [ ] **Step 2: Typecheck (expected to fail until Task 11)**

Run: `npx tsc --noEmit`
Expected: FAIL — `RegistrationForm` does not yet accept `availability`. Proceed to Task 11 (they land together); do not commit yet.

---

### Task 11: Category radio + button switch + waitlist success (form)

**Files:**
- Modify: `src/app/[locale]/registration/RegistrationForm.tsx`

- [ ] **Step 1: Types, imports, state**

In `src/app/[locale]/registration/RegistrationForm.tsx`:

Add import:
```ts
import { isSelectedCategoryFull, type CategoryAvailability } from '@/lib/capacity';
```
Add to `Props`:
```ts
  availability: CategoryAvailability;
```
Add `availability` to the destructured params.
Add `category` to the form state initial object:
```ts
    category: '',
```
Add a waitlisted state near the other `useState`s:
```ts
  const [waitlisted, setWaitlisted] = useState(false);
```
Derive the full-state and label after `opensLabel`:
```ts
  const selectedFull = isSelectedCategoryFull(form.category, availability);
```

- [ ] **Step 2: Require category in `canSubmit`**

Add `form.category &&` to the `canSubmit` boolean (alongside the other required fields).

- [ ] **Step 3: Handle the waitlist response**

In `handleSubmit`, replace the success branch:
```ts
      if (data.waitlisted) {
        setWaitlisted(true);
        setSubmitting(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
```

- [ ] **Step 4: Add the category radio**

Inside the fields grid (after the t-shirt `<div className="md:col-span-2">…</div>` block, before the closing `</div>` of the grid), add:

```tsx
                    <div className="md:col-span-2">
                      <span style={labelStyle}>{t('categoryLabel')} *</span>
                      <div className="flex gap-3">
                        {(['men', 'women'] as const).map((value) => (
                          <label
                            key={value}
                            className="flex-1 flex items-center gap-3 border px-4 py-3.5 cursor-pointer"
                            style={{
                              borderColor: form.category === value ? 'var(--color-accent)' : 'var(--color-border)',
                              backgroundColor: form.category === value ? 'rgba(245,158,11,0.10)' : 'white',
                            }}
                          >
                            <input
                              type="radio"
                              name="category"
                              value={value}
                              required
                              checked={form.category === value}
                              onChange={(e) => setForm({ ...form, category: e.target.value })}
                              className="size-5"
                              style={{ accentColor: 'var(--color-accent)' }}
                            />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-ink)' }}>
                              {value === 'men' ? t('categoryMen') : t('categoryWomen')}
                            </span>
                          </label>
                        ))}
                      </div>
                      {selectedFull && (
                        <p className="mt-2" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#b45309' }}>
                          {t('categoryFullNote')}
                        </p>
                      )}
                    </div>
```

- [ ] **Step 5: Switch the button label + payment note**

Change the submit button label expression:
```tsx
                    {submitting ? t('submitting') : selectedFull ? t('joinWaitlist') : t('submit')}
```
Wrap the payment note so it hides on the waitlist path:
```tsx
                  {!selectedFull && (
                    <p
                      className="text-center mt-3"
                      style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-muted)' }}
                    >
                      {t('paymentNote', { fee: feeDisplay })}
                    </p>
                  )}
```

- [ ] **Step 6: Render the waitlist success state**

Immediately inside the `<form …>` (before the `{isTestMode && …}` line), add an early success panel by wrapping the existing form contents. Simplest: at the top of the `<form>` body add:
```tsx
                  {waitlisted ? (
                    <div className="py-8 text-center">
                      <p className="uppercase mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,38px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                        {t('waitlistSuccessTitle')}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--color-body-text)', maxWidth: '52ch', margin: '0 auto' }}>
                        {t('waitlistSuccessText')}
                      </p>
                    </div>
                  ) : (
                    <>
```
…and close the fragment + ternary right before `</form>`:
```tsx
                    </>
                  )}
```
(Wrap everything currently between those points — test banner, heading, fields, consents, error, turnstile, button, note — inside the `<>…</>`.)

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (page + form now agree on `availability`).

- [ ] **Step 8: Commit (page + form together)**

```bash
git add src/app/[locale]/registration/page.tsx src/app/[locale]/registration/RegistrationForm.tsx
git commit -m "feat(registration): category radio, waitlist button switch + success state"
```

---

### Task 12: i18n keys

**Files:**
- Modify: `messages/de.json`, `messages/en.json`

- [ ] **Step 1: Add keys under `registration`**

Add to the `registration` object in `messages/de.json`:
```json
    "categoryLabel": "Wertung",
    "categoryMen": "Herren",
    "categoryWomen": "Damen",
    "categoryFullNote": "Diese Wertung ist ausgebucht — du kannst dich auf die Warteliste setzen.",
    "joinWaitlist": "Auf die Warteliste",
    "waitlistSuccessTitle": "Du stehst auf der Warteliste",
    "waitlistSuccessText": "Aktuell sind alle Startplätze in deiner Wertung vergeben. Es wurde keine Zahlung vorgenommen. Wir melden uns per E-Mail, sobald ein Platz frei wird."
```
Add to the `registration` object in `messages/en.json`:
```json
    "categoryLabel": "Category",
    "categoryMen": "Men",
    "categoryWomen": "Women",
    "categoryFullNote": "This category is full — you can join the waiting list.",
    "joinWaitlist": "Join the waiting list",
    "waitlistSuccessTitle": "You're on the waiting list",
    "waitlistSuccessText": "All spots in your category are currently taken. No payment was taken. We'll email you as soon as a spot opens up."
```

- [ ] **Step 2: Build to validate messages parse + types**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds (next-intl message access compiles).

- [ ] **Step 3: Commit**

```bash
git add messages/de.json messages/en.json
git commit -m "i18n(registration): category + waiting-list copy"
```

---

# PHASE 4 — Admin waitlist view + extend cleanup

### Task 13: Extend delete-test to waitlist (TDD)

**Files:**
- Modify: `src/app/api/admin/delete-test/route.ts`
- Modify: `src/app/api/admin/delete-test/route.test.ts`

- [ ] **Step 1: Update the test**

In `src/app/api/admin/delete-test/route.test.ts`:
- Extend the db mock: `vi.mock('@/lib/db', () => ({ deleteTestRegistrations: vi.fn(), deleteTestWaitlist: vi.fn() }));`
- Add import: `import { deleteTestWaitlist } from '@/lib/db';`
- Update the authed test to also stub + assert the waitlist count:
```ts
    vi.mocked(deleteTestRegistrations).mockResolvedValue(3);
    vi.mocked(deleteTestWaitlist).mockResolvedValue(2);
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: { registrations: 3, waitlist: 2 } });
```
- In the unauthenticated test, also assert `expect(deleteTestWaitlist).not.toHaveBeenCalled();`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/admin/delete-test/route.test.ts`
Expected: FAIL — route returns only `{ registrations }`.

- [ ] **Step 3: Update the route**

In `src/app/api/admin/delete-test/route.ts`:
```ts
import { deleteTestRegistrations, deleteTestWaitlist } from '@/lib/db';
```
```ts
  const registrations = await deleteTestRegistrations();
  const waitlist = await deleteTestWaitlist();
  return NextResponse.json({ deleted: { registrations, waitlist } });
```

- [ ] **Step 4: Update the admin button feedback**

In `src/app/[locale]/admin/AdminActions.tsx`, update the success alert:
```tsx
      window.alert(`Deleted ${data?.deleted?.registrations ?? 0} registration(s) and ${data?.deleted?.waitlist ?? 0} waitlist row(s).`);
```

- [ ] **Step 5: Run test + typecheck**

Run: `npx vitest run src/app/api/admin/delete-test/route.test.ts && npx tsc --noEmit`
Expected: PASS; tsc clean.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/delete-test/route.ts src/app/api/admin/delete-test/route.test.ts src/app/[locale]/admin/AdminActions.tsx
git commit -m "feat(admin): delete-test also clears test waitlist rows"
```

---

### Task 14: Waitlist table on the admin page

**Files:**
- Modify: `src/app/[locale]/admin/page.tsx`

- [ ] **Step 1: Fetch + render the waitlist**

In `src/app/[locale]/admin/page.tsx`:
- Import: `import { listRegistrations, listWaitlist } from '@/lib/db';`
- After `const registrations = await listRegistrations();` add: `const waitlist = await listWaitlist();`
- After the closing `</div>` of the registrations table's `overflow-x-auto` wrapper, add a waitlist section:
```tsx
      <h2 className="uppercase mt-14 mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700 }}>
        Waiting list
      </h2>
      <p className="mb-4" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-body-text)' }}>
        {waitlist.length} total · {waitlist.filter((w) => w.category === 'men').length} men ·{' '}
        {waitlist.filter((w) => w.category === 'women').length} women
      </p>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Category</th>
              <th style={th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {waitlist.map((w) => (
              <tr key={w.id}>
                <td style={td}>{w.id}</td>
                <td style={td}>{w.name}</td>
                <td style={td}>{w.email}</td>
                <td style={td}>{w.category}</td>
                <td style={td}>{new Date(w.createdAt).toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/admin/page.tsx
git commit -m "feat(admin): waiting-list table view"
```

---

# PHASE 5 — Verification & rollout

### Task 15: Full suite + preview E2E

- [ ] **Step 1: Green suite + typecheck + build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: tsc clean, all tests pass, build succeeds.

- [ ] **Step 2: Deploy to preview**

Push `preview`; confirm the Vercel preview deploy is READY.

- [ ] **Step 3: Drive the paths on preview (Playwright + bypass cookie)**

To exercise "full" without 130 rows, set a tiny cap on preview — either set `maxMen`/`maxWomen` in the preview Sanity dataset, or temporarily lower `DEFAULT_CAPS` behind a preview-only env if Sanity isn't convenient. Then verify, with `peter@flowst8.eu` test data:
  1. **Open category:** select Men (cap not reached) → button reads "Register & Pay" → pay with test card 4242 → success → admin shows the paid row with `category = men`.
  2. **Full category:** with the men cap reached, a new Men entry → button reads "Join the waiting list", payment note hidden → submit → inline "You're on the waiting list" → waitlist email received → admin waiting-list table shows the row.
  3. **Independence:** Women still shows "Register & Pay".
  4. **Cleanup:** admin "Delete test data" removes the `cs_test_` registration(s) and the test waitlist row(s); both tables read 0 test rows.

- [ ] **Step 4: Reset preview caps**

Restore `maxMen`/`maxWomen` (or remove the temporary env) so preview reflects production caps.

### Task 16: Production rollout (requires Peter's go-ahead)

- [ ] **Step 1: Merge per established flow**

With Peter's explicit authorization, fast-forward `preview → main`, confirm the production deploy is READY, and spot-check `/de/registration` (category radio present, button correct) and `/de/admin` (waiting-list table present).

- [ ] **Step 2: Confirm the caps are live**

Verify production `getSiteSettings` resolves caps (Studio values if the client set them, else 130/50) and that the registration page renders without error.

---

## Self-Review

**Spec coverage**
- Test cleanup → Phase 0 (Tasks 1–3) + extended in Task 13. ✓
- `category` field (Men/Women) → Tasks 6 (input), 7 (column), 11 (form), 12 (i18n). ✓
- Caps 130/50, paid-only, code default + Studio override → Tasks 4, 5, 9. ✓
- Full → waitlist (no payment), bilingual email, server-authoritative → Tasks 8, 9. ✓
- Waitlist table (full fields + consents, `is_test`) → Task 7. ✓
- Admin waitlist view → Task 14. ✓
- Button switch + waitlist success UX → Task 11. ✓
- Tests (capacity, input, route, email) → Tasks 4, 6, 8, 9. ✓
- Non-goal (no auto-promotion) → not implemented, by design. ✓

**Placeholder scan:** none — every code step contains the full content. ✓

**Type consistency:** `Category`/`Caps`/`CategoryAvailability` defined in Task 4 and reused in db.ts (Task 7), route (Task 9), page (Task 10), form (Task 11). `deleteTestRegistrations` (Task 1) / `deleteTestWaitlist` (Task 7, used Task 13), `listWaitlist`/`WaitlistRecord` (Task 7, used Task 14), `ensureSchema` (Task 7) consistent throughout. The `valid`/`VALID_BODY` fixtures gain `category` in Task 6 before category becomes required. ✓

**Note for executor:** the registration route and its test are touched in Tasks 6, 7, and 9 — apply them in order; each keeps the suite green.
