import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/registration-links', () => ({ verifyActionToken: vi.fn() }));
vi.mock('@/lib/db', () => ({ getRegistrationById: vi.fn(), markRegistrationCancelled: vi.fn() }));

import { GET } from './route';
import { verifyActionToken } from '@/lib/registration-links';
import { getRegistrationById, markRegistrationCancelled } from '@/lib/db';

function request(token: string): NextRequest {
  return { nextUrl: new URL(`https://x.test/api/registration/cancel?token=${token}`) } as unknown as NextRequest;
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('GET /api/registration/cancel', () => {
  it('shows a notice for an invalid token and never cancels', async () => {
    vi.mocked(verifyActionToken).mockReturnValue(null);
    const res = await GET(request('bad'));
    expect(res.status).toBe(400);
    expect(markRegistrationCancelled).not.toHaveBeenCalled();
  });

  it('returns 404 when the row no longer exists', async () => {
    vi.mocked(verifyActionToken).mockReturnValue({ id: 5, email: 'ada@example.com' });
    vi.mocked(getRegistrationById).mockResolvedValue(null);
    const res = await GET(request('ok'));
    expect(res.status).toBe(404);
    expect(markRegistrationCancelled).not.toHaveBeenCalled();
  });

  it('NEVER cancels a paid row — routes them to support instead', async () => {
    vi.mocked(verifyActionToken).mockReturnValue({ id: 5, email: 'ada@example.com' });
    vi.mocked(getRegistrationById).mockResolvedValue({ id: 5, status: 'paid', email: 'ada@example.com' } as never);
    const res = await GET(request('ok'));
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('info@oetz-trophy.com');
    expect(markRegistrationCancelled).not.toHaveBeenCalled();
  });

  it('deregisters an unpaid row and confirms', async () => {
    vi.mocked(verifyActionToken).mockReturnValue({ id: 5, email: 'ada@example.com' });
    vi.mocked(getRegistrationById).mockResolvedValue({ id: 5, status: 'pending', email: 'ada@example.com' } as never);
    vi.mocked(markRegistrationCancelled).mockResolvedValue(true);
    const res = await GET(request('ok'));
    expect(markRegistrationCancelled).toHaveBeenCalledWith(5);
    expect(res.status).toBe(200);
    expect(await res.text()).toMatch(/deregistered|abgemeldet/i);
  });
});
