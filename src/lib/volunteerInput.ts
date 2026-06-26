/** Validation for POST /api/volunteer bodies. Pure — vitest-covered. */

import { TSHIRT_SIZES } from './registrationInput';

/** Stable role keys (stored in the DB; the UI maps them to DE/EN labels). */
export const VOLUNTEER_ROLES = ['media', 'registration', 'safety', 'first_aid'] as const;
/** Stable availability-day keys (festival days). */
export const VOLUNTEER_DAYS = ['thu', 'fri', 'sat', 'sun'] as const;

const ROLE_SET = new Set<string>(VOLUNTEER_ROLES);
const DAY_SET = new Set<string>(VOLUNTEER_DAYS);

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_FREETEXT = 2000;
const MAX_TURNSTILE_TOKEN = 2048; // Cloudflare tokens are ~2 kB; cap to bound the outbound siteverify call
// Pragmatic email shape: something@something.tld — full RFC validation is a trap.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type VolunteerInput = {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  tshirtSize: string;
  roles: string[];
  availability: string[];
  otherHelp: string;
  experience: string;
  acceptedAge: boolean;
  acceptedConsent: true;
  turnstileToken: string;
};

type ParseResult = { ok: true; value: VolunteerInput } | { ok: false; error: string };

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Keep only keys present in `allowed`, lower-cased, de-duplicated, first occurrence wins. */
function cleanKeys(value: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    const key = typeof v === 'string' ? v.trim().toLowerCase() : '';
    if (allowed.has(key) && !out.includes(key)) out.push(key);
  }
  return out;
}

export function parseVolunteerInput(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid request body' };
  }
  const b = body as Record<string, unknown>;

  const firstName = clean(b.firstName);
  const lastName = clean(b.lastName);
  const email = clean(b.email).toLowerCase();
  const tshirtSize = clean(b.tshirtSize).toUpperCase();
  const otherHelp = clean(b.otherHelp);
  const experience = clean(b.experience);
  const turnstileToken = clean(b.turnstileToken);
  const roles = cleanKeys(b.roles, ROLE_SET);
  const availability = cleanKeys(b.availability, DAY_SET);

  if (turnstileToken.length > MAX_TURNSTILE_TOKEN) {
    return { ok: false, error: 'Invalid request body' };
  }
  if (!firstName || !lastName || !email) {
    return { ok: false, error: 'First name, last name and email are required' };
  }
  if (firstName.length > MAX_NAME || lastName.length > MAX_NAME) {
    return { ok: false, error: 'Please check the length of your entries' };
  }
  if (otherHelp.length > MAX_FREETEXT || experience.length > MAX_FREETEXT) {
    return { ok: false, error: 'Please shorten your free-text answers' };
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please check your email address' };
  }
  // T-shirt size is optional, but if provided it must be a known size.
  if (tshirtSize && !TSHIRT_SIZES.has(tshirtSize)) {
    return { ok: false, error: 'Please choose a valid t-shirt size' };
  }
  if (b.acceptedConsent !== true) {
    return { ok: false, error: 'The consent confirmation is required' };
  }

  return {
    ok: true,
    value: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      tshirtSize,
      roles,
      availability,
      otherHelp,
      experience,
      acceptedAge: b.acceptedAge === true,
      acceptedConsent: true,
      turnstileToken,
    },
  };
}
