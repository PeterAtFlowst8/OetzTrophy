/**
 * Registration opening logic.
 *
 * The opening date is managed by the client in Studio ("Festival Dates &
 * Registration" → Registration opens). Pass that value in from settings. When
 * it is missing (Sanity empty/outage), we fall back to the built-in date so the
 * site never breaks.
 */
export const REGISTRATION_OPENS_AT_FALLBACK = '2026-06-17T00:00:00+02:00';

export function isRegistrationOpen(
  opensAt?: string | null,
  now: Date = new Date(),
) {
  return now >= new Date(opensAt || REGISTRATION_OPENS_AT_FALLBACK);
}

/** The registration open date, formatted for display in the given locale. */
export function registrationOpensLabel(locale: string, opensAt?: string | null) {
  return new Date(opensAt || REGISTRATION_OPENS_AT_FALLBACK).toLocaleDateString(
    locale === 'de' ? 'de-AT' : 'en-GB',
    // Format in Austria's timezone so the date isn't shifted to the previous
    // day when rendered on a UTC server (e.g. Vercel).
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna' },
  );
}
