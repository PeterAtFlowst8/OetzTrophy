export const REGISTRATION_OPENS_AT = '2026-06-17T00:00:00+02:00';

export function isRegistrationOpen(now = new Date()) {
  return now >= new Date(REGISTRATION_OPENS_AT);
}

/** The registration open date, formatted for display in the given locale. */
export function registrationOpensLabel(locale: string) {
  return new Date(REGISTRATION_OPENS_AT).toLocaleDateString(
    locale === 'de' ? 'de-AT' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );
}
