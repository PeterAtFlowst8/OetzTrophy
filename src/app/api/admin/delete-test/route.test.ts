import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin-auth-server', () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock('@/lib/db', () => ({ deleteTestRegistrations: vi.fn(), deleteTestWaitlist: vi.fn() }));

import { POST } from './route';
import { isAdminAuthenticated } from '@/lib/admin-auth-server';
import { deleteTestRegistrations, deleteTestWaitlist } from '@/lib/db';

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe('POST /api/admin/delete-test', () => {
  it('rejects unauthenticated callers with 401 and never touches the db', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false);
    const res = await POST();
    expect(res.status).toBe(401);
    expect(deleteTestRegistrations).not.toHaveBeenCalled();
    expect(deleteTestWaitlist).not.toHaveBeenCalled();
  });

  it('deletes test registrations and waitlist rows and returns the counts when authenticated', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    vi.mocked(deleteTestRegistrations).mockResolvedValue(3);
    vi.mocked(deleteTestWaitlist).mockResolvedValue(2);
    const res = await POST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: { registrations: 3, waitlist: 2 } });
  });
});
