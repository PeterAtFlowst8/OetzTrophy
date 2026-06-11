import { describe, expect, it } from 'vitest';
import { pageTextBody, pageTextString } from './pageText';

describe('pageTextString', () => {
  it('returns the value for the locale', () => {
    const field = { de: 'Qualifikation', en: 'Qualification' };
    expect(pageTextString(field, 'de')).toBe('Qualifikation');
    expect(pageTextString(field, 'en')).toBe('Qualification');
  });

  it('falls back to the other language when only one is filled in', () => {
    expect(pageTextString({ de: 'Qualifikation' }, 'en')).toBe('Qualifikation');
    expect(pageTextString({ en: 'Qualification' }, 'de')).toBe('Qualification');
  });

  it('returns empty for blank or missing fields', () => {
    expect(pageTextString(undefined, 'de')).toBe('');
    expect(pageTextString({ de: '   ' }, 'de')).toBe('');
  });
});

describe('pageTextBody', () => {
  const block = [{ _type: 'block', children: [] }];

  it('prefers the body for the locale', () => {
    expect(pageTextBody({ de: block, en: [] }, 'de')).toBe(block);
  });

  it('falls back to the other language when the locale body is empty', () => {
    expect(pageTextBody({ de: block, en: [] }, 'en')).toBe(block);
    expect(pageTextBody({ de: [], en: block }, 'de')).toBe(block);
  });

  it('returns an empty array when nothing is set', () => {
    expect(pageTextBody(undefined, 'de')).toEqual([]);
    expect(pageTextBody({}, 'en')).toEqual([]);
  });
});
