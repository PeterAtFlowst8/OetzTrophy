import { describe, it, expect } from 'vitest';
import {
  isTestRow,
  isUnpaid,
  filterAndSortRegistrations,
  filterAndSortWaitlist,
  countPaidByCategory,
  buildUnpaidMailto,
  type RegFilter,
  type RegSort,
} from './adminTable';
import type { RegistrationRecord, WaitlistRecord } from './db';

function reg(overrides: Partial<RegistrationRecord> = {}): RegistrationRecord {
  return {
    id: 1,
    name: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    nationality: 'AT',
    tshirtSize: 'M',
    category: 'women',
    status: 'paid',
    stripeSessionId: 'cs_live_1',
    stripePaymentId: 'pi_1',
    createdAt: '2026-06-10T10:00:00.000Z',
    updatedAt: '2026-06-10T10:00:00.000Z',
    ...overrides,
  };
}

function wl(overrides: Partial<WaitlistRecord> = {}): WaitlistRecord {
  return {
    id: 1,
    name: 'Jo Runner',
    email: 'jo@example.com',
    category: 'men',
    createdAt: '2026-06-10T10:00:00.000Z',
    ...overrides,
  };
}

const ALL: RegFilter = { query: '', category: 'all', status: 'all', hideTest: false };
const BY_CREATED_DESC: RegSort = { key: 'createdAt', dir: 'desc' };

describe('isTestRow', () => {
  it('is true for a cs_test_ Stripe session', () => {
    expect(isTestRow('cs_test_abc')).toBe(true);
  });
  it('is false for a live session and for null', () => {
    expect(isTestRow('cs_live_abc')).toBe(false);
    expect(isTestRow(null)).toBe(false);
  });
});

describe('isUnpaid', () => {
  it('is true for pending and expired', () => {
    expect(isUnpaid('pending')).toBe(true);
    expect(isUnpaid('expired')).toBe(true);
  });
  it('is false for paid and cancelled', () => {
    expect(isUnpaid('paid')).toBe(false);
    expect(isUnpaid('cancelled')).toBe(false);
  });
});

describe('filterAndSortRegistrations — filtering', () => {
  it('matches the search query against the name, case-insensitively', () => {
    const rows = [reg({ id: 1, name: 'Anna Berg' }), reg({ id: 2, name: 'Carl Frei' })];
    const out = filterAndSortRegistrations(rows, { ...ALL, query: 'berg' }, BY_CREATED_DESC);
    expect(out.map((r) => r.id)).toEqual([1]);
  });

  it('matches the search query against the email, case-insensitively', () => {
    const rows = [
      reg({ id: 1, email: 'anna@club.at' }),
      reg({ id: 2, email: 'carl@team.de' }),
    ];
    const out = filterAndSortRegistrations(rows, { ...ALL, query: 'TEAM.DE' }, BY_CREATED_DESC);
    expect(out.map((r) => r.id)).toEqual([2]);
  });

  it('filters by category and excludes null-category rows', () => {
    const rows = [
      reg({ id: 1, category: 'men' }),
      reg({ id: 2, category: 'women' }),
      reg({ id: 3, category: null }),
    ];
    const out = filterAndSortRegistrations(rows, { ...ALL, category: 'men' }, BY_CREATED_DESC);
    expect(out.map((r) => r.id)).toEqual([1]);
  });

  it('filters by status', () => {
    const rows = [
      reg({ id: 1, status: 'paid' }),
      reg({ id: 2, status: 'pending' }),
    ];
    const out = filterAndSortRegistrations(rows, { ...ALL, status: 'pending' }, BY_CREATED_DESC);
    expect(out.map((r) => r.id)).toEqual([2]);
  });

  it('hides test rows when hideTest is set', () => {
    const rows = [
      reg({ id: 1, stripeSessionId: 'cs_test_x' }),
      reg({ id: 2, stripeSessionId: 'cs_live_y' }),
    ];
    const out = filterAndSortRegistrations(rows, { ...ALL, hideTest: true }, BY_CREATED_DESC);
    expect(out.map((r) => r.id)).toEqual([2]);
  });
});

describe('filterAndSortRegistrations — sorting', () => {
  it('sorts by name ascending', () => {
    const rows = [reg({ id: 1, name: 'Zoe' }), reg({ id: 2, name: 'Amy' })];
    const out = filterAndSortRegistrations(rows, ALL, { key: 'name', dir: 'asc' });
    expect(out.map((r) => r.id)).toEqual([2, 1]);
  });

  it('sorts by createdAt descending (newest first) by default', () => {
    const rows = [
      reg({ id: 1, createdAt: '2026-06-01T00:00:00.000Z' }),
      reg({ id: 2, createdAt: '2026-06-09T00:00:00.000Z' }),
    ];
    const out = filterAndSortRegistrations(rows, ALL, BY_CREATED_DESC);
    expect(out.map((r) => r.id)).toEqual([2, 1]);
  });

  it('places null values last regardless of direction', () => {
    const rows = [
      reg({ id: 1, nationality: null }),
      reg({ id: 2, nationality: 'AT' }),
    ];
    const asc = filterAndSortRegistrations(rows, ALL, { key: 'nationality', dir: 'asc' });
    const desc = filterAndSortRegistrations(rows, ALL, { key: 'nationality', dir: 'desc' });
    expect(asc.map((r) => r.id)).toEqual([2, 1]);
    expect(desc.map((r) => r.id)).toEqual([2, 1]);
  });

  it('does not mutate the input array', () => {
    const rows = [reg({ id: 1, name: 'Zoe' }), reg({ id: 2, name: 'Amy' })];
    filterAndSortRegistrations(rows, ALL, { key: 'name', dir: 'asc' });
    expect(rows.map((r) => r.id)).toEqual([1, 2]);
  });
});

describe('filterAndSortWaitlist', () => {
  it('filters by search query (name or email)', () => {
    const rows = [wl({ id: 1, name: 'Anna' }), wl({ id: 2, name: 'Carl' })];
    const out = filterAndSortWaitlist(rows, { query: 'anna', category: 'all' }, { key: 'createdAt', dir: 'asc' });
    expect(out.map((r) => r.id)).toEqual([1]);
  });

  it('filters by category', () => {
    const rows = [wl({ id: 1, category: 'men' }), wl({ id: 2, category: 'women' })];
    const out = filterAndSortWaitlist(rows, { query: '', category: 'women' }, { key: 'createdAt', dir: 'asc' });
    expect(out.map((r) => r.id)).toEqual([2]);
  });

  it('sorts by joined date ascending (oldest first)', () => {
    const rows = [
      wl({ id: 1, createdAt: '2026-06-09T00:00:00.000Z' }),
      wl({ id: 2, createdAt: '2026-06-01T00:00:00.000Z' }),
    ];
    const out = filterAndSortWaitlist(rows, { query: '', category: 'all' }, { key: 'createdAt', dir: 'asc' });
    expect(out.map((r) => r.id)).toEqual([2, 1]);
  });
});

describe('countPaidByCategory', () => {
  it('counts only paid rows, grouped by category', () => {
    const rows = [
      reg({ id: 1, status: 'paid', category: 'men' }),
      reg({ id: 2, status: 'paid', category: 'men' }),
      reg({ id: 3, status: 'paid', category: 'women' }),
      reg({ id: 4, status: 'pending', category: 'men' }),
      reg({ id: 5, status: 'paid', category: null }),
    ];
    expect(countPaidByCategory(rows)).toEqual({ men: 2, women: 1 });
  });

  it('returns zeros for an empty list', () => {
    expect(countPaidByCategory([])).toEqual({ men: 0, women: 0 });
  });
});

describe('buildUnpaidMailto', () => {
  it('produces a mailto addressed to the registrant with subject and a registration link', () => {
    const href = buildUnpaidMailto(reg({ email: 'late@payer.com', firstName: 'Late' }), 'https://oetz-trophy.com');
    expect(href.startsWith('mailto:late@payer.com?')).toBe(true);
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain('Complete your payment');
    expect(decoded).toContain('OETZ TROPHY');
    expect(decoded).toContain('https://oetz-trophy.com/registration');
  });

  it('greets by first name, falling back to the full name when first name is null', () => {
    const href = buildUnpaidMailto(reg({ firstName: null, name: 'Only Fullname' }), 'https://x.test');
    expect(decodeURIComponent(href)).toContain('Only Fullname');
  });
});
