import { NextRequest, NextResponse } from 'next/server';
import { verifyActionToken } from '@/lib/registration-links';
import { getRegistrationById, markRegistrationCancelled } from '@/lib/db';
import { renderActionPage } from '@/lib/registration-action-page';

function notice(status: number, heading: string, de: string[], en: string[]) {
  return new NextResponse(renderActionPage({ heading, de, en }), {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/**
 * "Deregister" link from the reminder email. Cancels an UNPAID registration only.
 * A paid athlete is never auto-cancelled (and never auto-refunded) — they are
 * routed to support instead.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  const payload = verifyActionToken(token);
  if (!payload) {
    return notice(400, 'Ungültiger Link', ['Dieser Link ist ungültig oder abgelaufen.'], ['This link is invalid or has expired.']);
  }

  const row = await getRegistrationById(payload.id);
  if (!row) {
    return notice(404, 'Nicht gefunden', ['Diese Anmeldung wurde nicht gefunden.'], ['This registration could not be found.']);
  }
  if (row.status === 'paid') {
    return notice(
      200,
      'Bereits bezahlt',
      ['Deine Zahlung ist bereits eingegangen. Um deine Anmeldung zu stornieren, schreib uns bitte an <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>.'],
      ['Your payment has already been received. To cancel your registration, please contact <a href="mailto:info@oetz-trophy.com" style="color:#b45309;">info@oetz-trophy.com</a>.'],
    );
  }

  await markRegistrationCancelled(row.id);
  return notice(
    200,
    'Abgemeldet',
    ['Deine Anmeldung wurde storniert. Es wurde keine Zahlung vorgenommen.'],
    ["You've been deregistered. No payment was taken."],
  );
}
