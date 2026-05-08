export const REGISTRATION_OPENS_AT = '2026-05-19T00:00:00+02:00';
export const PREPRODUCTION_REGISTRATION_TEST_BRANCH = 'feature/registration-preproduction-test';
export const REGISTRATION_EVENT_TYPES = ['oetz-trophy', 'boater-x'] as const;

export type RegistrationEventType = (typeof REGISTRATION_EVENT_TYPES)[number];

export type RegistrationInput = {
  name?: string;
  email?: string;
  experienceLevel?: string;
  eventType?: string;
  waiverAccepted?: boolean;
};

function isTruthy(value: string | undefined) {
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

export function isPreproductionRegistrationTestMode() {
  const explicitTestMode = process.env.NEXT_PUBLIC_REGISTRATION_TEST_MODE ?? process.env.REGISTRATION_TEST_MODE;

  if (explicitTestMode !== undefined) {
    return isTruthy(explicitTestMode.toLowerCase());
  }

  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
  const gitRef = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? process.env.VERCEL_GIT_COMMIT_REF;

  return vercelEnv === 'preview' && gitRef === PREPRODUCTION_REGISTRATION_TEST_BRANCH;
}

export function isRegistrationOpen(now = new Date()) {
  return isPreproductionRegistrationTestMode() || now >= new Date(REGISTRATION_OPENS_AT);
}

export function isRegistrationEventType(value: string | undefined): value is RegistrationEventType {
  return REGISTRATION_EVENT_TYPES.includes(value as RegistrationEventType);
}

export function validateRegistrationInput(input: RegistrationInput) {
  if (!input.name || !input.email || !input.experienceLevel) {
    return { valid: false, error: 'Name, email and experience level are required' };
  }

  if (!isRegistrationEventType(input.eventType)) {
    return { valid: false, error: 'Please choose OETZ TROPHY or Boater X' };
  }

  if (!input.waiverAccepted) {
    return { valid: false, error: 'You must accept the waiver, conditions and privacy policy' };
  }

  return { valid: true };
}
