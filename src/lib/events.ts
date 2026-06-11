import { sanityClient } from './sanity';

export type SanityEvent = {
  _id: string;
  title: { de: string; en: string };
  pageLabel?: { de?: string; en?: string };
  slug: { de: { current: string }; en: { current: string } };
  date: string;
  entryType: string;
  format: string;
  excerpt: { de: string; en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { de: any[]; en: any[] };
  rules: Array<{ de: string; en: string }>;
};

// Look up by the stable document id FIRST, with the original slug as a
// fallback. The slug field is editable in Studio, and editing it must not
// 404 the page (it did once: the Boater X doc's slug was changed to
// "kayak-cross" and the page disappeared). The routes are fixed in code, so
// the lookup key must be something the client can't change.
const eventForPageQuery = `*[_type == "event" && (_id == $id || slug.de.current == $slug || slug.en.current == $slug)][0] {
  _id, title, pageLabel, slug, date, entryType, format, excerpt, body, rules
}`;

const allEventsQuery = `*[_type == "event"] | order(date asc) {
  _id, title, slug, date, entryType, format, excerpt
}`;

export async function getEventForPage(
  id: string,
  slug: string,
): Promise<SanityEvent | null> {
  return sanityClient.fetch(eventForPageQuery, { id, slug });
}

export async function getAllEvents(): Promise<SanityEvent[]> {
  return sanityClient.fetch(allEventsQuery);
}

export function localizedField<T>(field: { de: T; en: T }, locale: string): T {
  return locale === 'en' ? (field.en || field.de) : field.de;
}

/**
 * The small line above the page title, editable on the event document
 * ("Page Label"). Falls back to the built-in default when blank, and to the
 * other language when only one is filled in.
 */
export function eventPageLabel(
  event: SanityEvent,
  locale: string,
  fallback: string,
): string {
  const label = event.pageLabel;
  const value =
    locale === 'en' ? label?.en || label?.de : label?.de || label?.en;
  return value?.trim() || fallback;
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
