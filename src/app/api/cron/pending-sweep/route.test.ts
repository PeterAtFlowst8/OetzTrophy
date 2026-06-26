import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/pending-sweep', () => ({ runPendingSweep: vi.fn() }));

import { GET } from './route';
import { runPendingSweep } from '@/lib/pending-sweep';

function request(headers: Record<string, string> = {}): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

const SUMMARY = { scanned: 3, reconciledPaid: 1, remindersSent: 1, expired: 0, dryRun: false };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = 'cron_secret_x';
  vi.mocked(runPendingSweep).mockResolvedValue(SUMMARY);
});
afterEach(() => {
  delete process.env.CRON_SECRET;
  vi.restoreAllMocks();
});

describe('GET /api/cron/pending-sweep', () => {
  it('rejects a missing Authorization header with 401 and never runs the sweep', async () => {
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect(runPendingSweep).not.toHaveBeenCalled();
  });

  it('rejects a wrong secret with 401 and never runs the sweep', async () => {
    const res = await GET(request({ authorization: 'Bearer nope' }));
    expect(res.status).toBe(401);
    expect(runPendingSweep).not.toHaveBeenCalled();
  });

  it('fails closed (401) when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(request({ authorization: 'Bearer cron_secret_x' }));
    expect(res.status).toBe(401);
    expect(runPendingSweep).not.toHaveBeenCalled();
  });

  it('runs the sweep and returns its summary when the secret matches', async () => {
    const res = await GET(request({ authorization: 'Bearer cron_secret_x' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, summary: SUMMARY });
    expect(runPendingSweep).toHaveBeenCalledTimes(1);
  });
});
