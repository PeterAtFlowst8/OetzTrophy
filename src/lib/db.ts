import { neon } from '@neondatabase/serverless';
import type { Caps, CategoryAvailability } from './capacity';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

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
  // Pending-sweep bookkeeping (additive only — metadata-only DDL, no rewrite/lock).
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMP WITH TIME ZONE`;
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
  await sql`
    CREATE TABLE IF NOT EXISTS volunteers (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      tshirt_size TEXT,
      roles TEXT[] NOT NULL DEFAULT '{}',
      availability TEXT[] NOT NULL DEFAULT '{}',
      other_help TEXT,
      experience TEXT,
      accepted_age BOOLEAN NOT NULL DEFAULT FALSE,
      accepted_consent BOOLEAN NOT NULL DEFAULT FALSE,
      is_test BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

export async function initDb() {
  await ensureSchema(getDb());
}

export type RegistrationRecord = {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  nationality: string | null;
  tshirtSize: string | null;
  category: string | null;
  status: string;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export async function listRegistrations(): Promise<RegistrationRecord[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, name, first_name, last_name, email, nationality, tshirt_size,
           category, status, stripe_session_id, stripe_payment_id, created_at, updated_at
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
    category: (r.category as string) ?? null,
    status: r.status as string,
    stripeSessionId: (r.stripe_session_id as string) ?? null,
    stripePaymentId: (r.stripe_payment_id as string) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

export async function getCategoryAvailability(
  caps: Caps,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<CategoryAvailability> {
  try {
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

// ─── Pending-sweep helpers ──────────────────────────────────────────────────
// All take an injectable `sql` (default getDb()) so they're unit-testable with a
// fake tagged-template. Status mutations are guarded so a `paid` row can never be
// expired, cancelled, or re-paid — the live-site safety invariants.

export type PendingRegistration = {
  id: number;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  nationality: string | null;
  tshirtSize: string | null;
  category: string | null;
  stripeSessionId: string | null;
  createdAt: string;
  reminderCount: number;
  lastReminderAt: string | null;
};

export async function listPendingRegistrations(
  sql: ReturnType<typeof getDb> = getDb(),
  limit = 500,
): Promise<PendingRegistration[]> {
  const rows = await sql`
    SELECT id, email, name, first_name, last_name, nationality, tshirt_size, category,
           stripe_session_id, created_at, reminder_count, last_reminder_at
    FROM registrations
    WHERE status = 'pending'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id as number,
    email: r.email as string,
    name: r.name as string,
    firstName: (r.first_name as string) ?? null,
    lastName: (r.last_name as string) ?? null,
    nationality: (r.nationality as string) ?? null,
    tshirtSize: (r.tshirt_size as string) ?? null,
    category: (r.category as string) ?? null,
    stripeSessionId: (r.stripe_session_id as string) ?? null,
    createdAt: String(r.created_at),
    reminderCount: Number(r.reminder_count ?? 0),
    lastReminderAt: r.last_reminder_at ? String(r.last_reminder_at) : null,
  }));
}

export type RegistrationById = {
  id: number;
  email: string;
  status: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  nationality: string | null;
  tshirtSize: string | null;
  category: string | null;
  stripeSessionId: string | null;
};

export async function getRegistrationById(
  id: number,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<RegistrationById | null> {
  const rows = await sql`
    SELECT id, email, status, name, first_name, last_name, nationality, tshirt_size,
           category, stripe_session_id
    FROM registrations WHERE id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id as number,
    email: r.email as string,
    status: r.status as string,
    name: r.name as string,
    firstName: (r.first_name as string) ?? null,
    lastName: (r.last_name as string) ?? null,
    nationality: (r.nationality as string) ?? null,
    tshirtSize: (r.tshirt_size as string) ?? null,
    category: (r.category as string) ?? null,
    stripeSessionId: (r.stripe_session_id as string) ?? null,
  };
}

/**
 * Atomic, optimistic reminder claim: increments only if the row is still pending
 * AND its reminder_count still equals what the caller saw — so two concurrent
 * sweeps can never both send the same reminder. Returns true iff this call won.
 */
export async function claimReminder(
  id: number,
  expectedCount: number,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<boolean> {
  const rows = await sql`
    UPDATE registrations
    SET reminder_count = reminder_count + 1, last_reminder_at = NOW()
    WHERE id = ${id} AND status = 'pending' AND reminder_count = ${expectedCount}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function markRegistrationExpired(
  id: number,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<boolean> {
  const rows = await sql`
    UPDATE registrations SET status = 'expired', updated_at = NOW()
    WHERE id = ${id} AND status = 'pending'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function markRegistrationCancelled(
  id: number,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<boolean> {
  const rows = await sql`
    UPDATE registrations SET status = 'cancelled', updated_at = NOW()
    WHERE id = ${id} AND status <> 'paid'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function markRegistrationPaidById(
  id: number,
  paymentId: string | null,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<boolean> {
  const rows = await sql`
    UPDATE registrations
    SET status = 'paid', stripe_payment_id = ${paymentId}, updated_at = NOW()
    WHERE id = ${id} AND status <> 'paid'
    RETURNING id
  `;
  return rows.length > 0;
}

export type ConfirmationClaim = {
  id: number;
  email: string;
  firstName: string | null;
  name: string;
};

/** Atomic claim of the confirmation email for a row; null if already sent. */
export async function claimConfirmation(
  id: number,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<ConfirmationClaim | null> {
  const rows = await sql`
    UPDATE registrations SET confirmation_sent_at = NOW()
    WHERE id = ${id} AND confirmation_sent_at IS NULL
    RETURNING id, email, first_name, name
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id as number,
    email: r.email as string,
    firstName: (r.first_name as string) ?? null,
    name: r.name as string,
  };
}

/** Release a confirmation claim so a later delivery can retry the email. */
export async function releaseConfirmationClaim(
  id: number,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<void> {
  await sql`UPDATE registrations SET confirmation_sent_at = NULL WHERE id = ${id}`;
}

/** Re-attach a freshly-minted Checkout session and re-activate the row to pending. */
export async function setRegistrationSessionId(
  id: number,
  sessionId: string,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<boolean> {
  const rows = await sql`
    UPDATE registrations
    SET stripe_session_id = ${sessionId}, status = 'pending', updated_at = NOW()
    WHERE id = ${id} AND status <> 'paid'
    RETURNING id
  `;
  return rows.length > 0;
}

// ─── Volunteers ─────────────────────────────────────────────────────────────
// Public volunteer signups. Unlike registrations there is no payment/capacity:
// a row is captured, organisers are emailed, and it surfaces in the admin table.
// `roles` and `availability` hold STABLE keys (e.g. 'media', 'sat'), never the
// localized labels — the UI maps keys → DE/EN labels at render time.

export type VolunteerInsert = {
  firstName: string;
  lastName: string;
  email: string;
  tshirtSize: string | null;
  roles: string[];
  availability: string[];
  otherHelp: string | null;
  experience: string | null;
  acceptedAge: boolean;
  acceptedConsent: boolean;
  isTest?: boolean;
};

export async function insertVolunteer(
  input: VolunteerInsert,
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<number> {
  const rows = await sql`
    INSERT INTO volunteers (
      first_name, last_name, email, tshirt_size, roles, availability,
      other_help, experience, accepted_age, accepted_consent, is_test
    )
    VALUES (
      ${input.firstName}, ${input.lastName}, ${input.email}, ${input.tshirtSize},
      ${input.roles}, ${input.availability}, ${input.otherHelp}, ${input.experience},
      ${input.acceptedAge}, ${input.acceptedConsent}, ${input.isTest ?? false}
    )
    RETURNING id
  `;
  return rows[0].id as number;
}

export type VolunteerRecord = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tshirtSize: string | null;
  roles: string[];
  availability: string[];
  otherHelp: string | null;
  experience: string | null;
  acceptedAge: boolean;
  acceptedConsent: boolean;
  isTest: boolean;
  status: string;
  createdAt: string;
};

export async function listVolunteers(
  sql: ReturnType<typeof getDb> = getDb(),
): Promise<VolunteerRecord[]> {
  const rows = await sql`
    SELECT id, first_name, last_name, email, tshirt_size, roles, availability,
           other_help, experience, accepted_age, accepted_consent, is_test, status, created_at
    FROM volunteers
    ORDER BY created_at DESC
    LIMIT 2000
  `;
  return rows.map((r) => ({
    id: r.id as number,
    firstName: r.first_name as string,
    lastName: r.last_name as string,
    email: r.email as string,
    tshirtSize: (r.tshirt_size as string) ?? null,
    roles: (r.roles as string[]) ?? [],
    availability: (r.availability as string[]) ?? [],
    otherHelp: (r.other_help as string) ?? null,
    experience: (r.experience as string) ?? null,
    acceptedAge: Boolean(r.accepted_age),
    acceptedConsent: Boolean(r.accepted_consent),
    isTest: Boolean(r.is_test),
    status: r.status as string,
    createdAt: String(r.created_at),
  }));
}

/** Delete volunteer rows captured in test mode (the admin "delete test data" action). */
export async function deleteTestVolunteers(): Promise<number> {
  const sql = getDb();
  const rows = await sql`DELETE FROM volunteers WHERE is_test = TRUE RETURNING id`;
  return rows.length;
}
