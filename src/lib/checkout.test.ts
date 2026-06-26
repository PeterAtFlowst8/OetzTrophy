import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }));

import { createRegistrationCheckoutSession } from '@/lib/checkout';
import { getStripe } from '@/lib/stripe';

function stripeWithCapturedCreate() {
  const create = vi.fn().mockResolvedValue({ id: 'cs_test_x', url: 'https://stripe.test/x' });
  vi.mocked(getStripe).mockReturnValue({ checkout: { sessions: { create } } } as never);
  return create;
}

const BASE = {
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  firstName: 'Ada',
  lastName: 'Lovelace',
  nationality: 'GB',
  tshirtSize: 'M',
  category: 'women',
};

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.REGISTRATION_FEE_CENTS;
});

describe('createRegistrationCheckoutSession', () => {
  it('uses the Studio fee (eur → cents) when present', async () => {
    const create = stripeWithCapturedCreate();
    await createRegistrationCheckoutSession({ ...BASE, settings: { registrationFeeEur: 150 } });
    expect(create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(15000);
  });

  it('falls back to REGISTRATION_FEE_CENTS, then to 13500', async () => {
    const create = stripeWithCapturedCreate();

    process.env.REGISTRATION_FEE_CENTS = '9000';
    await createRegistrationCheckoutSession({ ...BASE, settings: { registrationFeeEur: null } });
    expect(create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(9000);

    delete process.env.REGISTRATION_FEE_CENTS;
    await createRegistrationCheckoutSession({ ...BASE, settings: {} });
    expect(create.mock.calls[1][0].line_items[0].price_data.unit_amount).toBe(13500);
  });

  it('builds the session with the expected shape and redirect URLs', async () => {
    const create = stripeWithCapturedCreate();
    const session = await createRegistrationCheckoutSession({ ...BASE, settings: { registrationFeeEur: 135 } });

    const args = create.mock.calls[0][0];
    expect(args.mode).toBe('payment');
    expect(args.customer_email).toBe('ada@example.com');
    expect(args.line_items[0].price_data.currency).toBe('eur');
    expect(args.line_items[0].price_data.product_data.description).toBe('Ada Lovelace (GB) - T-shirt M');
    expect(args.metadata).toMatchObject({
      email: 'ada@example.com',
      category: 'women',
      type: 'race-weekend-registration',
    });
    expect(args.success_url).toBe(
      'https://oetz-trophy.com/registration/success?session_id={CHECKOUT_SESSION_ID}',
    );
    expect(args.cancel_url).toBe('https://oetz-trophy.com/registration');
    expect(session).toEqual({ id: 'cs_test_x', url: 'https://stripe.test/x' });
  });

  it('coerces null personal fields to empty strings for Stripe metadata', async () => {
    const create = stripeWithCapturedCreate();
    await createRegistrationCheckoutSession({
      ...BASE,
      firstName: null,
      lastName: null,
      nationality: null,
      tshirtSize: null,
      settings: { registrationFeeEur: 135 },
    });
    const md = create.mock.calls[0][0].metadata;
    expect(md.firstName).toBe('');
    expect(md.nationality).toBe('');
    expect(Object.values(md).every((v) => typeof v === 'string')).toBe(true);
  });
});
