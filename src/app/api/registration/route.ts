import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';
import { parseRegistrationInput } from '@/lib/registrationInput';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getStripe } from '@/lib/stripe';
import { getSiteSettings } from '@/lib/settings';
import { SITE_URL } from '@/lib/site';

const DEFAULT_EXPERIENCE_LEVEL = 'race-eligible';

async function ensureRegistrationSchema(sql: ReturnType<typeof getDb>) {
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT NOT NULL UNIQUE,
      club TEXT,
      nationality TEXT,
      tshirt_size TEXT,
      experience_level TEXT NOT NULL,
      accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
      accepted_awp_rules BOOLEAN NOT NULL DEFAULT FALSE,
      confirmed_over_18 BOOLEAN NOT NULL DEFAULT FALSE,
      stripe_session_id TEXT,
      stripe_payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS first_name TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS last_name TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS tshirt_size TEXT`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS accepted_awp_rules BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS confirmed_over_18 BOOLEAN NOT NULL DEFAULT FALSE`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rate = checkRateLimit({ key: `reg:${ip}`, limit: 5, windowMs: 10 * 60_000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
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
    const { firstName, lastName, name, email, nationality, tshirtSize, acceptedTerms, acceptedAwpRules, confirmedOver18 } = parsed.value;

    const sql = getDb();
    await ensureRegistrationSchema(sql);

    // Check for existing registration
    const existing = await sql`
      SELECT id, status FROM registrations WHERE email = ${email}
    `;

    if (existing.length > 0) {
      if (existing[0].status === 'paid') {
        return NextResponse.json(
          { error: 'This email is already registered and paid' },
          { status: 409 }
        );
      }
      // Update existing pending registration
      await sql`
        UPDATE registrations
        SET name = ${name},
            first_name = ${firstName},
            last_name = ${lastName},
            club = NULL,
            nationality = ${nationality},
            tshirt_size = ${tshirtSize},
            experience_level = ${DEFAULT_EXPERIENCE_LEVEL},
            accepted_terms = ${acceptedTerms},
            accepted_awp_rules = ${acceptedAwpRules},
            confirmed_over_18 = ${confirmedOver18},
            updated_at = NOW()
        WHERE email = ${email}
      `;
    } else {
      // Create new registration
      await sql`
        INSERT INTO registrations (
          name,
          first_name,
          last_name,
          email,
          club,
          nationality,
          tshirt_size,
          experience_level,
          accepted_terms,
          accepted_awp_rules,
          confirmed_over_18
        )
        VALUES (
          ${name},
          ${firstName},
          ${lastName},
          ${email},
          NULL,
          ${nationality},
          ${tshirtSize},
          ${DEFAULT_EXPERIENCE_LEVEL},
          ${acceptedTerms},
          ${acceptedAwpRules},
          ${confirmedOver18}
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
