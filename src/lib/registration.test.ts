import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PREPRODUCTION_REGISTRATION_TEST_BRANCH,
  isPreproductionRegistrationTestMode,
  isRegistrationOpen,
  validateRegistrationInput,
} from './registration';

describe('registration availability', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps registration closed before the public opening date by default', () => {
    expect(isRegistrationOpen(new Date('2026-05-18T12:00:00+02:00'))).toBe(false);
  });

  it('opens registration after the public opening date', () => {
    expect(isRegistrationOpen(new Date('2026-05-19T00:00:00+02:00'))).toBe(true);
  });

  it('allows explicit pre-production test mode', () => {
    vi.stubEnv('NEXT_PUBLIC_REGISTRATION_TEST_MODE', 'true');

    expect(isPreproductionRegistrationTestMode()).toBe(true);
    expect(isRegistrationOpen(new Date('2026-05-18T12:00:00+02:00'))).toBe(true);
  });

  it('allows the dedicated Vercel preview branch to test registration', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF', PREPRODUCTION_REGISTRATION_TEST_BRANCH);

    expect(isPreproductionRegistrationTestMode()).toBe(true);
  });

  it('does not enable test mode for production deployments', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF', PREPRODUCTION_REGISTRATION_TEST_BRANCH);

    expect(isPreproductionRegistrationTestMode()).toBe(false);
  });
});

describe('validateRegistrationInput', () => {
  const validInput = {
    name: 'Jane Paddler',
    email: 'jane@example.com',
    experienceLevel: 'ww5',
    eventType: 'oetz-trophy',
    waiverAccepted: true,
  };

  it('accepts an OETZ TROPHY registration selection with waiver agreement', () => {
    expect(validateRegistrationInput(validInput)).toEqual({ valid: true });
  });

  it('accepts a Boater X only registration selection with waiver agreement', () => {
    expect(validateRegistrationInput({ ...validInput, eventType: 'boater-x' })).toEqual({ valid: true });
  });

  it('requires the participant to choose what they are registering for', () => {
    expect(validateRegistrationInput({ ...validInput, eventType: '' })).toEqual({
      valid: false,
      error: 'Please choose OETZ TROPHY or Boater X',
    });
  });

  it('requires waiver and conditions agreement', () => {
    expect(validateRegistrationInput({ ...validInput, waiverAccepted: false })).toEqual({
      valid: false,
      error: 'You must accept the waiver, conditions and privacy policy',
    });
  });
});
