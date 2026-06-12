import { describe, expect, it } from 'vitest';
import { parseRegistrationInput } from '@/lib/registrationInput';

const valid = {
  firstName: 'Anna',
  lastName: 'Müller',
  email: 'Anna.Mueller@Example.com',
  nationality: 'Austria',
  tshirtSize: 'm',
  acceptedTerms: true,
  acceptedAwpRules: true,
  confirmedOver18: true,
};

describe('parseRegistrationInput', () => {
  it('accepts a valid body and normalizes email/tshirt', () => {
    const r = parseRegistrationInput(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.email).toBe('anna.mueller@example.com');
      expect(r.value.tshirtSize).toBe('M');
      expect(r.value.name).toBe('Anna Müller');
    }
  });

  it.each([
    ['firstName', ''],
    ['lastName', ''],
    ['email', 'not-an-email'],
    ['email', 'a@b'],
    ['nationality', ''],
    ['tshirtSize', 'XXXL'],
  ])('rejects bad %s = %j', (key, val) => {
    expect(parseRegistrationInput({ ...valid, [key]: val }).ok).toBe(false);
  });

  it('rejects overlong fields', () => {
    expect(parseRegistrationInput({ ...valid, firstName: 'x'.repeat(101) }).ok).toBe(false);
    expect(parseRegistrationInput({ ...valid, email: 'x'.repeat(250) + '@a.com' }).ok).toBe(false);
    expect(parseRegistrationInput({ ...valid, nationality: 'x'.repeat(101) }).ok).toBe(false);
  });

  it('rejects missing confirmations', () => {
    expect(parseRegistrationInput({ ...valid, acceptedTerms: false }).ok).toBe(false);
    expect(parseRegistrationInput({ ...valid, confirmedOver18: 'yes' }).ok).toBe(false); // must be boolean true
  });

  it('rejects non-object bodies', () => {
    expect(parseRegistrationInput(null).ok).toBe(false);
    expect(parseRegistrationInput('hi').ok).toBe(false);
  });

  it('trims whitespace from string fields', () => {
    const r = parseRegistrationInput({ ...valid, firstName: '  Anna ', lastName: ' Müller  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.name).toBe('Anna Müller');
  });

  it('defaults turnstileToken to empty string and trims it when present', () => {
    const absent = parseRegistrationInput(valid);
    if (absent.ok) expect(absent.value.turnstileToken).toBe('');
    const present = parseRegistrationInput({ ...valid, turnstileToken: ' tok-123 ' });
    if (present.ok) expect(present.value.turnstileToken).toBe('tok-123');
  });

  it('accepts fields at exactly the maximum length', () => {
    const r = parseRegistrationInput({ ...valid, firstName: 'x'.repeat(100), nationality: 'y'.repeat(100) });
    expect(r.ok).toBe(true);
  });

  it('rejects acceptedAwpRules false', () => {
    expect(parseRegistrationInput({ ...valid, acceptedAwpRules: false }).ok).toBe(false);
  });

  it('rejects an oversized turnstileToken', () => {
    expect(parseRegistrationInput({ ...valid, turnstileToken: 'x'.repeat(2049) }).ok).toBe(false);
  });
});
