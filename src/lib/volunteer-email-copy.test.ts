import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/siteContent', () => ({ getMessageOverrides: vi.fn() }));

import { getVolunteerEmailCopy } from '@/lib/volunteer-email-copy';
import { getMessageOverrides } from '@/lib/siteContent';

describe('getVolunteerEmailCopy', () => {
  it('falls back to the built-in JSON defaults when Sanity has no overrides', async () => {
    vi.mocked(getMessageOverrides).mockResolvedValue({});
    const copy = await getVolunteerEmailCopy();
    expect(copy.subject.de).toContain('Helfer-Anmeldung');
    expect(copy.subject.en).toContain('Volunteer signup');
    // Defaults carry the {name} placeholder the builder fills in.
    expect(copy.body.de).toContain('{name}');
    expect(copy.body.en).toContain('{name}');
  });

  it('applies non-empty Sanity overrides per language, keeping defaults elsewhere', async () => {
    vi.mocked(getMessageOverrides).mockImplementation(async (locale: string) =>
      locale === 'de'
        ? { volunteerEmail: { subject: 'DE Betreff', body: 'Hallo {name} (DE override)' } }
        : { volunteerEmail: { body: 'Hi {name} (EN override)' } },
    );
    const copy = await getVolunteerEmailCopy();
    expect(copy.subject.de).toBe('DE Betreff');
    expect(copy.body.de).toBe('Hallo {name} (DE override)');
    expect(copy.body.en).toBe('Hi {name} (EN override)');
    // EN subject was not overridden → built-in default.
    expect(copy.subject.en).toContain('Volunteer signup');
  });
});
