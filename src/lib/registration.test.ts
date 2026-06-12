import { describe, expect, it } from 'vitest';
import {
  isRegistrationOpen,
  isRegistrationTestMode,
  REGISTRATION_OPENS_AT_FALLBACK,
} from '@/lib/registration';

describe('isRegistrationTestMode', () => {
  it('is off by default (no env vars)', () => {
    expect(isRegistrationTestMode({})).toBe(false);
  });

  it.each(['1', 'true', 'yes', 'on', 'TRUE', 'On'])('accepts truthy value %s', (v) => {
    expect(isRegistrationTestMode({ REGISTRATION_TEST_MODE: v })).toBe(true);
  });

  it.each(['0', 'false', 'off', '', 'banana'])('rejects non-truthy value %s', (v) => {
    expect(isRegistrationTestMode({ REGISTRATION_TEST_MODE: v })).toBe(false);
  });

  it.each(['production', 'Production', 'PRODUCTION'])(
    'is ALWAYS off on production deployments (VERCEL_ENV=%s), even when the flag is set',
    (vercelEnv) => {
      expect(
        isRegistrationTestMode({ REGISTRATION_TEST_MODE: '1', VERCEL_ENV: vercelEnv }),
      ).toBe(false);
    },
  );

  it('works on preview deployments', () => {
    expect(
      isRegistrationTestMode({ REGISTRATION_TEST_MODE: '1', VERCEL_ENV: 'preview' }),
    ).toBe(true);
  });

  it('composes with the date gate: closed date + test mode means open', () => {
    const closedNow = new Date('2026-06-12T00:00:00+02:00');
    const dateOpen = isRegistrationOpen(null, closedNow);
    const testMode = isRegistrationTestMode({ REGISTRATION_TEST_MODE: '1', VERCEL_ENV: 'preview' });
    expect(dateOpen).toBe(false);
    expect(dateOpen || testMode).toBe(true);
  });
});

describe('isRegistrationOpen (unchanged behaviour)', () => {
  it('is closed before the fallback date', () => {
    expect(isRegistrationOpen(null, new Date('2026-06-16T00:00:00+02:00'))).toBe(false);
  });

  it('opens at the stored instant', () => {
    expect(isRegistrationOpen(null, new Date(REGISTRATION_OPENS_AT_FALLBACK))).toBe(true);
  });

  it('respects a Studio-managed date', () => {
    expect(
      isRegistrationOpen('2026-06-10T00:00:00+02:00', new Date('2026-06-12T00:00:00+02:00')),
    ).toBe(true);
  });
});
