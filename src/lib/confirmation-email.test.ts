import { describe, expect, it, vi } from 'vitest';
import {
  buildConfirmationEmail,
  isConfirmationEmailEnabled,
  sendConfirmationEmail,
} from '@/lib/confirmation-email';

describe('isConfirmationEmailEnabled', () => {
  it('is disabled without RESEND_API_KEY', () => {
    expect(isConfirmationEmailEnabled({})).toBe(false);
    expect(isConfirmationEmailEnabled({ RESEND_API_KEY: '' })).toBe(false);
  });
  it('is enabled with a key', () => {
    expect(isConfirmationEmailEnabled({ RESEND_API_KEY: 're_x' })).toBe(true);
  });
});

describe('buildConfirmationEmail', () => {
  const built = buildConfirmationEmail({ firstName: 'Anna', name: 'Anna Müller' });

  it('has the bilingual subject', () => {
    expect(built.subject).toBe('Anmeldung bestätigt / Registration confirmed — OETZ TROPHY 2026');
  });

  it('greets by first name in both languages (html + text)', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('Hallo Anna');
      expect(body).toContain('Hi Anna');
    }
  });

  it('contains the event facts and links in both languages', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('17.–20. September 2026');
      expect(body).toContain('17–20 September 2026');
      expect(body).toContain('https://oetz-trophy.com/de/programm');
      expect(body).toContain('https://oetz-trophy.com/en/programm');
      expect(body).toContain('info@oetz-trophy.com');
      expect(body).toContain('Stripe');
    }
  });

  it('falls back to the full name when firstName is empty', () => {
    const b = buildConfirmationEmail({ firstName: '', name: 'Max Mustermann' });
    expect(b.text).toContain('Hallo Max Mustermann');
  });

  it('escapes HTML in names (html body only)', () => {
    const b = buildConfirmationEmail({ firstName: '<b>X</b>', name: '<b>X</b>' });
    expect(b.html).not.toContain('<b>X</b>');
    expect(b.html).toContain('&lt;b&gt;X&lt;/b&gt;');
  });
});

describe('sendConfirmationEmail', () => {
  const env = { RESEND_API_KEY: 're_test_key' };
  const input = { firstName: 'Anna', name: 'Anna Müller' };

  it('POSTs the right shape to Resend and passes on 200', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }),
    );
    await expect(sendConfirmationEmail('anna@example.com', input, env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body);
    expect(body.from).toBe('OETZ TROPHY <noreply@oetz-trophy.com>');
    expect(body.to).toEqual(['anna@example.com']);
    expect(body.reply_to).toBe('info@oetz-trophy.com');
    expect(body.subject).toContain('OETZ TROPHY');
    expect(body.html).toContain('Hallo Anna');
    expect(body.text).toContain('Hi Anna');
  });

  it('fails on non-OK responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{"message":"nope"}', { status: 422 }));
    await expect(sendConfirmationEmail('a@b.co', input, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails closed on network errors', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(sendConfirmationEmail('a@b.co', input, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails without recipient or key, without calling fetch', async () => {
    const fetchImpl = vi.fn();
    await expect(sendConfirmationEmail('', input, env, fetchImpl)).resolves.toBe(false);
    await expect(sendConfirmationEmail('a@b.co', input, {}, fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
