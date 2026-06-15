import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema } from '@/lib/db';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';
import { parseRegistrationInput } from '@/lib/registrationInput';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getTurnstileConfig, verifyTurnstileToken } from '@/lib/turnstile';
import { getStripe } from '@/lib/stripe';
import { getSiteSettings } from '@/lib/settings';
import { resolveCaps, isCategoryFull } from '@/lib/capacity';
import { isWaitlistEmailEnabled, sendWaitlistEmail } from '@/lib/waitlist-email';
import { SITE_URL } from '@/lib/site';

const DEFAULT_EXPERIENCE_LEVEL = 'race-eligible';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit({ key: `reg:${ip}`, limit: 5, windowMs: 10 * 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.', code: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    const settings = await getSiteSettings();

    if (!isRegistrationOpen(settings.registrationOpensAt) && !isRegistrationTestMode()) {
      return NextResponse.json(
        { error: 'Registration is not open yet' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = parseRegistrationInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { firstName, lastName, name, email, nationality, tshirtSize, category, acceptedTerms, acceptedAwpRules, confirmedOver18 } = parsed.value;

    const turnstile = getTurnstileConfig();
    if (turnstile === 'misconfigured') {
      console.error('Turnstile misconfigured: exactly one of site/secret key is set — failing closed');
      return NextResponse.json({ error: 'Registration is temporarily unavailable' }, { status: 500 });
    }
    if (turnstile === 'enforced') {
      const human = await verifyTurnstileToken(parsed.value.turnstileToken, ip);
      if (!human) {
        return NextResponse.json(
          { error: 'Verification failed — please try again', code: 'turnstile_failed' },
          { status: 400 },
        );
      }
    }

    const sql = getDb();
    await ensureSchema(sql);

    // Check for existing registration
    const existing = await sql`
      SELECT id, status FROM registrations WHERE email = ${email}
    `;

    // Already paid? short-circuit before any capacity work.
    if (existing.length > 0 && existing[0].status === 'paid') {
      return NextResponse.json(
        { error: 'This email is already registered and paid', code: 'already_registered' },
        { status: 409 },
      );
    }

    // Capacity (paid-only) for the chosen category.
    const caps = resolveCaps(settings);
    const cap = category === 'men' ? caps.men : caps.women;
    const paidRows = await sql`
      SELECT count(*)::int AS n FROM registrations WHERE category = ${category} AND status = 'paid'
    `;
    const paidCount = (paidRows[0]?.n as number) ?? 0;

    if (isCategoryFull(paidCount, cap)) {
      // Full → waiting list. No pending row, no Stripe. Insert-if-new is idempotent.
      const inserted = await sql`
        INSERT INTO waitlist (
          name, first_name, last_name, email, category, nationality, tshirt_size,
          accepted_terms, accepted_awp_rules, confirmed_over_18, is_test
        )
        VALUES (
          ${name}, ${firstName}, ${lastName}, ${email}, ${category}, ${nationality}, ${tshirtSize},
          ${acceptedTerms}, ${acceptedAwpRules}, ${confirmedOver18}, ${isRegistrationTestMode()}
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      if (inserted.length > 0 && isWaitlistEmailEnabled()) {
        await sendWaitlistEmail(email, { firstName, name });
      }
      return NextResponse.json({ waitlisted: true });
    }

    // Space available → existing flow (now carrying category).
    if (existing.length > 0) {
      await sql`
        UPDATE registrations
        SET name = ${name}, first_name = ${firstName}, last_name = ${lastName}, club = NULL,
            nationality = ${nationality}, tshirt_size = ${tshirtSize}, category = ${category},
            experience_level = ${DEFAULT_EXPERIENCE_LEVEL},
            accepted_terms = ${acceptedTerms}, accepted_awp_rules = ${acceptedAwpRules},
            confirmed_over_18 = ${confirmedOver18}, updated_at = NOW()
        WHERE email = ${email}
      `;
    } else {
      await sql`
        INSERT INTO registrations (
          name, first_name, last_name, email, club, nationality, tshirt_size, category,
          experience_level, accepted_terms, accepted_awp_rules, confirmed_over_18
        )
        VALUES (
          ${name}, ${firstName}, ${lastName}, ${email}, NULL, ${nationality}, ${tshirtSize}, ${category},
          ${DEFAULT_EXPERIENCE_LEVEL}, ${acceptedTerms}, ${acceptedAwpRules}, ${confirmedOver18}
        )
      `;
    }

    // Create Stripe Checkout Session.
    // Fee priority: client-managed Studio value -> env override -> built-in default.
    const registrationFee =
      typeof settings.registrationFeeEur === 'number' && settings.registrationFeeEur > 0
        ? Math.round(settings.registrationFeeEur * 100)
        : parseInt(process.env.REGISTRATION_FEE_CENTS || '13500', 10);

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: registrationFee,
            product_data: {
              name: 'OETZ TROPHY Race Weekend Registration 2026',
              description: `${name} (${nationality}) - T-shirt ${tshirtSize}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        email,
        name,
        firstName,
        lastName,
        nationality,
        tshirtSize,
        category,
        type: 'race-weekend-registration',
      },
      success_url: `${SITE_URL}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/registration`,
    });

    // Store session ID
    await sql`
      UPDATE registrations
      SET stripe_session_id = ${session.id}, updated_at = NOW()
      WHERE email = ${email}
    `;

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : 'unknown';
    console.error(`Registration error: ${message.replace(/\(email\)=\([^)]*\)/, '(email)=(redacted)')}`);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
