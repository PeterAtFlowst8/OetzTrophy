import { describe, expect, it, vi } from 'vitest';
import {
  buildPaymentReminderEmail,
  isPaymentReminderEmailEnabled,
  sendPaymentReminderEmail,
} from '@/lib/payment-reminder-email';

const PAY_URL = 'https://oetz-trophy.com/api/registration/resume?token=TOK_PAY';
const CANCEL_URL = 'https://oetz-trophy.com/api/registration/cancel?token=TOK_CANCEL';

describe('isPaymentReminderEmailEnabled', () => {
  it('is disabled without RESEND_API_KEY', () => {
    expect(isPaymentReminderEmailEnabled({})).toBe(false);
    expect(isPaymentReminderEmailEnabled({ RESEND_API_KEY: '' })).toBe(false);
  });
  it('is enabled with a key', () => {
    expect(isPaymentReminderEmailEnabled({ RESEND_API_KEY: 're_x' })).toBe(true);
  });
});

describe('buildPaymentReminderEmail', () => {
  const built = buildPaymentReminderEmail({
    firstName: 'Anna',
    name: 'Anna Müller',
    payUrl: PAY_URL,
    cancelUrl: CANCEL_URL,
  });

  it('has the bilingual subject', () => {
    expect(built.subject).toBe('Zahlung abschließen / Complete your payment — OETZ TROPHY 2026');
  });

  it('greets by first name in both languages (html + text)', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('Hallo Anna');
      expect(body).toContain('Hi Anna');
    }
  });

  it('contains both the pay and deregister links in both bodies', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain(PAY_URL);
      expect(body).toContain(CANCEL_URL);
    }
  });

  it('falls back to the full name when firstName is empty', () => {
    const b = buildPaymentReminderEmail({
      firstName: '',
      name: 'Max Mustermann',
      payUrl: PAY_URL,
      cancelUrl: CANCEL_URL,
    });
    expect(b.text).toContain('Hallo Max Mustermann');
  });

  it('escapes HTML in names (html body only)', () => {
    const b = buildPaymentReminderEmail({
      firstName: '<b>X</b>',
      name: '<b>X</b>',
      payUrl: PAY_URL,
      cancelUrl: CANCEL_URL,
    });
    expect(b.html).not.toContain('<b>X</b>');
    expect(b.html).toContain('&lt;b&gt;X&lt;/b&gt;');
  });
});

describe('sendPaymentReminderEmail', () => {
  const env = { RESEND_API_KEY: 're_test_key' };
  const input = { firstName: 'Anna', name: 'Anna Müller', payUrl: PAY_URL, cancelUrl: CANCEL_URL };

  it('POSTs the right shape to Resend and passes on 200', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'email_123' }), { status: 200 }),
    );
    await expect(sendPaymentReminderEmail('anna@example.com', input, env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body);
    expect(body.from).toBe('OETZ TROPHY <noreply@oetz-trophy.com>');
    expect(body.to).toEqual(['anna@example.com']);
    expect(body.reply_to).toBe('info@oetz-trophy.com');
    expect(body.subject).toContain('OETZ TROPHY');
    expect(body.html).toContain(PAY_URL);
    expect(body.text).toContain(CANCEL_URL);
  });

  it('fails on non-OK responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{"message":"nope"}', { status: 422 }));
    await expect(sendPaymentReminderEmail('a@b.co', input, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails closed on network errors', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(sendPaymentReminderEmail('a@b.co', input, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails without recipient or key, without calling fetch', async () => {
    const fetchImpl = vi.fn();
    await expect(sendPaymentReminderEmail('', input, env, fetchImpl)).resolves.toBe(false);
    await expect(sendPaymentReminderEmail('a@b.co', input, {}, fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
