import { describe, expect, it } from 'vitest';
import { entryFactValue, eventPageLabel, localizedFormat, pickRaceContent, type SanityEvent } from './events';

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

describe('localizedFormat', () => {
  it('returns a legacy plain-string value for either language (backward compat)', () => {
    expect(localizedFormat('Zeitlauf', 'de')).toBe('Zeitlauf');
    expect(localizedFormat('Zeitlauf', 'en')).toBe('Zeitlauf');
  });

  it('returns the per-language value from a bilingual object', () => {
    expect(localizedFormat({ de: 'Zeitlauf', en: 'Time trial' }, 'de')).toBe('Zeitlauf');
    expect(localizedFormat({ de: 'Zeitlauf', en: 'Time trial' }, 'en')).toBe('Time trial');
  });

  it('falls back to the other language when one side is blank', () => {
    expect(localizedFormat({ de: 'Zeitlauf', en: '' }, 'en')).toBe('Zeitlauf');
  });

  it('returns empty string for missing or blank values', () => {
    expect(localizedFormat(undefined, 'de')).toBe('');
    expect(localizedFormat(null, 'de')).toBe('');
    expect(localizedFormat({ de: '', en: '' }, 'de')).toBe('');
  });
});

describe('entryFactValue', () => {
  it('uses the editable free-text label for the locale when it is set', () => {
    const label = { de: 'Anmeldung', en: 'Registration' };
    expect(entryFactValue(label, 'open', 'de')).toBe('Anmeldung');
    expect(entryFactValue(label, 'open', 'en')).toBe('Registration');
  });

  it('falls back to the dropdown label when the free text is blank or absent', () => {
    expect(entryFactValue(undefined, 'open', 'de')).toBe('Rennwochenende-Anmeldung');
    expect(entryFactValue({ de: '', en: '' }, 'qualification', 'en')).toBe('Qualification');
  });

  it('fills the other language when only one free-text side is set', () => {
    expect(entryFactValue({ de: 'Anmeldung' }, 'open', 'en')).toBe('Anmeldung');
  });

  it('returns empty string when both the free text and the dropdown are absent', () => {
    expect(entryFactValue(undefined, undefined, 'de')).toBe('');
    expect(entryFactValue({ de: '   ' }, '', 'en')).toBe('');
  });
});

describe('eventPageLabel', () => {
  it('returns the label for the locale', () => {
    const event = make({ pageLabel: { de: 'Das Rennen', en: 'The Race' } });
    expect(eventPageLabel(event, 'de')).toBe('Das Rennen');
    expect(eventPageLabel(event, 'en')).toBe('The Race');
  });

  it('falls back to the other language when only one is filled in', () => {
    const event = make({ pageLabel: { de: 'Das Rennen' } });
    expect(eventPageLabel(event, 'en')).toBe('Das Rennen');
  });

  it('shows no label when the field is blank', () => {
    expect(eventPageLabel(make({}), 'de')).toBe('');
    expect(eventPageLabel(make({ pageLabel: { de: '   ' } }), 'en')).toBe('');
  });
});
