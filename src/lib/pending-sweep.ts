/**
 * Pending-registration sweep — the recurring reconcile-and-recover job.
 *
 * For each `pending` row it, in order:
 *   1. Reconciles against Stripe (the source of truth) — if the checkout actually
 *      completed, flips the row to `paid` and sends the confirmation. This also
 *      recovers any payment whose webhook was missed.
 *   2. Expires rows past the 4-day grace window (kept, not deleted).
 *   3. Sends a payment reminder on a schedule (24h, then 72h) with fresh signed
 *      pay/deregister links — Stripe links die at 24h, so reminders point at the
 *      `resume` route which mints a new session.
 *
 * Every collaborator is injectable so the orchestration is unit-tested without a
 * DB, Stripe, clock, or network. `dryRun` computes the same decisions but writes
 * nothing and sends nothing — used to inspect production safely before enabling.
 */
import {
  getDb,
  listPendingRegistrations,
  markRegistrationPaidById,
  markRegistrationExpired,
  claimReminder,
  claimConfirmation,
  releaseConfirmationClaim,
} from './db';
import { getStripe } from './stripe';
import { SITE_URL } from './site';
import { signActionToken } from './registration-links';
import { isPaymentReminderEmailEnabled, sendPaymentReminderEmail } from './payment-reminder-email';
import { isConfirmationEmailEnabled, sendConfirmationEmail } from './confirmation-email';

const HOUR = 3600_000;
export const PENDING_GRACE_DAYS = 4;
export const REMINDER_SCHEDULE_HOURS = [24, 72];

type StripeSessionState = {
  payment_status?: string;
  status?: string;
  payment_intent?: string | null;
};
type StripeLike = {
  checkout: { sessions: { retrieve: (id: string) => Promise<StripeSessionState> } };
};

export type PendingSweepSummary = {
  scanned: number;
  reconciledPaid: number;
  remindersSent: number;
  expired: number;
  dryRun: boolean;
};

export type RunPendingSweepOptions = {
  sql?: ReturnType<typeof getDb>;
  stripe?: StripeLike;
  dryRun?: boolean;
  nowMs?: number;
  siteUrl?: string;
  signToken?: (id: number, email: string) => string;
  reminderEnabled?: boolean;
  confirmationEnabled?: boolean;
  sendReminder?: (
    to: string,
    input: { firstName: string | null; name: string; payUrl: string; cancelUrl: string },
  ) => Promise<boolean>;
  sendConfirmation?: (to: string, input: { firstName: string | null; name: string }) => Promise<boolean>;
};

export async function runPendingSweep(opts: RunPendingSweepOptions = {}): Promise<PendingSweepSummary> {
  const sql = opts.sql ?? getDb();
  const stripe = opts.stripe ?? (getStripe() as unknown as StripeLike);
  const dryRun = opts.dryRun ?? false;
  const nowMs = opts.nowMs ?? Date.now();
  const siteUrl = opts.siteUrl ?? SITE_URL;
  const signToken = opts.signToken ?? signActionToken;
  const reminderEnabled = opts.reminderEnabled ?? isPaymentReminderEmailEnabled();
  const confirmationEnabled = opts.confirmationEnabled ?? isConfirmationEmailEnabled();
  const sendReminder = opts.sendReminder ?? sendPaymentReminderEmail;
  const sendConfirmation = opts.sendConfirmation ?? sendConfirmationEmail;

  const graceMs = PENDING_GRACE_DAYS * 24 * HOUR;
  const rows = await listPendingRegistrations(sql);
  const summary: PendingSweepSummary = {
    scanned: rows.length,
    reconciledPaid: 0,
    remindersSent: 0,
    expired: 0,
    dryRun,
  };

  for (const row of rows) {
    try {
      // 1) Reconcile against Stripe — recovers genuinely-paid rows (incl. missed webhooks).
      if (row.stripeSessionId) {
        let session: StripeSessionState | null = null;
        try {
          session = await stripe.checkout.sessions.retrieve(row.stripeSessionId);
        } catch {
          session = null; // Stripe unreachable → treat as unpaid this round; retry next run.
        }
        const isPaid = !!session && (session.payment_status === 'paid' || session.status === 'complete');
        if (isPaid) {
          summary.reconciledPaid++;
          if (!dryRun) {
            const flipped = await markRegistrationPaidById(row.id, session?.payment_intent ?? null, sql);
            if (flipped && confirmationEnabled) {
              const claim = await claimConfirmation(row.id, sql);
              if (claim) {
                const sent = await sendConfirmation(claim.email, { firstName: claim.firstName, name: claim.name });
                if (!sent) await releaseConfirmationClaim(row.id, sql);
              }
            }
          }
          continue; // paid → no reminder/expiry for this row
        }
      }

      const ageMs = nowMs - Date.parse(row.createdAt);

      // 2) Expire past the grace window (kept for records, never deleted).
      if (ageMs >= graceMs) {
        if (dryRun) summary.expired++;
        else if (await markRegistrationExpired(row.id, sql)) summary.expired++;
        continue;
      }

      // 3) Reminder due? (offset chosen by how many we've already sent.)
      const dueIndex = row.reminderCount;
      const due =
        reminderEnabled &&
        dueIndex < REMINDER_SCHEDULE_HOURS.length &&
        ageMs >= REMINDER_SCHEDULE_HOURS[dueIndex] * HOUR;

      if (due) {
        if (dryRun) {
          summary.remindersSent++;
        } else {
          // Optimistic claim guarantees one send per slot even with concurrent runs.
          const claimed = await claimReminder(row.id, dueIndex, sql);
          if (claimed) {
            const token = signToken(row.id, row.email);
            await sendReminder(row.email, {
              firstName: row.firstName,
              name: row.name,
              payUrl: `${siteUrl}/api/registration/resume?token=${token}`,
              cancelUrl: `${siteUrl}/api/registration/cancel?token=${token}`,
            });
            summary.remindersSent++;
          }
        }
      }
    } catch {
      // One bad row (DB hiccup, signing misconfig) must never abort the batch.
      // GDPR: log the row id only, never the email.
      console.error(`pending-sweep: failed processing registration row ${row.id}`);
    }
  }

  return summary;
}
