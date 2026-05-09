import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
  beginStripeWebhookEvent,
  confirmRegistrationPayment,
  markStripeWebhookEventFailed,
  markStripeWebhookEventProcessed,
} from '@/lib/db';

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

  const shouldProcessEvent = await beginStripeWebhookEvent(event.id, event.type);
  if (!shouldProcessEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status !== 'paid') {
        await markStripeWebhookEventProcessed(event.id);
        return NextResponse.json({ received: true, ignored: 'payment_not_paid' });
      }

      const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
      const updated = await confirmRegistrationPayment(session.id, paymentId);

      if (!updated) {
        throw new Error(`Stripe checkout session completed without matching registration: ${session.id}`);
      }
    }

    await markStripeWebhookEventProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    await markStripeWebhookEventFailed(event.id, error);
    console.error('Stripe webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
