import { describe, expect, it } from 'vitest';
import { pickRaceContent, type SanityEvent } from './events';

const make = (over: Partial<SanityEvent>): SanityEvent => ({
  _id: 'x',
  title: { de: '', en: '' },
  date: '2026-09-19',
  entryType: 'open',
  format: 'Head-to-Head',
  excerpt: { de: '', en: '' },
  body: { de: [], en: [] },
  rules: [],
  ...over,
});

describe('pickRaceContent', () => {
  const legacy = make({ _id: 'event-boater-x', title: { de: 'Kayak Cross', en: 'Kayak Cross' } });

  it('serves the legacy event doc while the page doc has no content yet', () => {
    const emptyPage = make({ _id: 'pageKayakCross' });
    expect(pickRaceContent(emptyPage, legacy)).toBe(legacy);
    expect(pickRaceContent(null, legacy)).toBe(legacy);
  });

  it('prefers the page doc once it carries a title', () => {
    const page = make({ _id: 'pageKayakCross', title: { de: 'Kayak Cross', en: '' } });
    expect(pickRaceContent(page, legacy)).toBe(page);
  });

  it('an English-only title also counts as content', () => {
    const page = make({ _id: 'pageKayakCross', title: { de: '  ', en: 'Kayak Cross' } });
    expect(pickRaceContent(page, legacy)).toBe(page);
  });

  it('returns null when neither document has content', () => {
    expect(pickRaceContent(make({}), null)).toBeNull();
    expect(pickRaceContent(null, null)).toBeNull();
  });
});
