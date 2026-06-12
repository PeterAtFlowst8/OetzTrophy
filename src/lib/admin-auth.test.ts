import { describe, expect, it } from 'vitest';
import { createAdminToken, verifyAdminToken, verifyAdminPassword } from '@/lib/admin-auth';

const env = { ADMIN_PASSWORD: 'correct-horse', ADMIN_SESSION_SECRET: 'sssh-signing-secret' };

describe('admin token round-trip', () => {
  it('verifies a freshly created token', () => {
    const token = createAdminToken(env, 1_000_000);
    expect(verifyAdminToken(token, env, 1_000_000 + 60_000)).toBe(true);
  });

  it('rejects an expired token', () => {
    const token = createAdminToken(env, 1_000_000);
    const thirteenHours = 13 * 60 * 60 * 1000;
    expect(verifyAdminToken(token, env, 1_000_000 + thirteenHours)).toBe(false);
  });

  it('rejects tampered payloads and bad signatures', () => {
    const token = createAdminToken(env, 1_000_000);
    const [payload] = token.split('.');
    expect(verifyAdminToken(`${payload}.AAAA`, env, 1_000_000)).toBe(false);
    expect(verifyAdminToken(`${payload}x.${token.split('.')[1]}`, env, 1_000_000)).toBe(false);
    expect(verifyAdminToken(undefined, env, 1_000_000)).toBe(false);
    expect(verifyAdminToken('garbage', env, 1_000_000)).toBe(false);
  });

  it('rejects tokens signed with a different secret', () => {
    const token = createAdminToken({ ...env, ADMIN_SESSION_SECRET: 'other' }, 1_000_000);
    expect(verifyAdminToken(token, env, 1_000_000)).toBe(false);
  });

  it('throws when creating without a secret', () => {
    expect(() => createAdminToken({ ADMIN_PASSWORD: 'x' }, 1_000_000)).toThrow();
  });
});

describe('verifyAdminPassword', () => {
  it('accepts the right password (timing-safe)', () => {
    expect(verifyAdminPassword('correct-horse', env)).toBe(true);
  });
  it('rejects wrong/empty passwords and unset env', () => {
    expect(verifyAdminPassword('wrong', env)).toBe(false);
    expect(verifyAdminPassword('', env)).toBe(false);
    expect(verifyAdminPassword('anything', {})).toBe(false);
  });
});
