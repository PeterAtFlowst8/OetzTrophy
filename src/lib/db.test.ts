import { describe, expect, it } from 'vitest';
import {
  ensureSchema,
  listPendingRegistrations,
  getRegistrationById,
  claimReminder,
  markRegistrationExpired,
  markRegistrationCancelled,
  markRegistrationPaidById,
  claimConfirmation,
  setRegistrationSessionId,
  getCategoryAvailability,
  insertVolunteer,
  listVolunteers,
} from './db';

/** Records every query and returns rows from an optional handler (see route tests). */
function makeSql(handler?: (text: string) => unknown[]) {
  const calls: { text: string }[] = [];
  const fn = (strings: TemplateStringsArray, ...values: unknown[]) => {
    void values;
    const text = Array.from(strings).join('?');
    calls.push({ text });
    return Promise.resolve(handler ? handler(text) : []);
  };
  (fn as unknown as { calls: { text: string }[] }).calls = calls;
  return fn;
}
function ran(sql: ReturnType<typeof makeSql>, fragment: string): boolean {
  return (sql as unknown as { calls: { text: string }[] }).calls.some((c) => c.text.includes(fragment));
}

describe('ensureSchema', () => {
  it('adds the additive reminder columns (no destructive DDL)', async () => {
    const sql = makeSql();
    await ensureSchema(sql as never);
    expect(ran(sql, 'ADD COLUMN IF NOT EXISTS reminder_count')).toBe(true);
    expect(ran(sql, 'ADD COLUMN IF NOT EXISTS last_reminder_at')).toBe(true);
    // Guard against accidental destructive DDL creeping in.
    expect(ran(sql, 'DROP COLUMN')).toBe(false);
    expect(ran(sql, 'DROP TABLE')).toBe(false);
  });
  it('creates the volunteers table', async () => {
    const sql = makeSql();
    await ensureSchema(sql as never);
    expect(ran(sql, 'CREATE TABLE IF NOT EXISTS volunteers')).toBe(true);
  });
});

describe('capacity regression lock', () => {
  it('counts ONLY paid rows toward category availability', async () => {
    const sql = makeSql(() => []);
    await getCategoryAvailability({ men: 130, women: 50 }, sql as never);
    expect(ran(sql, "status = 'paid'")).toBe(true);
  });
});

describe('listPendingRegistrations', () => {
  it('selects only pending rows and maps them', async () => {
    const sql = makeSql((text) =>
      text.includes("status = 'pending'")
        ? [{ id: 5, email: 'a@b.co', name: 'A B', first_name: 'A', last_name: 'B', nationality: 'AT', tshirt_size: 'M', category: 'men', stripe_session_id: 'cs_1', created_at: '2026-06-17T00:00:00Z', reminder_count: 1, last_reminder_at: null }]
        : [],
    );
    const rows = await listPendingRegistrations(sql as never);
    expect(ran(sql, "status = 'pending'")).toBe(true);
    expect(rows[0]).toMatchObject({ id: 5, email: 'a@b.co', stripeSessionId: 'cs_1', reminderCount: 1 });
  });
});

describe('getRegistrationById', () => {
  it('returns the mapped row or null', async () => {
    const found = makeSql((text) => (text.includes('WHERE id =') ? [{ id: 9, email: 'a@b.co', status: 'pending', name: 'A', first_name: 'A', last_name: null, nationality: null, tshirt_size: null, category: 'men', stripe_session_id: null }] : []));
    expect(await getRegistrationById(9, found as never)).toMatchObject({ id: 9, status: 'pending' });
    const none = makeSql(() => []);
    expect(await getRegistrationById(9, none as never)).toBeNull();
  });
});

describe('claimReminder (atomic, optimistic on reminder_count)', () => {
  it('increments guarded by status=pending AND the expected count, RETURNING', async () => {
    const sql = makeSql((text) => (text.includes('reminder_count = reminder_count + 1') ? [{ id: 3 }] : []));
    expect(await claimReminder(3, 0, sql as never)).toBe(true);
    expect(ran(sql, "status = 'pending'")).toBe(true);
    expect(ran(sql, 'reminder_count = reminder_count + 1')).toBe(true);
    expect(ran(sql, 'RETURNING')).toBe(true);
  });
  it('returns false when the optimistic claim matched no row', async () => {
    const sql = makeSql(() => []);
    expect(await claimReminder(3, 0, sql as never)).toBe(false);
  });
});

describe('markRegistrationExpired', () => {
  it("sets status='expired' guarded by status='pending'", async () => {
    const sql = makeSql((text) => (text.includes("status = 'expired'") ? [{ id: 1 }] : []));
    expect(await markRegistrationExpired(1, sql as never)).toBe(true);
    expect(ran(sql, "status = 'expired'")).toBe(true);
    expect(ran(sql, "status = 'pending'")).toBe(true); // never expire a paid row
  });
});

describe('markRegistrationCancelled', () => {
  it("sets status='cancelled' and never touches a paid row", async () => {
    const sql = makeSql((text) => (text.includes("status = 'cancelled'") ? [{ id: 1 }] : []));
    expect(await markRegistrationCancelled(1, sql as never)).toBe(true);
    expect(ran(sql, "status = 'cancelled'")).toBe(true);
    expect(ran(sql, "status <> 'paid'")).toBe(true);
  });
});

describe('markRegistrationPaidById', () => {
  it("flips to paid with the payment id, guarded against re-paying", async () => {
    const sql = makeSql((text) => (text.includes("status = 'paid'") ? [{ id: 2 }] : []));
    expect(await markRegistrationPaidById(2, 'pi_9', sql as never)).toBe(true);
    expect(ran(sql, "status = 'paid'")).toBe(true);
    expect(ran(sql, "status <> 'paid'")).toBe(true);
  });
});

describe('claimConfirmation', () => {
  it('atomically claims via confirmation_sent_at IS NULL and returns the row', async () => {
    const sql = makeSql((text) =>
      text.includes('confirmation_sent_at = NOW()') ? [{ id: 4, email: 'a@b.co', first_name: 'A', name: 'A B' }] : [],
    );
    expect(await claimConfirmation(4, sql as never)).toMatchObject({ id: 4, email: 'a@b.co' });
    expect(ran(sql, 'confirmation_sent_at IS NULL')).toBe(true);
  });
  it('returns null when already claimed', async () => {
    expect(await claimConfirmation(4, makeSql(() => []) as never)).toBeNull();
  });
});

describe('setRegistrationSessionId (resume)', () => {
  it("stores the new session id and re-activates to pending, never on a paid row", async () => {
    const sql = makeSql((text) => (text.includes('stripe_session_id =') ? [{ id: 6 }] : []));
    expect(await setRegistrationSessionId(6, 'cs_new', sql as never)).toBe(true);
    expect(ran(sql, 'stripe_session_id =')).toBe(true);
    expect(ran(sql, "status = 'pending'")).toBe(true);
    expect(ran(sql, "status <> 'paid'")).toBe(true);
  });
});

describe('insertVolunteer', () => {
  it('inserts into volunteers and returns the new id', async () => {
    const sql = makeSql((text) => (text.includes('INSERT INTO volunteers') ? [{ id: 42 }] : []));
    const id = await insertVolunteer(
      {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        tshirtSize: 'M',
        roles: ['media', 'safety'],
        availability: ['sat', 'sun'],
        otherHelp: null,
        experience: 'Rescue training',
        acceptedAge: true,
        acceptedConsent: true,
        isTest: true,
      },
      sql as never,
    );
    expect(id).toBe(42);
    expect(ran(sql, 'INSERT INTO volunteers')).toBe(true);
    expect(ran(sql, 'RETURNING id')).toBe(true);
  });
});

describe('listVolunteers', () => {
  it('selects from volunteers and maps array + boolean columns', async () => {
    const sql = makeSql((text) =>
      text.includes('FROM volunteers')
        ? [
            {
              id: 1,
              first_name: 'Ada',
              last_name: 'Lovelace',
              email: 'ada@example.com',
              tshirt_size: 'M',
              roles: ['media', 'safety'],
              availability: ['sat'],
              other_help: null,
              experience: null,
              accepted_age: true,
              accepted_consent: true,
              is_test: false,
              status: 'new',
              created_at: '2026-06-25T00:00:00Z',
            },
          ]
        : [],
    );
    const rows = await listVolunteers(sql as never);
    expect(ran(sql, 'FROM volunteers')).toBe(true);
    expect(rows[0]).toMatchObject({
      id: 1,
      firstName: 'Ada',
      email: 'ada@example.com',
      roles: ['media', 'safety'],
      availability: ['sat'],
      acceptedConsent: true,
      status: 'new',
    });
  });
});
