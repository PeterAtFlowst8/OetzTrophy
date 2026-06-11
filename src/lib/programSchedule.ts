export type ProgramEntry = {
  time: string;
  title: string;
  description: string | null;
};

export type ProgramDay = {
  heading: string;
  dateLabel: string | null;
  entries: ProgramEntry[];
};

type Leaf = { de?: unknown; en?: unknown };

function pickLocalized(leaf: Leaf | undefined, lang: 'de' | 'en'): string | null {
  const other = lang === 'de' ? 'en' : 'de';
  for (const key of [lang, other] as const) {
    const value = leaf?.[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return null;
}

// Sanity `date` fields store plain YYYY-MM-DD strings; parse at local noon so
// the formatted day can never slip into a neighbouring day on a server whose
// timezone differs from the festival's.
function parseProgramDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const date = new Date(`${value.trim()}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Maps the raw `programDays` array from the siteContent document into
 * render-ready day blocks for the requested locale. Defensive like
 * getMenuItems: entries missing a time or title and days without any valid
 * entries are skipped; returns null when nothing remains so the page hides
 * the section entirely.
 *
 * The day heading is the optional Studio label, or the weekday derived from
 * the date ("Freitag" / "Friday"); the date line is always derived from the
 * date so it never needs translating.
 */
export function mapProgramDays(raw: unknown, locale: string): ProgramDay[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const lang = locale === 'en' ? 'en' : 'de';
  const intlLocale = lang === 'en' ? 'en-GB' : 'de-AT';

  const days: ProgramDay[] = [];
  for (const day of raw) {
    const rawEntries = Array.isArray(day?.entries) ? day.entries : [];
    const entries: ProgramEntry[] = [];
    for (const entry of rawEntries) {
      const time =
        typeof entry?.time === 'string' && entry.time.trim() !== '' ? entry.time.trim() : null;
      const title = pickLocalized(entry?.title, lang);
      if (!time || !title) continue;
      entries.push({ time, title, description: pickLocalized(entry?.description, lang) });
    }
    if (entries.length === 0) continue;

    const date = parseProgramDate(day?.date);
    const label = pickLocalized(day?.label, lang);
    const heading = label ?? (date ? date.toLocaleDateString(intlLocale, { weekday: 'long' }) : null);
    if (!heading) continue;

    days.push({
      heading,
      dateLabel: date
        ? date.toLocaleDateString(intlLocale, { day: 'numeric', month: 'long', year: 'numeric' })
        : null,
      entries,
    });
  }
  return days.length > 0 ? days : null;
}
