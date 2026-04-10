import { sanityClient } from './sanity';

export type SanityEvent = {
  _id: string;
  title: { de: string; en: string };
  slug: { de: { current: string }; en: { current: string } };
  date: string;
  entryType: string;
  format: string;
  excerpt: { de: string; en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { de: any[]; en: any[] };
  rules: Array<{ de: string; en: string }>;
  image?: { asset: { _ref: string } };
  imageUrl?: string;
};

const eventBySlugQuery = `*[_type == "event" && (slug.de.current == $slug || slug.en.current == $slug)][0] {
  _id, title, slug, date, entryType, format, excerpt, body, rules,
  image, "imageUrl": image.asset->url
}`;

const allEventsQuery = `*[_type == "event"] | order(date asc) {
  _id, title, slug, date, entryType, format, excerpt,
  image, "imageUrl": image.asset->url
}`;

export async function getEventBySlug(slug: string): Promise<SanityEvent | null> {
  return sanityClient.fetch(eventBySlugQuery, { slug });
}

export async function getAllEvents(): Promise<SanityEvent[]> {
  return sanityClient.fetch(allEventsQuery);
}

export function localizedField<T>(field: { de: T; en: T }, locale: string): T {
  return locale === 'en' ? (field.en || field.de) : field.de;
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
    'invite-only': { de: 'Nur auf Einladung', en: 'Invite Only' },
    'open': { de: 'Offene Anmeldung', en: 'Open Entry' },
    'free': { de: 'Freier Eintritt', en: 'Free Entry' },
  };
  return locale === 'en' ? labels[entryType]?.en || entryType : labels[entryType]?.de || entryType;
}
