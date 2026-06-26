import { NextRequest, NextResponse } from 'next/server';
import { verifyActionToken } from '@/lib/registration-links';
import { getRegistrationById, setRegistrationSessionId } from '@/lib/db';
import { createRegistrationCheckoutSession } from '@/lib/checkout';
import { getSiteSettings } from '@/lib/settings';
import { SITE_URL } from '@/lib/site';
import { renderActionPage } from '@/lib/registration-action-page';

function notice(status: number, heading: string, de: string[], en: string[]) {
  return new NextResponse(renderActionPage({ heading, de, en }), {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/**
 * "Complete payment" link from the reminder email. Mints a FRESH Checkout session
 * for the row (the original link is dead after 24h) and redirects to Stripe. Paid
 * rows skip straight to the success page; nothing is charged twice.
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
    return NextResponse.redirect(`${SITE_URL}/registration/success`, 303);
  }

  const settings = await getSiteSettings();
  const session = await createRegistrationCheckoutSession({
    email: row.email,
    name: row.name,
    firstName: row.firstName,
    lastName: row.lastName,
    nationality: row.nationality,
    tshirtSize: row.tshirtSize,
    category: row.category ?? '',
    settings,
  });
  await setRegistrationSessionId(row.id, session.id);
  return NextResponse.redirect(session.url as string, 303);
}
