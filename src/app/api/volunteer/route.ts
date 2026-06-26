import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, insertVolunteer } from '@/lib/db';
import { parseVolunteerInput } from '@/lib/volunteerInput';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getTurnstileConfig, verifyTurnstileToken } from '@/lib/turnstile';
import { isRegistrationTestMode } from '@/lib/registration';
import {
  isVolunteerEmailEnabled,
  sendVolunteerThankYouEmail,
  sendVolunteerNotificationEmail,
} from '@/lib/volunteer-email';
import { roleLabels, dayLabels } from '@/lib/volunteerLabels';
import { getVolunteerEmailCopy } from '@/lib/volunteer-email-copy';

const ORGANIZER_EMAIL = process.env.VOLUNTEER_NOTIFY_EMAIL || 'info@oetz-trophy.com';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit({ key: `vol:${ip}`, limit: 5, windowMs: 10 * 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.', code: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = parseVolunteerInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const v = parsed.value;

    const turnstile = getTurnstileConfig();
    if (turnstile === 'misconfigured') {
      console.error('Turnstile misconfigured: exactly one of site/secret key is set — failing closed');
      return NextResponse.json({ error: 'Volunteer signup is temporarily unavailable' }, { status: 500 });
    }
    if (turnstile === 'enforced') {
      const human = await verifyTurnstileToken(v.turnstileToken, ip);
      if (!human) {
        return NextResponse.json(
          { error: 'Verification failed — please try again', code: 'turnstile_failed' },
          { status: 400 },
        );
      }
    }

    const isTest = isRegistrationTestMode();

    const sql = getDb();
    await ensureSchema(sql);
    await insertVolunteer(
      {
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        tshirtSize: v.tshirtSize || null,
        roles: v.roles,
        availability: v.availability,
        otherHelp: v.otherHelp || null,
        experience: v.experience || null,
        acceptedAge: v.acceptedAge,
        acceptedConsent: v.acceptedConsent,
        isTest,
      },
      sql,
    );

    // Best-effort emails — a delivery failure must never fail the signup.
    if (isVolunteerEmailEnabled()) {
      const roles = roleLabels(v.roles);
      const availability = dayLabels(v.availability);
      const copy = await getVolunteerEmailCopy();
      await Promise.allSettled([
        sendVolunteerThankYouEmail(v.email, { firstName: v.firstName, name: v.name }, copy),
        sendVolunteerNotificationEmail(ORGANIZER_EMAIL, {
          name: v.name,
          email: v.email,
          tshirtSize: v.tshirtSize,
          roles,
          availability,
          otherHelp: v.otherHelp || null,
          experience: v.experience || null,
          isTest,
        }),
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : 'unknown';
    console.error(`Volunteer signup error: ${message.replace(/\(email\)=\([^)]*\)/, '(email)=(redacted)')}`);
    return NextResponse.json({ error: 'Volunteer signup failed. Please try again.' }, { status: 500 });
  }
}
