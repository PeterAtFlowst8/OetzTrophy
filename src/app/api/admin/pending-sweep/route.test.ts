import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('@/lib/admin-auth-server', () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock('@/lib/pending-sweep', () => ({ runPendingSweep: vi.fn() }));

import { POST } from './route';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { runPendingSweep } from '@/lib/pending-sweep';

function request(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

const SUMMARY = { scanned: 2, reconciledPaid: 0, remindersSent: 2, expired: 0, dryRun: true };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(runPendingSweep).mockResolvedValue(SUMMARY);
});
afterEach(() => vi.restoreAllMocks());

describe('POST /api/admin/pending-sweep', () => {
  it('rejects unauthenticated callers with 401 and never runs the sweep', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false);
    const res = await POST(request({}));
    expect(res.status).toBe(401);
    expect(runPendingSweep).not.toHaveBeenCalled();
  });

  it('defaults to a DRY RUN when authenticated (safety)', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    const res = await POST(request({}));
    expect(res.status).toBe(200);
    expect(runPendingSweep).toHaveBeenCalledWith({ dryRun: true });
  });

  it('runs for real only when explicitly told dryRun:false', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    await POST(request({ dryRun: false }));
    expect(runPendingSweep).toHaveBeenCalledWith({ dryRun: false });
  });
});
