import { describe, expect, it } from 'vitest';
import { parseVolunteerInput } from './volunteerInput';

const valid = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'Ada@Example.com',
  tshirtSize: 'm',
  roles: ['media', 'safety'],
  availability: ['sat', 'sun'],
  otherHelp: 'I can drive a van',
  experience: 'Rescue training',
  acceptedAge: true,
  acceptedConsent: true,
  turnstileToken: 'tok',
};

describe('parseVolunteerInput', () => {
  it('accepts a valid signup and normalizes name/email/size', () => {
    const res = parseVolunteerInput(valid);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      tshirtSize: 'M',
      roles: ['media', 'safety'],
      availability: ['sat', 'sun'],
      acceptedAge: true,
      acceptedConsent: true,
    });
  });

  it('accepts a minimal signup with no roles, days or free text', () => {
    const res = parseVolunteerInput({
      firstName: 'Sam',
      lastName: 'Lee',
      email: 'sam@example.com',
      tshirtSize: 'L',
      acceptedAge: true,
      acceptedConsent: true,
      turnstileToken: '',
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.roles).toEqual([]);
    expect(res.value.availability).toEqual([]);
    expect(res.value.otherHelp).toBe('');
  });

  it('rejects a non-object body', () => {
    expect(parseVolunteerInput(null).ok).toBe(false);
    expect(parseVolunteerInput('x').ok).toBe(false);
  });

  it('requires first name, last name and email', () => {
    expect(parseVolunteerInput({ ...valid, firstName: '' }).ok).toBe(false);
    expect(parseVolunteerInput({ ...valid, lastName: '  ' }).ok).toBe(false);
    expect(parseVolunteerInput({ ...valid, email: '' }).ok).toBe(false);
  });

  it('treats t-shirt size as optional but validates it when provided', () => {
    expect(parseVolunteerInput({ ...valid, tshirtSize: '' }).ok).toBe(true);
    expect(parseVolunteerInput({ ...valid, tshirtSize: 'XXXL' }).ok).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(parseVolunteerInput({ ...valid, email: 'nope' }).ok).toBe(false);
  });

  it('requires the consent confirmation to be exactly true', () => {
    expect(parseVolunteerInput({ ...valid, acceptedConsent: 'yes' }).ok).toBe(false);
    expect(parseVolunteerInput({ ...valid, acceptedConsent: undefined }).ok).toBe(false);
  });

  it('no longer requires the age confirmation', () => {
    const res = parseVolunteerInput({ ...valid, acceptedAge: false });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.acceptedAge).toBe(false);
  });

  it('drops unknown role/day keys and de-duplicates', () => {
    const res = parseVolunteerInput({
      ...valid,
      roles: ['media', 'media', 'hacker', 'first_aid'],
      availability: ['sat', 'mon', 'SAT'],
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.roles).toEqual(['media', 'first_aid']);
    expect(res.value.availability).toEqual(['sat']);
  });

  it('treats non-array roles/availability as empty', () => {
    const res = parseVolunteerInput({ ...valid, roles: 'media', availability: 42 });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.roles).toEqual([]);
    expect(res.value.availability).toEqual([]);
  });

  it('rejects over-long free-text answers and turnstile tokens', () => {
    expect(parseVolunteerInput({ ...valid, experience: 'x'.repeat(2001) }).ok).toBe(false);
    expect(parseVolunteerInput({ ...valid, otherHelp: 'x'.repeat(2001) }).ok).toBe(false);
    expect(parseVolunteerInput({ ...valid, turnstileToken: 'x'.repeat(3000) }).ok).toBe(false);
  });
});
