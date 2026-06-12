import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isRegistrationOpen, isRegistrationTestMode } from '@/lib/registration';
import { getStripe } from '@/lib/stripe';
import { getSiteSettings } from '@/lib/settings';
import { SITE_URL } from '@/lib/site';

const TSHIRT_SIZES = new Set(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
const DEFAULT_EXPERIENCE_LEVEL = 'race-eligible';

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

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
    const settings = await getSiteSettings();

    if (!isRegistrationOpen(settings.registrationOpensAt) && !isRegistrationTestMode()) {
      return NextResponse.json(
        { error: 'Registration is not open yet' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const email = clean(body.email).toLowerCase();
    const nationality = clean(body.nationality);
    const tshirtSize = clean(body.tshirtSize).toUpperCase();
    const acceptedTerms = body.acceptedTerms === true;
    const acceptedAwpRules = body.acceptedAwpRules === true;
    const confirmedOver18 = body.confirmedOver18 === true;
    const name = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !email || !nationality || !tshirtSize) {
      return NextResponse.json(
        { error: 'First name, last name, email, nationality and t-shirt size are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@') || !TSHIRT_SIZES.has(tshirtSize)) {
      return NextResponse.json(
        { error: 'Please check your email and t-shirt size' },
        { status: 400 }
      );
    }

    if (!acceptedTerms || !acceptedAwpRules || !confirmedOver18) {
      return NextResponse.json(
        { error: 'All confirmations are required' },
        { status: 400 }
      );
    }

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
