export const REGISTRATION_OPENS_AT = '2026-05-19T00:00:00+02:00';

export function isRegistrationOpen(now = new Date()) {
  return now >= new Date(REGISTRATION_OPENS_AT);
}
