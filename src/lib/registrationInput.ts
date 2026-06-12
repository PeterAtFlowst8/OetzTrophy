/** Validation for POST /api/registration bodies. Pure — vitest-covered. */

export const TSHIRT_SIZES = new Set(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_NATIONALITY = 100;
// Pragmatic email shape: something@something.tld — full RFC validation is a
// trap; Stripe re-validates on checkout anyway.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  nationality: string;
  tshirtSize: string;
  acceptedTerms: true;
  acceptedAwpRules: true;
  confirmedOver18: true;
  turnstileToken: string;
};

type ParseResult = { ok: true; value: RegistrationInput } | { ok: false; error: string };

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseRegistrationInput(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid request body' };
  }
  const b = body as Record<string, unknown>;

  const firstName = clean(b.firstName);
  const lastName = clean(b.lastName);
  const email = clean(b.email).toLowerCase();
  const nationality = clean(b.nationality);
  const tshirtSize = clean(b.tshirtSize).toUpperCase();
  const turnstileToken = clean(b.turnstileToken);

  if (!firstName || !lastName || !email || !nationality || !tshirtSize) {
    return { ok: false, error: 'First name, last name, email, nationality and t-shirt size are required' };
  }
  if (firstName.length > MAX_NAME || lastName.length > MAX_NAME || nationality.length > MAX_NATIONALITY) {
    return { ok: false, error: 'Please check the length of your entries' };
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email) || !TSHIRT_SIZES.has(tshirtSize)) {
    return { ok: false, error: 'Please check your email and t-shirt size' };
  }
  if (b.acceptedTerms !== true || b.acceptedAwpRules !== true || b.confirmedOver18 !== true) {
    return { ok: false, error: 'All confirmations are required' };
  }

  return {
    ok: true,
    value: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      nationality,
      tshirtSize,
      acceptedTerms: true,
      acceptedAwpRules: true,
      confirmedOver18: true,
      turnstileToken,
    },
  };
}
