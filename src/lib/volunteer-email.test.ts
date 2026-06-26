import { describe, expect, it, vi } from 'vitest';
import {
  buildVolunteerThankYouEmail,
  buildVolunteerNotificationEmail,
  isVolunteerEmailEnabled,
  sendVolunteerThankYouEmail,
  sendVolunteerNotificationEmail,
} from '@/lib/volunteer-email';

const copy = {
  subject: { de: 'Helfer-Anmeldung — OETZ TROPHY 2026', en: 'Volunteer signup — OETZ TROPHY 2026' },
  body: {
    de: 'Hallo {name},\n\ndanke für deine Anmeldung!',
    en: 'Hi {name},\n\nthanks for signing up!',
  },
};

describe('isVolunteerEmailEnabled', () => {
  it('is disabled without RESEND_API_KEY', () => {
    expect(isVolunteerEmailEnabled({})).toBe(false);
    expect(isVolunteerEmailEnabled({ RESEND_API_KEY: '' })).toBe(false);
  });
  it('is enabled with a key', () => {
    expect(isVolunteerEmailEnabled({ RESEND_API_KEY: 're_x' })).toBe(true);
  });
});

describe('buildVolunteerThankYouEmail', () => {
  const built = buildVolunteerThankYouEmail({ firstName: 'Anna', name: 'Anna Müller' }, copy);

  it('combines both language subjects', () => {
    expect(built.subject).toContain('OETZ TROPHY');
    expect(built.subject).toContain('Helfer-Anmeldung');
    expect(built.subject).toContain('Volunteer signup');
  });

  it('fills {name} in both languages (html + text) and leaves no placeholder', () => {
    for (const body of [built.html, built.text]) {
      expect(body).toContain('Hallo Anna');
      expect(body).toContain('Hi Anna');
      expect(body).not.toContain('{name}');
    }
  });

  it('falls back to the full name when firstName is empty', () => {
    const b = buildVolunteerThankYouEmail({ firstName: '', name: 'Max Mustermann' }, copy);
    expect(b.text).toContain('Hallo Max Mustermann');
  });

  it('escapes HTML in the interpolated name (html body only)', () => {
    const b = buildVolunteerThankYouEmail({ firstName: '<b>X</b>', name: '<b>X</b>' }, copy);
    expect(b.html).not.toContain('<b>X</b>');
    expect(b.html).toContain('&lt;b&gt;X&lt;/b&gt;');
  });
});

describe('buildVolunteerNotificationEmail', () => {
  const built = buildVolunteerNotificationEmail({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    tshirtSize: 'M',
    roles: ['Media — photo & video', 'Safety / water rescue'],
    availability: ['Saturday', 'Sunday'],
    otherHelp: 'Can drive a van',
    experience: 'Rescue training',
  });

  it('includes the volunteer name and email', () => {
    expect(built.text).toContain('Ada Lovelace');
    expect(built.text).toContain('ada@example.com');
  });

  it('lists the selected roles and availability', () => {
    expect(built.text).toContain('Media — photo & video');
    expect(built.text).toContain('Saturday');
  });

  it('handles empty roles/availability gracefully', () => {
    const b = buildVolunteerNotificationEmail({
      name: 'Sam Lee',
      email: 'sam@example.com',
      tshirtSize: null,
      roles: [],
      availability: [],
      otherHelp: null,
      experience: null,
    });
    expect(b.text).toContain('Sam Lee');
  });
});

describe('sendVolunteerThankYouEmail', () => {
  const env = { RESEND_API_KEY: 're_test_key' };
  const input = { firstName: 'Anna', name: 'Anna Müller' };

  it('POSTs the right shape to Resend and passes on 200', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'e1' }), { status: 200 }));
    await expect(sendVolunteerThankYouEmail('anna@example.com', input, copy, env, fetchImpl)).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body);
    expect(body.from).toBe('OETZ TROPHY <noreply@oetz-trophy.com>');
    expect(body.to).toEqual(['anna@example.com']);
    expect(body.reply_to).toBe('info@oetz-trophy.com');
  });

  it('fails on non-OK responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 422 }));
    await expect(sendVolunteerThankYouEmail('a@b.co', input, copy, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails closed on network errors', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(sendVolunteerThankYouEmail('a@b.co', input, copy, env, fetchImpl)).resolves.toBe(false);
  });

  it('fails without recipient or key, without calling fetch', async () => {
    const fetchImpl = vi.fn();
    await expect(sendVolunteerThankYouEmail('', input, copy, env, fetchImpl)).resolves.toBe(false);
    await expect(sendVolunteerThankYouEmail('a@b.co', input, copy, {}, fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('sendVolunteerNotificationEmail', () => {
  const env = { RESEND_API_KEY: 're_test_key' };
  const input = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    tshirtSize: 'M',
    roles: ['Media'],
    availability: ['Saturday'],
    otherHelp: null,
    experience: null,
  };

  it('POSTs to Resend, sends to the organisers and replies to the volunteer', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await expect(
      sendVolunteerNotificationEmail('info@oetz-trophy.com', input, env, fetchImpl),
    ).resolves.toBe(true);
    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['info@oetz-trophy.com']);
    expect(body.reply_to).toBe('ada@example.com');
  });

  it('fails without recipient or key, without calling fetch', async () => {
    const fetchImpl = vi.fn();
    await expect(sendVolunteerNotificationEmail('', input, env, fetchImpl)).resolves.toBe(false);
    await expect(sendVolunteerNotificationEmail('info@oetz-trophy.com', input, {}, fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
