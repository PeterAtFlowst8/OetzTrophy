/**
 * Builds the Stripe Checkout Session for a race-weekend registration. Extracted
 * from the registration route so the payment-reminder "resume" flow can mint a
 * fresh session for an existing row using identical fee logic, metadata, and
 * redirect URLs. Behaviour is intentionally byte-for-byte the same as the
 * original inline code (the registration route test pins this).
 *
 * Stripe Checkout Sessions expire after 24h max — this is why the reminder email
 * links to a route that calls this again rather than reusing a stale URL.
 */
import { getStripe } from './stripe';
import { SITE_URL } from './site';

export type CheckoutSessionInput = {
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  nationality: string | null;
  tshirtSize: string | null;
  category: string;
  settings: { registrationFeeEur?: number | null };
};

export async function createRegistrationCheckoutSession(input: CheckoutSessionInput) {
  const { email, name, firstName, lastName, nationality, tshirtSize, category, settings } = input;

  // Fee priority: client-managed Studio value -> env override -> built-in default.
  const registrationFee =
    typeof settings.registrationFeeEur === 'number' && settings.registrationFeeEur > 0
      ? Math.round(settings.registrationFeeEur * 100)
      : parseInt(process.env.REGISTRATION_FEE_CENTS || '13500', 10);

  return getStripe().checkout.sessions.create({
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
            description: `${name} (${nationality ?? ''}) - T-shirt ${tshirtSize ?? ''}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      email,
      name,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      nationality: nationality ?? '',
      tshirtSize: tshirtSize ?? '',
      category,
      type: 'race-weekend-registration',
    },
    success_url: `${SITE_URL}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/registration`,
  });
}
