/**
 * Volunteer-signup emails via Resend. Mirrors waitlist-email.ts:
 * config-symmetric (no RESEND_API_KEY → disabled) and best-effort (never blocks
 * the signup response). Two messages:
 *  - sendVolunteerThankYouEmail: bilingual (DE + EN) confirmation to the volunteer.
 *    Its subject + body are editor-managed (Sanity, with defaults in messages JSON)
 *    and passed in as `copy`, so this module stays pure and Sanity-free. The body
 *    supports a {name} placeholder for the volunteer's first name.
 *  - sendVolunteerNotificationEmail: internal notification to the organisers,
 *    with reply-to set to the volunteer so they can be answered directly.
 * No payment is involved.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'OETZ TROPHY <noreply@oetz-trophy.com>';
const REPLY_TO = 'info@oetz-trophy.com';
const FOOTER_ORG = 'OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria';

export function isVolunteerEmailEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Thank-you to the volunteer (editor-managed copy) ────────────────────────

export type VolunteerThankYouInput = { firstName: string | null; name: string };

/** Bilingual, editor-managed copy resolved from Sanity (defaults in messages JSON). */
export type VolunteerEmailCopy = {
  subject: { de: string; en: string };
  body: { de: string; en: string };
};

/** Editor text → HTML: paragraphs split on blank lines; single newlines become <br/>. Escaped. */
function paragraphsToHtml(raw: string): string {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`,
    )
    .join('');
}

export function buildVolunteerThankYouEmail(
  input: VolunteerThankYouInput,
  copy: VolunteerEmailCopy,
): { subject: string; html: string; text: string } {
  const greetName = (input.firstName || '').trim() || input.name;
  const fill = (s: string) => (s || '').replace(/\{name\}/g, greetName);

  const bodyDe = fill(copy.body.de);
  const bodyEn = fill(copy.body.en);
  const subject = [copy.subject.de, copy.subject.en]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' / ');

  const text = `${bodyDe}\n\n— — —\n\n${bodyEn}\n\n${FOOTER_ORG}`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1c1917;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;letter-spacing:0.06em;">OETZ TROPHY</div>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-top:4px solid #f59e0b;padding:24px;">
      ${paragraphsToHtml(bodyDe)}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;"/>
      ${paragraphsToHtml(bodyEn)}
    </div>
    <p style="font-size:12px;color:#78716c;padding:14px 4px;margin:0;">${escapeHtml(FOOTER_ORG)}</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendVolunteerThankYouEmail(
  to: string,
  input: VolunteerThankYouInput,
  copy: VolunteerEmailCopy,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!to || !apiKey) return false;

  try {
    const { subject, html, text } = buildVolunteerThankYouEmail(input, copy);
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html, text }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false; // best-effort: never let email failures block the signup response
  }
}

// ─── Internal notification to the organisers ─────────────────────────────────

export type VolunteerNotificationInput = {
  name: string;
  email: string;
  tshirtSize: string | null;
  /** Human-readable role labels (already mapped from stable keys). */
  roles: string[];
  /** Human-readable availability-day labels. */
  availability: string[];
  otherHelp: string | null;
  experience: string | null;
  isTest?: boolean;
};

export function buildVolunteerNotificationEmail(input: VolunteerNotificationInput): {
  subject: string;
  html: string;
  text: string;
} {
  const dash = '—';
  const rows: [string, string][] = [
    ['Name', input.name],
    ['Email', input.email],
    ['T-shirt', input.tshirtSize || dash],
    ['Roles', input.roles.length ? input.roles.join(', ') : dash],
    ['Availability', input.availability.length ? input.availability.join(', ') : dash],
    ['Other help', (input.otherHelp || '').trim() || dash],
    ['Experience', (input.experience || '').trim() || dash],
  ];

  const subject = `${input.isTest ? '[TEST] ' : ''}New volunteer signup — ${input.name}`;

  const text = [
    `New volunteer signup${input.isTest ? ' (TEST)' : ''}:`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'OETZ TROPHY · volunteer form',
  ].join('\n');

  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#78716c;font-size:13px;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 12px;font-size:14px;color:#1c1917;">${escapeHtml(v)}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1c1917;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:700;letter-spacing:0.06em;">OETZ TROPHY${input.isTest ? ' · TEST' : ''}</div>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-top:4px solid #f59e0b;padding:16px 0;">
      <p style="margin:0 0 12px;padding:0 12px;font-size:15px;font-weight:600;">New volunteer signup</p>
      <table style="width:100%;border-collapse:collapse;">${htmlRows}</table>
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendVolunteerNotificationEmail(
  to: string,
  input: VolunteerNotificationInput,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!to || !apiKey) return false;

  try {
    const { subject, html, text } = buildVolunteerNotificationEmail(input);
    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      // reply_to = the volunteer, so organisers can answer the signup directly.
      body: JSON.stringify({ from: FROM, to: [to], reply_to: input.email || REPLY_TO, subject, html, text }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
