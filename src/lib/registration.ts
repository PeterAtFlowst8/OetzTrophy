export const REGISTRATION_OPENS_AT = '2026-05-19T00:00:00+02:00';
export const PREPRODUCTION_REGISTRATION_TEST_BRANCH = 'feature/registration-preproduction-test';

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
