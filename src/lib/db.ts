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
      email TEXT NOT NULL UNIQUE,
      club TEXT,
      nationality TEXT,
      experience_level TEXT NOT NULL,
      stripe_session_id TEXT,
      stripe_payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS event_type TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMP WITH TIME ZONE`;
}
