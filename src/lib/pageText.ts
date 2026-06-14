import { sanityClient } from './sanity';

/**
 * Direct page-text fields (title, optional eyebrow label, rich body) for
 * pages that carry their main content on the page document itself, looked up
 * by the document's fixed _id — the same pattern as the race pages in
 * events.ts, minus the race facts. These fields never flow through the
 * merged site-content document.
 */
export type PageText = {
  title?: { de?: string; en?: string };
  pageLabel?: { de?: string; en?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: { de?: any[]; en?: any[] };
  // Optional race-fact fields — present on pages that use raceContentFields()
  // (the Qualification page); blank/absent on plainer page-text documents.
  excerpt?: { de?: string; en?: string };
  date?: string;
  format?: string;
  entryType?: string;
  rules?: Array<{ de?: string; en?: string }>;
};

const QUERY = `*[_id == $pageId][0]{ title, pageLabel, body, excerpt, date, format, entryType, rules }`;

export async function getPageText(pageId: string): Promise<PageText | null> {
  try {
    return await sanityClient.fetch(QUERY, { pageId });
  } catch {
    return null;
  }
}

/**
 * Localized value with cross-language fill; '' when blank, so callers can
 * hide the element (page label) or substitute a built-in fallback (title).
 */
export function pageTextString(
  field: { de?: string; en?: string } | undefined,
  locale: string,
): string {
  const value = locale === 'en' ? field?.en || field?.de : field?.de || field?.en;
  return value?.trim() || '';
}

/** Rich-text body for the locale, falling back to the other language. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pageTextBody(body: PageText['body'], locale: string): any[] {
  const preferred = locale === 'en' ? body?.en : body?.de;
  const other = locale === 'en' ? body?.de : body?.en;
  return (preferred?.length ? preferred : other) ?? [];
}
