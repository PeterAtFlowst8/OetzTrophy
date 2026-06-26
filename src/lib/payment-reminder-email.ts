/**
 * Bilingual payment-reminder email via Resend. Mirrors confirmation-email.ts:
 * config-symmetric (no RESEND_API_KEY → disabled) and best-effort (never throws).
 * Sent by the pending sweep to athletes who registered but haven't paid, with two
 * self-service actions: complete payment (resume) or deregister (cancel). The
 * caller supplies the already-signed URLs, so this module stays free of crypto.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'OETZ TROPHY <noreply@oetz-trophy.com>';
const REPLY_TO = 'info@oetz-trophy.com';

export type PaymentReminderEmailInput = {
  firstName: string | null;
  name: string;
  payUrl: string;
  cancelUrl: string;
};

export function isPaymentReminderEmailEnabled(
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

export function buildPaymentReminderEmail(input: PaymentReminderEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const greetName = (input.firstName || '').trim() || input.name;
  const safeName = escapeHtml(greetName);
  const { payUrl, cancelUrl } = input;

  const subject = 'Zahlung abschließen / Complete your payment — OETZ TROPHY 2026';

  const text = [
    `Hallo ${greetName},`,
    '',
    'du hast dich zum OETZ TROPHY Rennwochenende 2026 angemeldet, aber deine Zahlung ist noch',
    'nicht eingegangen — dein Startplatz ist noch nicht gesichert.',
    '',
    `Jetzt bezahlen: ${payUrl}`,
    `Abmelden (Anmeldung stornieren): ${cancelUrl}`,
    '',
    'Wann: 17.–20. September 2026 · Wo: Oetz, Ötztal (Tirol)',
    'Fragen? info@oetz-trophy.com',
    '',
    '— — —',
    '',
    `Hi ${greetName},`,
    '',
    "you registered for the OETZ TROPHY race weekend 2026, but your payment hasn't come through",
    'yet — your spot is not secured until you pay.',
    '',
    `Complete your payment: ${payUrl}`,
    `Deregister (cancel registration): ${cancelUrl}`,
    '',
    'When: 17–20 September 2026 · Where: Oetz, Ötztal (Tyrol)',
    'Questions? info@oetz-trophy.com',
    '',
    'OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria',
  ].join('\n');

  const block = (lines: string[]) =>
    lines.map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;">${l}</p>`).join('');

  const buttons = (pay: string, cancel: string) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      <tr>
        <td style="padding:0 10px 10px 0;">
          <a href="${payUrl}" style="display:inline-block;background:#f59e0b;color:#1c1917;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:4px;font-size:15px;">${pay}</a>
        </td>
        <td style="padding:0 0 10px 0;">
          <a href="${cancelUrl}" style="display:inline-block;color:#78716c;text-decoration:underline;padding:12px 4px;font-size:14px;">${cancel}</a>
        </td>
      </tr>
    </table>`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1c1917;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;letter-spacing:0.06em;">OETZ TROPHY</div>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-top:4px solid #f59e0b;padding:24px;">
      ${block([
        `Hallo ${safeName},`,
        'du hast dich zum <strong>OETZ TROPHY Rennwochenende 2026</strong> angemeldet, aber deine Zahlung ist noch nicht eingegangen — dein Startplatz ist noch <strong>nicht gesichert</strong>.',
      ])}
      ${buttons('Jetzt bezahlen', 'Abmelden')}
      ${block([
        '<strong>Wann:</strong> 17.–20. September 2026<br/><strong>Wo:</strong> Oetz, Ötztal (Tirol)',
        'Fragen? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
      ])}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;"/>
      ${block([
        `Hi ${safeName},`,
        "you registered for the <strong>OETZ TROPHY race weekend 2026</strong>, but your payment hasn't come through yet — your spot is <strong>not secured</strong> until you pay.",
      ])}
      ${buttons('Complete payment', 'Deregister')}
      ${block([
        '<strong>When:</strong> 17–20 September 2026<br/><strong>Where:</strong> Oetz, Ötztal (Tyrol)',
        'Questions? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
      ])}
    </div>
    <p style="font-size:12px;color:#78716c;padding:14px 4px;margin:0;">OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendPaymentReminderEmail(
  to: string,
  input: PaymentReminderEmailInput,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!to || !apiKey) return false;

  try {
    const { subject, html, text } = buildPaymentReminderEmail(input);

    const res = await fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html, text }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false; // best-effort: never let email failures break the sweep
  }
}
