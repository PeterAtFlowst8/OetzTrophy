import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

// Heavy I/O deps are mocked; the real NextResponse is used so we assert on the
// actual status + JSON body the route returns.
vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }));
vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));
vi.mock('@/lib/confirmation-email', () => ({
  isConfirmationEmailEnabled: vi.fn(),
  sendConfirmationEmail: vi.fn(),
}));

import { POST } from './route';
import { getStripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';
import { isConfirmationEmailEnabled, sendConfirmationEmail } from '@/lib/confirmation-email';

/**
 * Fake neon tagged-template `sql`. `handler(queryText)` returns the rows for a
 * matching query; everything else resolves to []. Records every query so tests
 * can assert which statements ran (e.g. the claim-release UPDATE).
 */
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

function request(body: string, headers: Record<string, string>): NextRequest {
  return { text: async () => body, headers: new Headers(headers) } as unknown as NextRequest;
}

function stripeReturning(event: unknown) {
  const constructEvent = vi.fn(() => event);
  vi.mocked(getStripe).mockReturnValue({ webhooks: { constructEvent } } as never);
  return constructEvent;
}

const SIGNED = { 'stripe-signature': 'sig_test' };
const PAID_EVENT = {
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_1', payment_intent: 'pi_1', metadata: { email: 'ada@example.com' } } },
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when the stripe-signature header is missing', async () => {
    const res = await POST(request('{}', {}));
    expect(res.status).toBe(400);
    expect(getStripe).not.toHaveBeenCalled();
  });

  it('returns 400 on an invalid signature and writes nothing to the DB', async () => {
    stripeReturning(undefined);
    vi.mocked(getStripe).mockReturnValue({
      webhooks: { constructEvent: vi.fn(() => { throw new Error('bad signature'); }) },
    } as never);
    const sql = makeSql();
    vi.mocked(getDb).mockReturnValue(sql as never);

    const res = await POST(request('{}', SIGNED));

    expect(res.status).toBe(400);
    expect((sql as unknown as { calls: unknown[] }).calls.length).toBe(0);
  });

  it('acknowledges non-checkout events without touching the DB', async () => {
    stripeReturning({ type: 'payment_intent.succeeded', data: { object: {} } });
    const sql = makeSql();
    vi.mocked(getDb).mockReturnValue(sql as never);

    const res = await POST(request('{}', SIGNED));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect((sql as unknown as { calls: unknown[] }).calls.length).toBe(0);
  });

  it('marks the row paid and sends the confirmation email on first delivery', async () => {
    stripeReturning(PAID_EVENT);
    vi.mocked(getDb).mockReturnValue(
      makeSql((text) => {
        if (text.includes("status = 'paid'") && text.includes('stripe_session_id')) return [{ id: 7 }];
        if (text.includes('confirmation_sent_at = NOW()')) {
          return [{ id: 7, email: 'ada@example.com', first_name: 'Ada', name: 'Ada Lovelace' }];
        }
        return [];
      }) as never,
    );
    vi.mocked(isConfirmationEmailEnabled).mockReturnValue(true);
    vi.mocked(sendConfirmationEmail).mockResolvedValue(true);

    const res = await POST(request('{}', SIGNED));

    expect(await res.json()).toEqual({ received: true });
    expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(sendConfirmationEmail).toHaveBeenCalledWith('ada@example.com', {
      firstName: 'Ada',
      name: 'Ada Lovelace',
    });
  });

  it('does NOT send a second email when the claim is already taken (idempotent redelivery)', async () => {
    stripeReturning(PAID_EVENT);
    vi.mocked(getDb).mockReturnValue(
      makeSql((text) => {
        if (text.includes("status = 'paid'") && text.includes('stripe_session_id')) return [{ id: 7 }];
        // Claim UPDATE ... WHERE confirmation_sent_at IS NULL RETURNING -> empty:
        // a prior delivery already sent the email.
        if (text.includes('confirmation_sent_at = NOW()')) return [];
        return [];
      }) as never,
    );
    vi.mocked(isConfirmationEmailEnabled).mockReturnValue(true);
    vi.mocked(sendConfirmationEmail).mockResolvedValue(true);

    const res = await POST(request('{}', SIGNED));

    expect(await res.json()).toEqual({ received: true });
    expect(sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it('releases the claim when the email send fails, so a Stripe resend can retry', async () => {
    stripeReturning(PAID_EVENT);
    const sql = makeSql((text) => {
      if (text.includes("status = 'paid'") && text.includes('stripe_session_id')) return [{ id: 7 }];
      if (text.includes('confirmation_sent_at = NOW()')) {
        return [{ id: 7, email: 'ada@example.com', first_name: 'Ada', name: 'Ada Lovelace' }];
      }
      return [];
    });
    vi.mocked(getDb).mockReturnValue(sql as never);
    vi.mocked(isConfirmationEmailEnabled).mockReturnValue(true);
    vi.mocked(sendConfirmationEmail).mockResolvedValue(false);

    const res = await POST(request('{}', SIGNED));

    expect(res.status).toBe(200);
    expect(ran(sql, 'confirmation_sent_at = NULL')).toBe(true);
  });

  it('falls back to matching by email when no row matches the session id', async () => {
    stripeReturning(PAID_EVENT);
    const sql = makeSql((text) => {
      if (text.includes("status = 'paid'") && text.includes('stripe_session_id')) return []; // no session match
      if (text.includes("status = 'paid'") && text.includes('WHERE')) return [{ id: 9 }]; // email fallback hits
      if (text.includes('confirmation_sent_at = NOW()')) {
        return [{ id: 9, email: 'ada@example.com', first_name: 'Ada', name: 'Ada Lovelace' }];
      }
      return [];
    });
    vi.mocked(getDb).mockReturnValue(sql as never);
    vi.mocked(isConfirmationEmailEnabled).mockReturnValue(true);
    vi.mocked(sendConfirmationEmail).mockResolvedValue(true);

    const res = await POST(request('{}', SIGNED));

    expect(await res.json()).toEqual({ received: true });
    expect(ran(sql, 'WHERE email =')).toBe(true);
    expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
  });
});
