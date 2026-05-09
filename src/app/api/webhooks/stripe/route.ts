import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { confirmRegistrationPayment, recordStripeWebhookEvent } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const isNewEvent = await recordStripeWebhookEvent(event.id, event.type);
  if (!isNewEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, ignored: 'payment_not_paid' });
    }

    const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
    const updated = await confirmRegistrationPayment(session.id, paymentId);

    if (!updated) {
      console.warn(`Stripe checkout session completed without matching registration: ${session.id}`);
    }
  }

  return NextResponse.json({ received: true });
}
