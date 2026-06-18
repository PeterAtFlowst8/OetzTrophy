// Pure, framework-free helpers for the registrations admin table.
// All filtering/sorting happens client-side over rows already fetched by the
// server component — no DB or API calls — so this stays unit-testable in the
// node vitest environment (see adminTable.test.ts).
import type { RegistrationRecord, WaitlistRecord } from './db';

export type CategoryFilter = 'all' | 'men' | 'women';
export type RegStatusFilter = 'all' | 'paid' | 'pending' | 'expired' | 'cancelled';
export type SortDir = 'asc' | 'desc';

export type RegSortKey = 'name' | 'email' | 'nationality' | 'category' | 'status' | 'createdAt';
export type RegFilter = {
  query: string;
  category: CategoryFilter;
  status: RegStatusFilter;
  hideTest: boolean;
};
export type RegSort = { key: RegSortKey; dir: SortDir };

export type WaitlistSortKey = 'name' | 'createdAt';
export type WaitlistFilter = { query: string; category: CategoryFilter };
export type WaitlistSort = { key: WaitlistSortKey; dir: SortDir };

/** Test-mode checkouts always carry a `cs_test_…` Stripe session id. */
export function isTestRow(stripeSessionId: string | null): boolean {
  return stripeSessionId?.startsWith('cs_test_') ?? false;
}

/** "Registered but didn't pay" — drives the Email nudge button. */
export function isUnpaid(status: string): boolean {
  return status === 'pending' || status === 'expired';
}

function matchesQuery(row: { name: string; email: string }, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
}

/** String compare with nulls always last (regardless of direction). */
function compareNullableStrings(a: string | null, b: string | null, dir: SortDir): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  const cmp = a.localeCompare(b);
  return dir === 'asc' ? cmp : -cmp;
}

function compareDates(a: string, b: string, dir: SortDir): number {
  const cmp = new Date(a).getTime() - new Date(b).getTime();
  return dir === 'asc' ? cmp : -cmp;
}

export function filterAndSortRegistrations(
  rows: RegistrationRecord[],
  filter: RegFilter,
  sort: RegSort,
): RegistrationRecord[] {
  const filtered = rows.filter((r) => {
    if (!matchesQuery(r, filter.query)) return false;
    if (filter.category !== 'all' && r.category !== filter.category) return false;
    if (filter.status !== 'all' && r.status !== filter.status) return false;
    if (filter.hideTest && isTestRow(r.stripeSessionId)) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort.key === 'createdAt') return compareDates(a.createdAt, b.createdAt, sort.dir);
    return compareNullableStrings(a[sort.key], b[sort.key], sort.dir);
  });
}

export function filterAndSortWaitlist(
  rows: WaitlistRecord[],
  filter: WaitlistFilter,
  sort: WaitlistSort,
): WaitlistRecord[] {
  const filtered = rows.filter((r) => {
    if (!matchesQuery(r, filter.query)) return false;
    if (filter.category !== 'all' && r.category !== filter.category) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort.key === 'createdAt') return compareDates(a.createdAt, b.createdAt, sort.dir);
    return compareNullableStrings(a[sort.key], b[sort.key], sort.dir);
  });
}

/** Paid registrations per category — for the capacity header. Mirrors the DB-side
 *  `getCategoryAvailability` but over rows already in memory (no extra query). */
export function countPaidByCategory(rows: RegistrationRecord[]): { men: number; women: number } {
  const counts = { men: 0, women: 0 };
  for (const r of rows) {
    if (r.status !== 'paid') continue;
    if (r.category === 'men') counts.men++;
    else if (r.category === 'women') counts.women++;
  }
  return counts;
}

/**
 * A `mailto:` for a registrant who hasn't paid. Pure client-side: it opens the
 * admin's own mail app pre-addressed with a bilingual nudge. It links to the
 * public registration page (which re-mints a fresh Stripe session for an existing
 * email) rather than a resume link, since the secure resume token can only be
 * signed server-side. Wording mirrors src/lib/payment-reminder-email.ts.
 */
export function buildUnpaidMailto(r: RegistrationRecord, baseUrl: string): string {
  const greeting = r.firstName ?? r.name;
  const registrationUrl = `${baseUrl}/registration`;
  const subject = 'Zahlung abschließen / Complete your payment — OETZ TROPHY 2026';
  const body = [
    `Hallo ${greeting},`,
    '',
    'du hast dich zum OETZ TROPHY Rennwochenende 2026 angemeldet, aber deine Zahlung ist noch nicht eingegangen — dein Startplatz ist noch nicht gesichert.',
    '',
    `Jetzt anmelden & bezahlen: ${registrationUrl}`,
    '',
    'Fragen? info@oetz-trophy.com',
    '',
    '— — —',
    '',
    `Hi ${greeting},`,
    '',
    "you registered for the OETZ TROPHY race weekend 2026, but your payment hasn't come through yet — your spot isn't secured until you pay.",
    '',
    `Complete your registration & payment: ${registrationUrl}`,
    '',
    'Questions? info@oetz-trophy.com',
  ].join('\n');

  return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
