import { describe, expect, it, vi } from 'vitest';
import { runPendingSweep } from './pending-sweep';

const HOUR = 3600_000;
const NOW = 1_750_000_000_000; // fixed clock

/**
 * Fake `sql` that serves the pending-list SELECT from `rows` and lets each test
 * decide what the guarded UPDATEs return (a row = the guard matched). Records all
 * queries so we can assert which mutations ran (and, for dry-run, which did NOT).
 */
function makeSql(rows: unknown[], updateResult: (text: string) => unknown[] = () => [{ id: 1 }]) {
  const calls: { text: string }[] = [];
  const fn = (strings: TemplateStringsArray, ...values: unknown[]) => {
    void values;
    const text = Array.from(strings).join('?');
    calls.push({ text });
    if (text.includes('ORDER BY created_at ASC')) return Promise.resolve(rows);
    return Promise.resolve(updateResult(text));
  };
  (fn as unknown as { calls: { text: string }[] }).calls = calls;
  return fn;
}
function ran(sql: ReturnType<typeof makeSql>, fragment: string): boolean {
  return (sql as unknown as { calls: { text: string }[] }).calls.some((c) => c.text.includes(fragment));
}

function pendingRow(over: Record<string, unknown> = {}) {
  return {
    id: 5,
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    first_name: 'Ada',
    last_name: 'Lovelace',
    nationality: 'GB',
    tshirt_size: 'M',
    category: 'women',
    stripe_session_id: 'cs_1',
    created_at: new Date(NOW - 2 * HOUR).toISOString(),
    reminder_count: 0,
    last_reminder_at: null,
    ...over,
  };
}

function stripeReturning(session: unknown, retrieve = vi.fn().mockResolvedValue(session)) {
  return { stripe: { checkout: { sessions: { retrieve } } }, retrieve };
}

function baseDeps(over: Record<string, unknown> = {}) {
  return {
    nowMs: NOW,
    siteUrl: 'https://x.test',
    signToken: (id: number) => `TK${id}`,
    reminderEnabled: true,
    confirmationEnabled: true,
    sendReminder: vi.fn().mockResolvedValue(true),
    sendConfirmation: vi.fn().mockResolvedValue(true),
    ...over,
  };
}

describe('runPendingSweep — reconcile against Stripe (source of truth)', () => {
  it('flips a genuinely-paid row to paid and sends the confirmation once', async () => {
    const sql = makeSql([pendingRow()]);
    const { stripe } = stripeReturning({ payment_status: 'paid', status: 'complete', payment_intent: 'pi_9' });
    const deps = baseDeps();

    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });

    expect(summary.reconciledPaid).toBe(1);
    expect(ran(sql, "status = 'paid'")).toBe(true);
    expect(deps.sendConfirmation).toHaveBeenCalledTimes(1);
    expect(deps.sendReminder).not.toHaveBeenCalled();
  });

  it('does not send a confirmation when the claim was already taken', async () => {
    const sql = makeSql([pendingRow()], (text) =>
      text.includes('confirmation_sent_at = NOW()') ? [] : [{ id: 1 }],
    );
    const { stripe } = stripeReturning({ payment_status: 'paid', payment_intent: 'pi_9' });
    const deps = baseDeps();

    await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });
    expect(deps.sendConfirmation).not.toHaveBeenCalled();
  });

  it('releases the confirmation claim when the email send fails', async () => {
    const sql = makeSql([pendingRow()]);
    const { stripe } = stripeReturning({ payment_status: 'paid', payment_intent: 'pi_9' });
    const deps = baseDeps({ sendConfirmation: vi.fn().mockResolvedValue(false) });

    await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });
    expect(ran(sql, 'confirmation_sent_at = NULL')).toBe(true);
  });

  it('treats a Stripe retrieve error as unpaid and continues (no crash)', async () => {
    const retrieve = vi.fn().mockRejectedValue(new Error('stripe down'));
    const sql = makeSql([pendingRow({ created_at: new Date(NOW - 25 * HOUR).toISOString() })]);
    const deps = baseDeps();

    const summary = await runPendingSweep({
      ...deps,
      sql: sql as never,
      stripe: { checkout: { sessions: { retrieve } } } as never,
    });
    expect(summary.reconciledPaid).toBe(0);
    expect(deps.sendReminder).toHaveBeenCalledTimes(1); // 25h old → reminder #1 due
  });

  it('never calls Stripe when the row has no session id', async () => {
    const retrieve = vi.fn();
    const sql = makeSql([pendingRow({ stripe_session_id: null, created_at: new Date(NOW - 100 * HOUR).toISOString() })]);
    const deps = baseDeps();

    const summary = await runPendingSweep({
      ...deps,
      sql: sql as never,
      stripe: { checkout: { sessions: { retrieve } } } as never,
    });
    expect(retrieve).not.toHaveBeenCalled();
    expect(summary.expired).toBe(1); // 100h old → expired
  });
});

describe('runPendingSweep — reminders', () => {
  const unpaid = { payment_status: 'unpaid', status: 'expired' };

  it('sends reminder #1 after 24h with signed pay + cancel links', async () => {
    const sql = makeSql([pendingRow({ created_at: new Date(NOW - 25 * HOUR).toISOString(), reminder_count: 0 })]);
    const { stripe } = stripeReturning(unpaid);
    const deps = baseDeps();

    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });

    expect(summary.remindersSent).toBe(1);
    expect(ran(sql, 'reminder_count = reminder_count + 1')).toBe(true);
    expect(deps.sendReminder).toHaveBeenCalledWith(
      'ada@example.com',
      expect.objectContaining({
        payUrl: 'https://x.test/api/registration/resume?token=TK5',
        cancelUrl: 'https://x.test/api/registration/cancel?token=TK5',
      }),
    );
  });

  it('does not remind before the next scheduled offset', async () => {
    const sql = makeSql([pendingRow({ created_at: new Date(NOW - 10 * HOUR).toISOString(), reminder_count: 0 })]);
    const { stripe } = stripeReturning(unpaid);
    const deps = baseDeps();
    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });
    expect(summary.remindersSent).toBe(0);
    expect(deps.sendReminder).not.toHaveBeenCalled();
  });

  it('sends reminder #2 after 72h but never a third', async () => {
    const second = makeSql([pendingRow({ created_at: new Date(NOW - 80 * HOUR).toISOString(), reminder_count: 1 })]);
    const third = makeSql([pendingRow({ created_at: new Date(NOW - 90 * HOUR).toISOString(), reminder_count: 2 })]);
    const { stripe } = stripeReturning(unpaid);
    const deps = baseDeps();

    expect((await runPendingSweep({ ...deps, sql: second as never, stripe: stripe as never })).remindersSent).toBe(1);
    expect((await runPendingSweep({ ...baseDeps(), sql: third as never, stripe: stripe as never })).remindersSent).toBe(0);
  });

  it('skips reminders entirely when email is disabled (no claim burned)', async () => {
    const sql = makeSql([pendingRow({ created_at: new Date(NOW - 25 * HOUR).toISOString(), reminder_count: 0 })]);
    const { stripe } = stripeReturning(unpaid);
    const deps = baseDeps({ reminderEnabled: false });
    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });
    expect(summary.remindersSent).toBe(0);
    expect(ran(sql, 'reminder_count = reminder_count + 1')).toBe(false);
  });
});

describe('runPendingSweep — expiry', () => {
  it('expires a pending row older than the 4-day grace window', async () => {
    const sql = makeSql([pendingRow({ created_at: new Date(NOW - 100 * HOUR).toISOString() })]);
    const { stripe } = stripeReturning({ payment_status: 'unpaid' });
    const deps = baseDeps();
    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });
    expect(summary.expired).toBe(1);
    expect(ran(sql, "status = 'expired'")).toBe(true);
  });
});

describe('runPendingSweep — dry run writes nothing', () => {
  it('reports intended actions but performs no DB writes and sends no email', async () => {
    const sql = makeSql([
      pendingRow({ id: 1, created_at: new Date(NOW - 25 * HOUR).toISOString(), reminder_count: 0 }),
      pendingRow({ id: 2, created_at: new Date(NOW - 100 * HOUR).toISOString() }),
    ]);
    const { stripe } = stripeReturning({ payment_status: 'unpaid' });
    const deps = baseDeps();

    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never, dryRun: true });

    expect(summary.dryRun).toBe(true);
    expect(summary.remindersSent).toBe(1);
    expect(summary.expired).toBe(1);
    expect(deps.sendReminder).not.toHaveBeenCalled();
    expect(ran(sql, 'reminder_count = reminder_count + 1')).toBe(false);
    expect(ran(sql, "status = 'expired'")).toBe(false);
  });
});

describe('runPendingSweep — per-row resilience', () => {
  it('isolates a failing row (e.g. token signing throws) and still processes the rest', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const sql = makeSql([
      pendingRow({ id: 1, created_at: new Date(NOW - 25 * HOUR).toISOString(), reminder_count: 0 }),
      pendingRow({ id: 2, email: 'b@b.co', created_at: new Date(NOW - 25 * HOUR).toISOString(), reminder_count: 0 }),
    ]);
    const { stripe } = stripeReturning({ payment_status: 'unpaid' });
    const signToken = (id: number) => {
      if (id === 1) throw new Error('REGISTRATION_ACTION_SECRET is not set');
      return `TK${id}`;
    };
    const deps = baseDeps({ signToken });

    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });

    expect(summary.scanned).toBe(2);
    expect(deps.sendReminder).toHaveBeenCalledTimes(1);
    expect(deps.sendReminder).toHaveBeenCalledWith(
      'b@b.co',
      expect.objectContaining({ payUrl: 'https://x.test/api/registration/resume?token=TK2' }),
    );
  });
});

describe('runPendingSweep — no spurious mutations', () => {
  it('leaves an unpaid, in-window, not-yet-due row completely untouched', async () => {
    const sql = makeSql([pendingRow({ created_at: new Date(NOW - 5 * HOUR).toISOString(), reminder_count: 0 })]);
    const { stripe } = stripeReturning({ payment_status: 'unpaid' });
    const deps = baseDeps();

    const summary = await runPendingSweep({ ...deps, sql: sql as never, stripe: stripe as never });

    expect(summary).toMatchObject({ reconciledPaid: 0, remindersSent: 0, expired: 0, scanned: 1 });
    expect(ran(sql, 'UPDATE registrations')).toBe(false);
  });
});
