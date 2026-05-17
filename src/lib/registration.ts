export const REGISTRATION_OPENS_AT = '2026-06-01T00:00:00+02:00';

export function isRegistrationOpen(now = new Date()) {
  return now >= new Date(REGISTRATION_OPENS_AT);
}
