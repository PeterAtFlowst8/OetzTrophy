import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';
import { isConfirmationEmailEnabled, sendConfirmationEmail } from '@/lib/confirmation-email';

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

      if (isConfirmationEmailEnabled()) {
        // Atomic claim: only the FIRST webhook delivery for this row sends the
        // email; Stripe redeliveries find confirmation_sent_at already set.
        const claimed = await sql`
          UPDATE registrations
          SET confirmation_sent_at = NOW()
          WHERE id = ${updated[0].id} AND confirmation_sent_at IS NULL
          RETURNING id, email, first_name, name
        `;

        if (claimed.length > 0) {
          const row = claimed[0];
          const sent = await sendConfirmationEmail(row.email as string, {
            firstName: (row.first_name as string) ?? null,
            name: row.name as string,
          });

          if (sent) {
            console.log(`Confirmation email sent: row ${row.id}`);
          } else {
            // Release the claim so a manual Stripe event resend can retry.
            await sql`
              UPDATE registrations SET confirmation_sent_at = NULL WHERE id = ${row.id}
            `;
            console.error(`Confirmation email FAILED: row ${row.id} — claim released for manual resend`);
          }
        }
      }
    } else {
      console.warn(`Webhook session ${session.id} matched no registration row`);
    }
  }

  return NextResponse.json({ received: true });
}
