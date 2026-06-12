import { describe, expect, it, vi } from 'vitest';
import { getTurnstileConfig, verifyTurnstileToken } from '@/lib/turnstile';

describe('getTurnstileConfig', () => {
  it('disabled when both keys are absent', () => {
    expect(getTurnstileConfig({})).toBe('disabled');
  });
  it('enforced when both keys are present', () => {
    expect(
      getTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k', TURNSTILE_SECRET_KEY: 's' }),
    ).toBe('enforced');
  });
  it('misconfigured when exactly one key is present (fail closed)', () => {
    expect(getTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k' })).toBe('misconfigured');
    expect(getTurnstileConfig({ TURNSTILE_SECRET_KEY: 's' })).toBe('misconfigured');
  });
});

describe('verifyTurnstileToken', () => {
  const env = { TURNSTILE_SECRET_KEY: 'secret' };

  it('passes on success=true', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    await expect(verifyTurnstileToken('tok', '1.2.3.4', env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toContain('challenges.cloudflare.com');
    expect(String(init.body)).toContain('response=tok');
  });

  it('fails on success=false', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] })),
    );
    await expect(verifyTurnstileToken('tok', undefined, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails closed on network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(verifyTurnstileToken('tok', undefined, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails closed on non-OK HTTP status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('oops', { status: 503 }));
    await expect(verifyTurnstileToken('tok', undefined, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails on empty token without calling Cloudflare', async () => {
    const fetchImpl = vi.fn();
    await expect(verifyTurnstileToken('', undefined, env, fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('does not send remoteip when ip is "unknown"', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    await verifyTurnstileToken('tok', 'unknown', env, fetchImpl);
    const [, init] = fetchImpl.mock.calls[0];
    expect(String(init.body)).not.toContain('remoteip');
  });
});
