import { neon } from '@neondatabase/serverless';

export const REGISTRATION_STATUSES = ['pending', 'paid', 'test_confirmed', 'cancelled', 'refunded'] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export type RegistrationRecord = {
  id: number;
  name: string;
  email: string;
  club: string | null;
  nationality: string | null;
  experienceLevel: string;
  eventType: string | null;
  waiverAccepted: boolean;
  waiverAcceptedAt: string | null;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  status: RegistrationStatus;
  adminNotes: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationSummary = {
  total: number;
  byStatus: Record<RegistrationStatus, number>;
};

type RegistrationInput = {
  name: string;
  email: string;
  club?: string | null;
  nationality?: string | null;
  experienceLevel: string;
  eventType: string;
  waiverAccepted: boolean;
};

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for registration storage');
  }

  const sql = neon(process.env.DATABASE_URL);
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
      event_type TEXT,
      stripe_session_id TEXT,
      stripe_payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      checked_in BOOLEAN NOT NULL DEFAULT FALSE,
      checked_in_at TIMESTAMP WITH TIME ZONE,
      waiver_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      waiver_accepted_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS event_type TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMP WITH TIME ZONE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS admin_notes TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE`;
  await sql`CREATE INDEX IF NOT EXISTS registrations_status_idx ON registrations (status)`;
  await sql`CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON registrations (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS registrations_stripe_session_idx ON registrations (stripe_session_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS stripe_webhook_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}

function normalizeDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function normalizeStatus(value: unknown): RegistrationStatus {
  const status = String(value);
  return REGISTRATION_STATUSES.includes(status as RegistrationStatus) ? status as RegistrationStatus : 'pending';
}

function mapRegistration(row: any): RegistrationRecord {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    club: row.club ?? null,
    nationality: row.nationality ?? null,
    experienceLevel: String(row.experience_level),
    eventType: row.event_type ?? null,
    waiverAccepted: Boolean(row.waiver_accepted),
    waiverAcceptedAt: normalizeDate(row.waiver_accepted_at),
    stripeSessionId: row.stripe_session_id ?? null,
    stripePaymentId: row.stripe_payment_id ?? null,
    status: normalizeStatus(row.status),
    adminNotes: row.admin_notes ?? null,
    checkedIn: Boolean(row.checked_in),
    checkedInAt: normalizeDate(row.checked_in_at),
    createdAt: normalizeDate(row.created_at) ?? '',
    updatedAt: normalizeDate(row.updated_at) ?? '',
  };
}

export function isRegistrationStatus(value: string): value is RegistrationStatus {
  return REGISTRATION_STATUSES.includes(value as RegistrationStatus);
}

export async function getRegistrationByEmail(email: string) {
  await initDb();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM registrations WHERE email = ${email.toLowerCase()} LIMIT 1
  `;

  return rows[0] ? mapRegistration(rows[0]) : null;
}

export async function upsertPendingRegistration(input: RegistrationInput) {
  await initDb();
  const sql = getDb();
  const email = input.email.toLowerCase();
  const existingRows = await sql`
    SELECT * FROM registrations WHERE email = ${email} LIMIT 1
  `;
  const existing = existingRows[0] ? mapRegistration(existingRows[0]) : null;

  if (existing?.status === 'paid') {
    return { registration: existing, alreadyPaid: true };
  }

  const rows = await sql`
    INSERT INTO registrations (
      name,
      email,
      club,
      nationality,
      experience_level,
      event_type,
      waiver_accepted,
      waiver_accepted_at
    )
    VALUES (
      ${input.name},
      ${email},
      ${input.club || null},
      ${input.nationality || null},
      ${input.experienceLevel},
      ${input.eventType},
      ${input.waiverAccepted},
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          club = EXCLUDED.club,
          nationality = EXCLUDED.nationality,
          experience_level = EXCLUDED.experience_level,
          event_type = EXCLUDED.event_type,
          waiver_accepted = EXCLUDED.waiver_accepted,
          waiver_accepted_at = NOW(),
          status = CASE WHEN registrations.status = 'test_confirmed' THEN 'test_confirmed' ELSE 'pending' END,
          updated_at = NOW()
    RETURNING *
  `;

  return { registration: mapRegistration(rows[0]), alreadyPaid: false };
}

export async function attachStripeSession(registrationId: number, stripeSessionId: string) {
  await initDb();
  const sql = getDb();

  await sql`
    UPDATE registrations
    SET stripe_session_id = ${stripeSessionId}, updated_at = NOW()
    WHERE id = ${registrationId}
  `;
}

export async function confirmTestRegistration(email: string) {
  await initDb();
  const sql = getDb();

  await sql`
    UPDATE registrations
    SET status = 'test_confirmed', stripe_session_id = 'preproduction-test', updated_at = NOW()
    WHERE email = ${email.toLowerCase()}
  `;
}

export async function recordStripeWebhookEvent(eventId: string, eventType: string) {
  await initDb();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO stripe_webhook_events (id, type)
    VALUES (${eventId}, ${eventType})
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;

  return rows.length > 0;
}

export async function confirmRegistrationPayment(stripeSessionId: string, stripePaymentId: string | null) {
  await initDb();
  const sql = getDb();
  const rows = await sql`
    UPDATE registrations
    SET status = 'paid',
        stripe_payment_id = ${stripePaymentId},
        updated_at = NOW()
    WHERE stripe_session_id = ${stripeSessionId}
    RETURNING id
  `;

  return rows.length > 0;
}

export async function listRegistrations(filters: {
  search?: string;
  status?: RegistrationStatus;
  limit?: number;
} = {}) {
  await initDb();
  const sql = getDb();
  const limit = Math.min(Math.max(filters.limit ?? 500, 1), 1000);
  const search = filters.search?.trim();
  const pattern = search ? `%${search}%` : null;

  const rows = filters.status && pattern
    ? await sql`
        SELECT * FROM registrations
        WHERE status = ${filters.status}
          AND (name ILIKE ${pattern} OR email ILIKE ${pattern} OR club ILIKE ${pattern} OR nationality ILIKE ${pattern})
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    : filters.status
      ? await sql`
          SELECT * FROM registrations
          WHERE status = ${filters.status}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : pattern
        ? await sql`
            SELECT * FROM registrations
            WHERE name ILIKE ${pattern} OR email ILIKE ${pattern} OR club ILIKE ${pattern} OR nationality ILIKE ${pattern}
            ORDER BY created_at DESC
            LIMIT ${limit}
          `
        : await sql`
            SELECT * FROM registrations
            ORDER BY created_at DESC
            LIMIT ${limit}
          `;

  return rows.map(mapRegistration);
}

export async function getRegistrationSummary(): Promise<RegistrationSummary> {
  await initDb();
  const sql = getDb();
  const rows = await sql`
    SELECT status, COUNT(*) AS count
    FROM registrations
    GROUP BY status
  `;
  const byStatus = Object.fromEntries(REGISTRATION_STATUSES.map((status) => [status, 0])) as Record<RegistrationStatus, number>;

  for (const row of rows) {
    const status = normalizeStatus(row.status);
    byStatus[status] = Number(row.count);
  }

  return {
    total: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
    byStatus,
  };
}

export async function updateRegistrationAdminFields(input: {
  id: number;
  status: RegistrationStatus;
  adminNotes: string | null;
  checkedIn: boolean;
}) {
  await initDb();
  const sql = getDb();

  await sql`
    UPDATE registrations
    SET status = ${input.status},
        admin_notes = ${input.adminNotes},
        checked_in = ${input.checkedIn},
        checked_in_at = CASE
          WHEN ${input.checkedIn} THEN COALESCE(checked_in_at, NOW())
          ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = ${input.id}
  `;
}
