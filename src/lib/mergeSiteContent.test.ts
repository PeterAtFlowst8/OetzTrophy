import { describe, expect, it } from 'vitest';
import { mergeSiteContent } from './mergeSiteContent';
import { PAGE_DOCUMENTS } from './pageDocuments';

const legacy = {
  _id: 'abc',
  _type: 'siteContent',
  programm: { title: { de: 'Alt', en: 'Old' } },
  kontakt: { title: { de: 'Kontakt alt' } },
  imageProgram: { asset: { _ref: 'image-legacy-jpg' } },
  images: { hero: { asset: { _ref: 'image-old-hero-jpg' } } },
};

describe('mergeSiteContent', () => {
  it('returns null when there is nothing at all', () => {
    expect(mergeSiteContent(null, [])).toBeNull();
    expect(mergeSiteContent(undefined, undefined)).toBeNull();
  });

  it('passes the legacy singleton through before any page docs exist', () => {
    expect(mergeSiteContent(legacy, [])).toEqual(legacy);
  });

  it('lets an existing page doc take over all its keys, even cleared ones', () => {
    const pageProgram = {
      _id: 'pageProgram',
      _type: 'pageProgram',
      programm: { title: { de: 'Neu', en: 'New' } },
      // imageProgram intentionally absent: the editor removed the photo.
    };
    const merged = mergeSiteContent(legacy, [pageProgram]);
    expect(merged?.programm.title.de).toBe('Neu');
    // Owned-but-missing key must NOT fall back to the legacy upload.
    expect(merged?.imageProgram).toBeUndefined();
    // Keys owned by other (absent) page docs still come from the singleton.
    expect(merged?.kontakt.title.de).toBe('Kontakt alt');
    // Legacy images object survives for the images.* fallback in resolveImage.
    expect(merged?.images.hero.asset._ref).toBe('image-old-hero-jpg');
  });

  it('works without a legacy singleton', () => {
    const merged = mergeSiteContent(null, [
      { _id: 'pageContact', _type: 'pageContact', kontakt: { phone: { de: 'Tel' } } },
    ]);
    expect(merged?.kontakt.phone.de).toBe('Tel');
  });

  it('ignores documents of unknown type', () => {
    const merged = mergeSiteContent(legacy, [{ _id: 'x', _type: 'mystery', programm: 'evil' }]);
    expect(merged?.programm.title.de).toBe('Alt');
  });

  it('owns every key exactly once across the partition', () => {
    const seen = new Map<string, string>();
    for (const def of PAGE_DOCUMENTS) {
      for (const key of def.keys) {
        expect(seen.has(key), `${key} owned by ${seen.get(key)} and ${def.type}`).toBe(false);
        seen.set(key, def.type);
      }
    }
    expect(seen.size).toBe(57);
  });
});
