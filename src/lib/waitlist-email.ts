/**
 * Bilingual waiting-list email via Resend. Mirrors confirmation-email.ts:
 * config-symmetric (no RESEND_API_KEY → disabled) and best-effort (never blocks
 * the registration response). Sent inline when a full category diverts an entry
 * to the waiting list. No payment is involved.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = 'OETZ TROPHY <noreply@oetz-trophy.com>';
const REPLY_TO = 'info@oetz-trophy.com';

export type WaitlistEmailInput = { firstName: string | null; name: string };

export function isWaitlistEmailEnabled(
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

export function buildWaitlistEmail(input: WaitlistEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const greetName = (input.firstName || '').trim() || input.name;
  const safeName = escapeHtml(greetName);

  const subject = 'Warteliste / Waiting list — OETZ TROPHY 2026';

  const text = [
    `Hallo ${greetName},`,
    '',
    'danke für dein Interesse am OETZ TROPHY Rennwochenende 2026. Aktuell sind alle Startplätze in deiner Wertung vergeben — du stehst jetzt auf der Warteliste.',
    '',
    'Es wurde keine Zahlung vorgenommen. Sobald ein Platz frei wird, melden wir uns per E-Mail mit dem Link zur Anmeldung.',
    '',
    'Wann: 17.–20. September 2026',
    'Wo: Oetz, Ötztal (Tirol)',
    'Fragen? info@oetz-trophy.com',
    '',
    'Wir hoffen, dich auf der Ötztaler Ache zu sehen!',
    '',
    '— — —',
    '',
    `Hi ${greetName},`,
    '',
    'thanks for your interest in the OETZ TROPHY race weekend 2026. All spots in your category are currently taken — you are now on the waiting list.',
    '',
    'No payment has been taken. As soon as a spot opens up, we will email you with the link to register.',
    '',
    'When: 17–20 September 2026',
    'Where: Oetz, Ötztal (Tyrol)',
    'Questions? info@oetz-trophy.com',
    '',
    'We hope to see you on the Ötztaler Ache!',
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
        'danke für dein Interesse am <strong>OETZ TROPHY Rennwochenende 2026</strong>. Aktuell sind alle Startplätze in deiner Wertung vergeben — du stehst jetzt auf der <strong>Warteliste</strong>.',
        'Es wurde <strong>keine Zahlung</strong> vorgenommen. Sobald ein Platz frei wird, melden wir uns per E-Mail mit dem Link zur Anmeldung.',
        '<strong>Wann:</strong> 17.–20. September 2026<br/><strong>Wo:</strong> Oetz, Ötztal (Tirol)',
        'Fragen? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
        'Wir hoffen, dich auf der Ötztaler Ache zu sehen!',
      ])}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;"/>
      ${block([
        `Hi ${safeName},`,
        'thanks for your interest in the <strong>OETZ TROPHY race weekend 2026</strong>. All spots in your category are currently taken — you are now on the <strong>waiting list</strong>.',
        '<strong>No payment</strong> has been taken. As soon as a spot opens up, we will email you with the link to register.',
        '<strong>When:</strong> 17–20 September 2026<br/><strong>Where:</strong> Oetz, Ötztal (Tyrol)',
        'Questions? <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>',
        'We hope to see you on the Ötztaler Ache!',
      ])}
    </div>
    <p style="font-size:12px;color:#78716c;padding:14px 4px;margin:0;">OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria</p>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendWaitlistEmail(
  to: string,
  input: WaitlistEmailInput,
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!to || !apiKey) return false;

  try {
    const { subject, html, text } = buildWaitlistEmail(input);

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
    return false; // best-effort: never let email failures block the registration response
  }
}
