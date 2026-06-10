import { describe, it, expect } from 'vitest';
import { mergeSeo, seoFieldName, SEO_DEFAULTS } from './seoDefaults';

describe('mergeSeo', () => {
  it('falls back to built-in copy when there is no override', () => {
    expect(mergeSeo(null, 'kontakt', 'de')).toEqual(SEO_DEFAULTS.kontakt.de);
    expect(mergeSeo(undefined, 'kontakt', 'en')).toEqual(SEO_DEFAULTS.kontakt.en);
  });

  it('uses non-empty override fields and falls back per field', () => {
    const override = { title: { de: 'Eigener Titel' }, description: { de: '   ' } };
    expect(mergeSeo(override, 'gallery', 'de')).toEqual({
      title: 'Eigener Titel',
      description: SEO_DEFAULTS.gallery.de.description,
    });
  });

  it('treats unknown locales as German', () => {
    expect(mergeSeo(null, 'news', 'fr')).toEqual(SEO_DEFAULTS.news.de);
  });

  it('trims override values', () => {
    const override = { title: { en: '  Custom  ' } };
    expect(mergeSeo(override, 'results', 'en').title).toBe('Custom');
  });
});

describe('seoFieldName', () => {
  it('maps page keys to Studio field names', () => {
    expect(seoFieldName('kontakt')).toBe('seoKontakt');
    expect(seoFieldName('oetzTrophy')).toBe('seoOetzTrophy');
  });
});
