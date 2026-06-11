import { describe, expect, it } from 'vitest';
import { mapProgramDays } from './programSchedule';

const day = (overrides: Record<string, unknown> = {}) => ({
  date: '2026-09-18',
  entries: [
    {
      time: '08:00 – 12:00',
      title: { de: 'Qualifikation', en: 'Qualification' },
      description: { de: 'Zeitfahren auf der Wellerbrücke.', en: 'Time trial on the Wellerbrücke.' },
    },
  ],
  ...overrides,
});

describe('mapProgramDays', () => {
  it('returns null for missing, empty or entirely invalid input', () => {
    expect(mapProgramDays(undefined, 'de')).toBeNull();
    expect(mapProgramDays('not an array', 'de')).toBeNull();
    expect(mapProgramDays([], 'de')).toBeNull();
    expect(mapProgramDays([{ date: '2026-09-18', entries: [] }], 'de')).toBeNull();
    expect(mapProgramDays([day({ entries: [{ time: '', title: {} }] })], 'de')).toBeNull();
  });

  it('derives the weekday heading and date line from the date per locale', () => {
    const de = mapProgramDays([day()], 'de');
    expect(de?.[0].heading).toBe('Freitag');
    expect(de?.[0].dateLabel).toBe('18. September 2026');

    const en = mapProgramDays([day()], 'en');
    expect(en?.[0].heading).toBe('Friday');
    expect(en?.[0].dateLabel).toBe('18 September 2026');
  });

  it('lets the optional label override the weekday but keeps the date line', () => {
    const result = mapProgramDays([day({ label: { de: 'Renntag 1', en: 'Race day 1' } })], 'en');
    expect(result?.[0].heading).toBe('Race day 1');
    expect(result?.[0].dateLabel).toBe('18 September 2026');
  });

  it('localises entries and falls back to the other language when blank', () => {
    const result = mapProgramDays(
      [day({ entries: [{ time: 'ab 19:00', title: { de: 'Opening', en: '  ' } }] })],
      'en',
    );
    expect(result?.[0].entries).toEqual([
      { time: 'ab 19:00', title: 'Opening', description: null },
    ]);
  });

  it('skips entries without a time or title and days left without entries', () => {
    const result = mapProgramDays(
      [
        day({
          entries: [
            { time: '09:00', title: { de: 'Heats' } },
            { time: '', title: { de: 'Kaputt' } },
            { time: '15:00', title: { de: '' } },
          ],
        }),
        { date: '2026-09-19', entries: [{ time: '10:00' }] },
      ],
      'de',
    );
    expect(result).toHaveLength(1);
    expect(result?.[0].entries).toEqual([{ time: '09:00', title: 'Heats', description: null }]);
  });

  it('keeps a day with a label even when the date is missing or malformed', () => {
    const result = mapProgramDays([day({ date: 'soon', label: { de: 'Renntag' } })], 'de');
    expect(result?.[0]).toMatchObject({ heading: 'Renntag', dateLabel: null });
  });
});
