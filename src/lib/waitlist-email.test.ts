import { describe, expect, it, vi } from 'vitest';
import {
  buildWaitlistEmail,
  isWaitlistEmailEnabled,
  sendWaitlistEmail,
} from '@/lib/waitlist-email';

describe('isWaitlistEmailEnabled', () => {
  it('is disabled without RESEND_API_KEY', () => {
    expect(isWaitlistEmailEnabled({})).toBe(false);
  });
  it('is enabled with a key', () => {
    expect(isWaitlistEmailEnabled({ RESEND_API_KEY: 're_x' })).toBe(true);
  });
});

describe('buildWaitlistEmail', () => {
  const built = buildWaitlistEmail({ firstName: 'Anna', name: 'Anna Müller' });

  it('has the bilingual waiting-list subject', () => {
    expect(built.subject).toBe('Warteliste / Waiting list — OETZ TROPHY 2026');
  });
  it('greets by first name in both languages', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('Hallo Anna');
      expect(body).toContain('Hi Anna');
    }
  });
  it('states clearly that no payment was taken, in both languages', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('keine Zahlung');
      expect(body).toContain('No payment');
    }
  });
  it('escapes HTML in names (html body only)', () => {
    const b = buildWaitlistEmail({ firstName: '<b>X</b>', name: '<b>X</b>' });
    expect(b.html).not.toContain('<b>X</b>');
    expect(b.html).toContain('&lt;b&gt;X&lt;/b&gt;');
  });
});

describe('sendWaitlistEmail', () => {
  const env = { RESEND_API_KEY: 're_test_key' };
  const input = { firstName: 'Anna', name: 'Anna Müller' };

  it('POSTs the right shape to Resend and passes on 200', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await expect(sendWaitlistEmail('anna@example.com', input, env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['anna@example.com']);
    expect(body.subject).toContain('Waiting list');
  });

  it('fails closed on non-OK and network errors, and without key/recipient', async () => {
    const bad = vi.fn().mockResolvedValue(new Response('x', { status: 500 }));
    await expect(sendWaitlistEmail('a@b.co', input, env, bad)).resolves.toBe(false);
    const boom = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(sendWaitlistEmail('a@b.co', input, env, boom)).resolves.toBe(false);
    const noop = vi.fn();
    await expect(sendWaitlistEmail('', input, env, noop)).resolves.toBe(false);
    await expect(sendWaitlistEmail('a@b.co', input, {}, noop)).resolves.toBe(false);
    expect(noop).not.toHaveBeenCalled();
  });
});
