import { sanityClient } from './sanity';

export type SanityEvent = {
  _id: string;
  title: { de: string; en: string };
  pageLabel?: { de?: string; en?: string };
  date: string;
  entryType: string;
  format: string;
  excerpt: { de: string; en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { de: any[]; en: any[] };
  rules: Array<{ de: string; en: string }>;
};

const RACE_FIELDS = '_id, title, pageLabel, date, entryType, format, excerpt, body, rules';

/**
 * The main text and race facts of the three race/festival pages live on the
 * page document (Studio: Website Pages), looked up by its fixed _id. The
 * legacy `event` document is kept in the dataset as a fallback until the
 * one-time copy (scripts/migrate-race-content.ts) has run — matched by its
 * stable id first, slug second (slugs were editable in Studio and editing
 * one must never 404 a page; the routes are fixed in code).
 */
const raceContentQuery = `{
  "page": *[_id == $pageId][0] { ${RACE_FIELDS} },
  "legacy": *[_type == "event" && (_id == $eventId || slug.de.current == $slug || slug.en.current == $slug)][0] { ${RACE_FIELDS} }
}`;

/**
 * The page document wins once it actually carries content (a non-empty
 * title); before the copy has run it exists but holds only photo/SEO
 * fields, so the legacy event document keeps serving.
 */
export function pickRaceContent(
  page: SanityEvent | null,
  legacy: SanityEvent | null,
): SanityEvent | null {
  const hasTitle = (doc: SanityEvent | null) =>
    Boolean(doc?.title?.de?.trim() || doc?.title?.en?.trim());
  return hasTitle(page) ? page : legacy;
}

export async function getRaceContent(
  pageId: string,
  eventId: string,
  slug: string,
): Promise<SanityEvent | null> {
  const result = await sanityClient.fetch(raceContentQuery, { pageId, eventId, slug });
  return pickRaceContent(result?.page ?? null, result?.legacy ?? null);
}

export function localizedField<T>(field: { de: T; en: T }, locale: string): T {
  return locale === 'en' ? (field.en || field.de) : field.de;
}

/**
 * The small line above the page title, editable on the page document
 * ("Page Label"). Blank means no label is shown; when only one language is
 * filled in, the other falls back to it.
 */
export function eventPageLabel(event: SanityEvent, locale: string): string {
  const label = event.pageLabel;
  const value =
    locale === 'en' ? label?.en || label?.de : label?.de || label?.en;
  return value?.trim() || '';
}

export function formatEventDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'de' ? 'de-AT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'de' ? 'de-AT' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function entryTypeLabel(entryType: string, locale: string): string {
  const labels: Record<string, { de: string; en: string }> = {
    'qualification': { de: 'Qualifikation', en: 'Qualification' },
    'invite-only': { de: 'Qualifikation', en: 'Qualification' },
    'open': { de: 'Rennwochenende-Anmeldung', en: 'Race weekend registration' },
    'free': { de: 'Freier Eintritt', en: 'Free Entry' },
  };
  return locale === 'en' ? labels[entryType]?.en || entryType : labels[entryType]?.de || entryType;
}
