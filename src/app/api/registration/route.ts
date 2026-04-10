import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, club, nationality, experienceLevel } = body;

    if (!name || !email || !experienceLevel) {
      return NextResponse.json(
        { error: 'Name, email and experience level are required' },
        { status: 400 }
      );
    }

    const sql = getDb();

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
        SET name = ${name}, club = ${club || null}, nationality = ${nationality || null},
            experience_level = ${experienceLevel}, updated_at = NOW()
        WHERE email = ${email}
      `;
    } else {
      // Create new registration
      await sql`
        INSERT INTO registrations (name, email, club, nationality, experience_level)
        VALUES (${name}, ${email}, ${club || null}, ${nationality || null}, ${experienceLevel})
      `;
    }

    // Create Stripe Checkout Session
    const registrationFee = parseInt(process.env.REGISTRATION_FEE_CENTS || '5000', 10);

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
              name: 'Boater X Registration — OETZ TROPHY 2026',
              description: `${name}${club ? ` (${club})` : ''} — ${experienceLevel.toUpperCase()}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        email,
        name,
        type: 'boater-x-registration',
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://oetz-trophy.vercel.app'}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://oetz-trophy.vercel.app'}/registration`,
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
