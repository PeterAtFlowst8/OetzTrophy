export const REGISTRATION_OPENS_AT = '2026-06-17T00:00:00+02:00';

export function isRegistrationOpen(now = new Date()) {
  return now >= new Date(REGISTRATION_OPENS_AT);
}

/** The registration open date, formatted for display in the given locale. */
export function registrationOpensLabel(locale: string) {
  return new Date(REGISTRATION_OPENS_AT).toLocaleDateString(
    locale === 'de' ? 'de-AT' : 'en-GB',
    // Format in Austria's timezone so the date isn't shifted to the previous
    // day when rendered on a UTC server (e.g. Vercel).
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna' },
  );
}
