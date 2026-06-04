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
