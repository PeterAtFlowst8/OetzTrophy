import { describe, expect, it } from 'vitest';
import { summarizeRegistrationStatuses } from './registration-status-summary';

describe('summarizeRegistrationStatuses', () => {
  it('counts each status explicitly (not total-minus-paid)', () => {
    const rows = [
      { status: 'paid' },
      { status: 'paid' },
      { status: 'pending' },
      { status: 'expired' },
      { status: 'cancelled' },
      { status: 'cancelled' },
    ];
    expect(summarizeRegistrationStatuses(rows)).toEqual({
      total: 6,
      paid: 2,
      pending: 1,
      expired: 1,
      cancelled: 2,
    });
  });

  it('handles an empty list', () => {
    expect(summarizeRegistrationStatuses([])).toEqual({
      total: 0,
      paid: 0,
      pending: 0,
      expired: 0,
      cancelled: 0,
    });
  });
});
