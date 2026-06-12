/**
 * Bilingual registration-confirmation email via Resend (spec §12).
 * Config-symmetric: no RESEND_API_KEY → disabled (local dev / pre-launch prod).
 * Sent from the Stripe webhook on a row's first flip to paid; sending is
 * best-effort and must never block the webhook's 200.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'OETZ TROPHY <noreply@oetz-trophy.com>';
const REPLY_TO = 'info@oetz-trophy.com';

export type ConfirmationEmailInput = { firstName: string | null; name: string };

export function isConfirmationEmailEnabled(
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

export function buildConfirmationEmail(input: ConfirmationEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const greetName = (input.firstName || '').trim() || input.name;
  const safeName = escapeHtml(greetName);

  const subject = 'Anmeldung bestätigt / Registration confirmed — OETZ TROPHY 2026';

  const text = [
    `Hallo ${greetName},`,
    '',
    'deine Anmeldung zum OETZ TROPHY Rennwochenende 2026 ist bestätigt — deine Zahlung ist eingegangen.',
    '',
    'Wann: 17.–20. September 2026',
    'Wo: Oetz, Ötztal (Tirol)',
    'Programm: https://oetz-trophy.com/de/programm',
    '',
    'Details zum Ablauf folgen vor dem Event per E-Mail. Du erhältst außerdem eine separate Zahlungsquittung von Stripe.',
    'Fragen? info@oetz-trophy.com',
    '',
    'Wir sehen uns auf der Ötztaler Ache!',
    '',
    '— — —',
    '',
    `Hi ${greetName},`,
    '',
    'your registration for the OETZ TROPHY race weekend 2026 is confirmed — your payment has been received.',
    '',
    'When: 17–20 September 2026',
    'Where: Oetz, Ötztal (Tyrol)',
    'Programme: https://oetz-trophy.com/en/programm',
    '',
    'Further details will follow by email before the event. You will also receive a separate payment receipt from Stripe.',
    'Questions? info@oetz-trophy.com',
    '',
    'See you on the Ötztaler Ache!',
    '',
    'OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria',
  ].join('\n');

  const block = (lines: string[]) =>
    lines.map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;">${l}</p>`).join('');

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1c1917;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;letter-spacing:0.06em;">OETZ TROPHY</div>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-top:4px solid #f59e0b;padding:24px;">
      ${block([
        `Hallo ${safeName},`,
        'deine Anmeldung zum <strong>OETZ TROPHY Rennwochenende 2026</strong> ist bestätigt — deine Zahlung ist eingegangen.',
        '<strong>Wann:</strong> 17.–20. September 2026<br/><strong>Wo:</strong> Oetz, Ötztal (Tirol)',
        'Das Programm findest du unter <a href="https://oetz-trophy.com/de/programm" style="color:#b45309;">oetz-trophy.com/de/programm</a>. Details zum Ablauf folgen vor dem Event per E-Mail. Du erhältst außerdem eine separate Zahlungsquittung von Stripe.',
        'Fragen? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
        'Wir sehen uns auf der Ötztaler Ache!',
      ])}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;"/>
      ${block([
        `Hi ${safeName},`,
        'your registration for the <strong>OETZ TROPHY race weekend 2026</strong> is confirmed — your payment has been received.',
        '<strong>When:</strong> 17–20 September 2026<br/><strong>Where:</strong> Oetz, Ötztal (Tyrol)',
        'Find the programme at <a href="https://oetz-trophy.com/en/programm" style="color:#b45309;">oetz-trophy.com/en/programm</a>. Further details will follow by email before the event. You will also receive a separate payment receipt from Stripe.',
        'Questions? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
        'See you on the Ötztaler Ache!',
      ])}
    </div>
    <p style="font-size:12px;color:#78716c;padding:14px 4px;margin:0;">OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendConfirmationEmail(
  to: string,
  input: ConfirmationEmailInput,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!to || !apiKey) return false;

  try {
    const { subject, html, text } = buildConfirmationEmail(input);

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
    return false; // best-effort: never let email failures block the webhook
  }
}
