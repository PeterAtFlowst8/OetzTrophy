import { NextRequest, NextResponse } from 'next/server';
import { attachStripeSession, confirmTestRegistration, upsertPendingRegistration } from '@/lib/db';
import { checkRateLimit, getClientIp, hashRateLimitValue, rateLimitHeaders } from '@/lib/rate-limit';
import { isPreproductionRegistrationTestMode, isRegistrationOpen, normalizeRegistrationInput, validateRegistrationInput } from '@/lib/registration';
import { getStripe } from '@/lib/stripe';

const REGISTRATION_IP_LIMIT = { limit: 20, windowMs: 15 * 60 * 1000 };
const REGISTRATION_EMAIL_LIMIT = { limit: 4, windowMs: 60 * 60 * 1000 };

export async function POST(request: NextRequest) {
  try {
    const testMode = isPreproductionRegistrationTestMode();
    const clientIp = getClientIp(request.headers);
    const ipLimit = checkRateLimit({
      key: `registration:ip:${hashRateLimitValue(clientIp)}`,
      ...REGISTRATION_IP_LIMIT,
    });

    if (ipLimit.limited) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(ipLimit.retryAfter) }
      );
    }

    if (!isRegistrationOpen()) {
      return NextResponse.json(
        { error: 'Registration is not open yet' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const normalized = normalizeRegistrationInput(body);
    const validation = validateRegistrationInput(normalized);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const emailLimit = checkRateLimit({
      key: `registration:email:${hashRateLimitValue(normalized.email)}`,
      ...REGISTRATION_EMAIL_LIMIT,
    });

    if (emailLimit.limited) {
      return NextResponse.json(
        { error: 'Too many registration attempts for this email. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(emailLimit.retryAfter) }
      );
    }

    const { registration, alreadyPaid } = await upsertPendingRegistration(normalized);

    if (alreadyPaid) {
      return NextResponse.json(
        { error: 'This email is already registered and paid' },
        { status: 409 }
      );
    }

    if (testMode) {
      await confirmTestRegistration(normalized.email);

      return NextResponse.json({
        url: `${request.nextUrl.origin}/registration/success?test_registration=1`,
        testMode: true,
      });
    }

    const registrationFee = parseInt(process.env.REGISTRATION_FEE_CENTS || '5000', 10);

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: normalized.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: registrationFee,
            product_data: {
              name: `OETZ TROPHY 2026 Registration - ${normalized.eventType === 'oetz-trophy' ? 'OETZ TROPHY qualification' : 'Boater X only'}`,
              description: `${normalized.name}${normalized.club ? ` (${normalized.club})` : ''} - ${normalized.experienceLevel.toUpperCase()}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        registrationId: String(registration.id),
        email: normalized.email,
        name: normalized.name,
        type: 'race-registration',
        eventType: normalized.eventType,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://oetz-trophy.vercel.app'}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://oetz-trophy.vercel.app'}/registration`,
    });

    await attachStripeSession(registration.id, session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
