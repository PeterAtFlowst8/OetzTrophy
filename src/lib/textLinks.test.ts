import { describe, it, expect } from 'vitest';
import { parseTextLinks, isExternalHref } from './textLinks';

describe('parseTextLinks', () => {
  it('passes plain text through as one segment', () => {
    expect(parseTextLinks('Just text.')).toEqual([{ type: 'text', text: 'Just text.' }]);
  });

  it('parses an inline link with surrounding text', () => {
    expect(parseTextLinks('See [the rules](https://example.com/rules) here.')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'link', text: 'the rules', href: 'https://example.com/rules' },
      { type: 'text', text: ' here.' },
    ]);
  });

  it('parses multiple links, internal paths, mailto and tel', () => {
    const segments = parseTextLinks(
      '[Anmeldung](/registration) oder [Mail](mailto:info@oetz-trophy.com) oder [Anruf](tel:+4351254671)',
    );
    expect(segments.filter((s) => s.type === 'link').map((s) => s.type === 'link' && s.href)).toEqual([
      '/registration',
      'mailto:info@oetz-trophy.com',
      'tel:+4351254671',
    ]);
  });

  it('leaves unsafe or malformed destinations as literal text', () => {
    // eslint-disable-next-line no-script-url
    for (const raw of ['[x](javascript:alert(1))', '[x](ftp://a)', '[x]()', '[x] (https://a.com)']) {
      expect(parseTextLinks(raw)).toEqual([{ type: 'text', text: raw }]);
    }
  });

  it('does not span across newlines in the label', () => {
    const raw = '[a\nb](https://example.com)';
    expect(parseTextLinks(raw)).toEqual([{ type: 'text', text: raw }]);
  });
});

describe('isExternalHref', () => {
  it('flags only http(s) as external', () => {
    expect(isExternalHref('https://example.com')).toBe(true);
    expect(isExternalHref('http://example.com')).toBe(true);
    expect(isExternalHref('/registration')).toBe(false);
    expect(isExternalHref('mailto:a@b.c')).toBe(false);
    expect(isExternalHref('tel:+43123')).toBe(false);
  });
});
