import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentId = session.payment_intent as string;
    const email = session.metadata?.email || session.customer_email;
    const sql = getDb();

    // Primary match: the session id our server minted for exactly this
    // registration row. Email is user-supplied and only a fallback.
    let updated = await sql`
      UPDATE registrations
      SET status = 'paid', stripe_payment_id = ${paymentId}, updated_at = NOW()
      WHERE stripe_session_id = ${session.id}
      RETURNING id
    `;

    if (updated.length === 0 && email) {
      updated = await sql`
        UPDATE registrations
        SET status = 'paid', stripe_payment_id = ${paymentId}, updated_at = NOW()
        WHERE email = ${email}
        RETURNING id
      `;
    }

    if (updated.length > 0) {
      // GDPR: row id only — never log email addresses (PII) to Vercel logs.
      console.log(`Registration paid: row ${updated[0].id}`);
    } else {
      console.warn(`Webhook session ${session.id} matched no registration row`);
    }
  }

  return NextResponse.json({ received: true });
}
