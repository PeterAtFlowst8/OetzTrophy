import { beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit, getClientIp, resetRateLimits } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to the limit, then blocks', () => {
    const opts = { key: 'reg:1.2.3.4', limit: 3, windowMs: 10_000, now: 1_000 };
    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(true);
    expect(checkRateLimit(opts).allowed).toBe(true);
    const blocked = checkRateLimit(opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets after the window', () => {
    const base = { key: 'reg:1.2.3.4', limit: 1, windowMs: 10_000 };
    expect(checkRateLimit({ ...base, now: 1_000 }).allowed).toBe(true);
    expect(checkRateLimit({ ...base, now: 2_000 }).allowed).toBe(false);
    expect(checkRateLimit({ ...base, now: 11_001 }).allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    const base = { limit: 1, windowMs: 10_000, now: 1_000 };
    expect(checkRateLimit({ ...base, key: 'a' }).allowed).toBe(true);
    expect(checkRateLimit({ ...base, key: 'b' }).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('takes the first x-forwarded-for hop', () => {
    const h = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' });
    expect(getClientIp(h)).toBe('203.0.113.7');
  });

  it('falls back to unknown', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
