import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

// Mock the heavy I/O boundaries; exercise the REAL rate-limiter, gate and input
// validation so this test covers the route's gate composition end to end.
vi.mock('@/lib/db', () => ({ getDb: vi.fn(), ensureSchema: vi.fn() }));
vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }));
vi.mock('@/lib/settings', () => ({ getSiteSettings: vi.fn() }));
vi.mock('@/lib/turnstile', () => ({
  getTurnstileConfig: vi.fn(),
  verifyTurnstileToken: vi.fn(),
}));
vi.mock('@/lib/waitlist-email', () => ({
  sendWaitlistEmail: vi.fn().mockResolvedValue(true),
  isWaitlistEmailEnabled: vi.fn().mockReturnValue(true),
}));

import { POST } from './route';
import { getDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { getSiteSettings } from '@/lib/settings';
import { getTurnstileConfig, verifyTurnstileToken } from '@/lib/turnstile';
import { sendWaitlistEmail } from '@/lib/waitlist-email';

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

// Each test uses a distinct IP so the real in-memory rate-limiter never bleeds
// between cases.
let ipCounter = 0;
function request(body: unknown, opts: { ip?: string; throwOnJson?: boolean } = {}): NextRequest {
  const ip = opts.ip ?? `10.0.0.${++ipCounter}`;
  return {
    json: async () => {
      if (opts.throwOnJson) throw new SyntaxError('Unexpected token');
      return body;
    },
    headers: new Headers({ 'x-forwarded-for': ip }),
  } as unknown as NextRequest;
}

const VALID_BODY = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  nationality: 'AT',
  tshirtSize: 'M',
  category: 'men',
  acceptedTerms: true,
  acceptedAwpRules: true,
  confirmedOver18: true,
  turnstileToken: 'tok',
};

const OPEN = {
  festivalDate: '2026-09-17T09:00:00Z',
  festivalEndDate: '2026-09-20T18:00:00Z',
  registrationOpensAt: '2000-01-01T00:00:00Z',
  registrationFeeEur: 135,
  maxMen: null,
  maxWomen: null,
};
const CLOSED = { ...OPEN, registrationOpensAt: '2099-01-01T00:00:00Z' };

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.REGISTRATION_TEST_MODE; // never let test-mode bypass the date gate here
  // Sensible defaults: registration open, no bot check, benign DB + Stripe.
  vi.mocked(getSiteSettings).mockResolvedValue(OPEN);
  vi.mocked(getTurnstileConfig).mockReturnValue('disabled');
  vi.mocked(getDb).mockReturnValue(makeSql() as never);
  vi.mocked(getStripe).mockReturnValue({
    checkout: { sessions: { create: vi.fn().mockResolvedValue({ id: 'cs_test_x', url: 'https://checkout.stripe.com/x' }) } },
  } as never);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/registration', () => {
  it('returns 403 when registration is closed and not in test mode', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue(CLOSED);
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(403);
  });

  it('rate-limits after 5 attempts from the same IP (429)', async () => {
    vi.mocked(getSiteSettings).mockResolvedValue(CLOSED); // 1st-5th return 403 fast
    const ip = '203.0.113.7';
    for (let i = 0; i < 5; i++) await POST(request(VALID_BODY, { ip }));
    const res = await POST(request(VALID_BODY, { ip }));
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe('rate_limited');
  });

  it('returns 400 when the JSON body cannot be parsed', async () => {
    const res = await POST(request(null, { throwOnJson: true }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(request({ email: 'ada@example.com' }));
    expect(res.status).toBe(400);
  });

  it('fails closed with 500 when Turnstile is misconfigured', async () => {
    vi.mocked(getTurnstileConfig).mockReturnValue('misconfigured');
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(500);
  });

  it('rejects with 400 turnstile_failed when an enforced challenge does not verify', async () => {
    vi.mocked(getTurnstileConfig).mockReturnValue('enforced');
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);
    const res = await POST(request(VALID_BODY));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('turnstile_failed');
  });

  it('creates a Stripe Checkout session for a valid new registration and returns its URL', async () => {
    const sql = makeSql(); // SELECT existing -> [] (new registrant)
    vi.mocked(getDb).mockReturnValue(sql as never);
    const create = vi.fn().mockResolvedValue({ id: 'cs_test_x', url: 'https://checkout.stripe.com/x' });
    vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create } } } as never);

    const res = await POST(request(VALID_BODY));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/x' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'payment', customer_email: 'ada@example.com' }),
    );
    expect(ran(sql, 'INSERT INTO registrations')).toBe(true);
    expect(ran(sql, 'stripe_session_id =')).toBe(true);
  });

  it('returns 409 already_registered when the email is already paid', async () => {
    vi.mocked(getDb).mockReturnValue(
      makeSql((text) => (text.includes('SELECT id, status FROM registrations') ? [{ id: 1, status: 'paid' }] : [])) as never,
    );
    const create = vi.fn();
    vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create } } } as never);

    const res = await POST(request(VALID_BODY));

    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe('already_registered');
    expect(create).not.toHaveBeenCalled();
  });

  it('diverts to the waitlist (no Stripe) when the category is full', async () => {
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
      // count(*) → cap (full); waitlist INSERT ... ON CONFLICT DO NOTHING → [] (already on list)
      text.includes("status = 'paid'") && text.includes('count(') ? [{ n: 130 }] : [],
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

  it("re-activates an existing expired/cancelled registration to pending on re-submit", async () => {
    const sql = makeSql((text) =>
      text.includes('SELECT id, status FROM registrations') ? [{ id: 1, status: 'expired' }] :
      text.includes("status = 'paid'") && text.includes('count(') ? [{ n: 0 }] : [],
    );
    vi.mocked(getDb).mockReturnValue(sql as never);
    const create = vi.fn().mockResolvedValue({ id: 'cs_test_x', url: 'https://checkout.stripe.com/x' });
    vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create } } } as never);

    const res = await POST(request(VALID_BODY));

    expect(res.status).toBe(200);
    expect(ran(sql, 'UPDATE registrations')).toBe(true);
    expect(ran(sql, "status = 'pending'")).toBe(true); // expired row re-activated, not left dead
  });
});
