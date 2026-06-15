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
