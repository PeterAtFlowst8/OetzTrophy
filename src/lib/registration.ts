/**
 * Registration opening logic.
 *
 * The opening date is managed by the client in Studio ("Festival Dates &
 * Registration" → Registration opens). Pass that value in from settings. When
 * it is missing (Sanity empty/outage), we fall back to the built-in date so the
 * site never breaks.
 */
export const REGISTRATION_OPENS_AT_FALLBACK = '2026-06-17T18:00:00+02:00';

export function isRegistrationOpen(
  opensAt?: string | null,
  now: Date = new Date(),
) {
  return now >= new Date(opensAt || REGISTRATION_OPENS_AT_FALLBACK);
}

const TEST_MODE_TRUTHY = new Set(['1', 'true', 'yes', 'on']);

/**
 * Preview-only override that opens registration for end-to-end payment
 * testing (spec: docs/superpowers/specs/2026-06-12-registration-payment-test-design.md).
 *
 * Hard-disabled on production deployments regardless of the env var, so a
 * mis-scoped variable can never open the live site early or banner it as a
 * test site. `env` is injectable for tests; defaults to process.env.
 * Server-side only: client bundles see an empty process.env, so a no-arg call
 * in client code always returns false — decide on the server and pass props.
 */
export function isRegistrationTestMode(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if ((env.VERCEL_ENV ?? '').trim().toLowerCase() === 'production') return false;
  return TEST_MODE_TRUTHY.has((env.REGISTRATION_TEST_MODE ?? '').trim().toLowerCase());
}

/** The registration open date, formatted for display in the given locale. */
export function registrationOpensLabel(locale: string, opensAt?: string | null) {
  const when = new Date(opensAt || REGISTRATION_OPENS_AT_FALLBACK);
  const loc = locale === 'de' ? 'de-AT' : 'en-GB';
  // Format in Austria's timezone so the date/time isn't shifted when rendered
  // on a UTC server (e.g. Vercel).
  const datePart = when.toLocaleDateString(loc, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Vienna',
  });
  const timePart = when.toLocaleTimeString(loc, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Vienna',
  });
  // Registration opens in June — always CEST. Show the zone explicitly for the
  // international field rather than the locale-native abbreviation ("MESZ").
  return locale === 'de'
    ? `${datePart} um ${timePart} Uhr CEST`
    : `${datePart}, ${timePart} CEST`;
}
