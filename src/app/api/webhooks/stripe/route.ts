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
    const email = session.metadata?.email || session.customer_email;
    const paymentId = session.payment_intent as string;

    if (email) {
      const sql = getDb();
      await sql`
        UPDATE registrations
        SET status = 'paid',
            stripe_payment_id = ${paymentId},
            updated_at = NOW()
        WHERE email = ${email}
      `;
      console.log(`Registration confirmed for ${email}`);
    }
  }

  return NextResponse.json({ received: true });
}
