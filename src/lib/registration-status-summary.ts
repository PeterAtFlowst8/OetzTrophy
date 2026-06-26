/**
 * Counts registrations by status for the admin summary line. Explicit per-status
 * counts (not total-minus-paid) so the new `expired`/`cancelled` rows are never
 * mislabelled as "pending".
 */
export type RegistrationStatusSummary = {
  total: number;
  paid: number;
  pending: number;
  expired: number;
  cancelled: number;
};

export function summarizeRegistrationStatuses(
  rows: { status: string }[],
): RegistrationStatusSummary {
  const s: RegistrationStatusSummary = { total: rows.length, paid: 0, pending: 0, expired: 0, cancelled: 0 };
  for (const r of rows) {
    if (r.status === 'paid') s.paid++;
    else if (r.status === 'pending') s.pending++;
    else if (r.status === 'expired') s.expired++;
    else if (r.status === 'cancelled') s.cancelled++;
  }
  return s;
}
