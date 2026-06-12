import { neon } from '@neondatabase/serverless';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export async function initDb() {
  const sql = getDb();
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
}

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
