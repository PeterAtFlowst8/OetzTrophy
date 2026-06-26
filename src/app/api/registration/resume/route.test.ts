import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/registration-links', () => ({ verifyActionToken: vi.fn() }));
vi.mock('@/lib/db', () => ({ getRegistrationById: vi.fn(), setRegistrationSessionId: vi.fn() }));
vi.mock('@/lib/checkout', () => ({ createRegistrationCheckoutSession: vi.fn() }));
vi.mock('@/lib/settings', () => ({ getSiteSettings: vi.fn() }));

import { GET } from './route';
import { verifyActionToken } from '@/lib/registration-links';
import { getRegistrationById, setRegistrationSessionId } from '@/lib/db';
import { createRegistrationCheckoutSession } from '@/lib/checkout';
import { getSiteSettings } from '@/lib/settings';

function request(token: string): NextRequest {
  return { nextUrl: new URL(`https://x.test/api/registration/resume?token=${token}`) } as unknown as NextRequest;
}

const ROW = {
  id: 5,
  email: 'ada@example.com',
  status: 'pending',
  name: 'Ada Lovelace',
  firstName: 'Ada',
  lastName: 'Lovelace',
  nationality: 'GB',
  tshirtSize: 'M',
  category: 'women',
  stripeSessionId: 'cs_old',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSiteSettings).mockResolvedValue({ registrationFeeEur: 135 } as never);
});
afterEach(() => vi.restoreAllMocks());

describe('GET /api/registration/resume', () => {
  it('shows a notice (no Stripe) for an invalid token', async () => {
    vi.mocked(verifyActionToken).mockReturnValue(null);
    const res = await GET(request('bad'));
    expect(res.status).toBe(400);
    expect(getRegistrationById).not.toHaveBeenCalled();
    expect(createRegistrationCheckoutSession).not.toHaveBeenCalled();
  });

  it('returns 404 when the row no longer exists', async () => {
    vi.mocked(verifyActionToken).mockReturnValue({ id: 5, email: 'ada@example.com' });
    vi.mocked(getRegistrationById).mockResolvedValue(null);
    const res = await GET(request('ok'));
    expect(res.status).toBe(404);
    expect(createRegistrationCheckoutSession).not.toHaveBeenCalled();
  });

  it('redirects an already-paid row to success WITHOUT minting a new session', async () => {
    vi.mocked(verifyActionToken).mockReturnValue({ id: 5, email: 'ada@example.com' });
    vi.mocked(getRegistrationById).mockResolvedValue({ ...ROW, status: 'paid' } as never);
    const res = await GET(request('ok'));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/registration/success');
    expect(createRegistrationCheckoutSession).not.toHaveBeenCalled();
  });

  it('mints a fresh session for an unpaid row and redirects to Stripe', async () => {
    vi.mocked(verifyActionToken).mockReturnValue({ id: 5, email: 'ada@example.com' });
    vi.mocked(getRegistrationById).mockResolvedValue(ROW as never);
    vi.mocked(createRegistrationCheckoutSession).mockResolvedValue({ id: 'cs_new', url: 'https://stripe.test/new' } as never);

    const res = await GET(request('ok'));

    expect(createRegistrationCheckoutSession).toHaveBeenCalledTimes(1);
    expect(setRegistrationSessionId).toHaveBeenCalledWith(5, 'cs_new');
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://stripe.test/new');
  });
});
