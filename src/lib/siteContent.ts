import { cache } from 'react';
import { sanityClient, urlFor } from './sanity';

/**
 * Reads the `siteContent` singleton (managed in Studio) and exposes:
 *  - getMessageOverrides(): non-empty UI text to merge over the JSON messages
 *  - getSiteImage(): a Sanity image URL for a given slot, or a static fallback
 *
 * Every read is wrapped so a Sanity outage falls back to the built-in content
 * rather than breaking the page. Result is cached per request via React cache().
 */

const QUERY = `*[_id == "siteContent"][0]`;

type Leaf = { de?: string; en?: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SiteContentDoc = Record<string, any> | null;

const getSiteContentDoc = cache(async (): Promise<SiteContentDoc> => {
  try {
    return await sanityClient.fetch(QUERY);
  } catch {
    return null;
  }
});

export async function getMessageOverrides(
  locale: string,
): Promise<Record<string, Record<string, string>>> {
  const doc = await getSiteContentDoc();
  if (!doc) return {};

  const overrides: Record<string, Record<string, string>> = {};
  for (const namespace of Object.keys(doc)) {
    if (namespace.startsWith('_') || namespace === 'images') continue;
    const section = doc[namespace];
    if (!section || typeof section !== 'object') continue;

    for (const key of Object.keys(section)) {
      const leaf = section[key] as Leaf | undefined;
      const value = leaf?.[locale as 'de' | 'en'];
      if (typeof value === 'string' && value.trim() !== '') {
        (overrides[namespace] ||= {})[key] = value;
      }
    }
  }
  return overrides;
}

export type SiteImageKey =
  | 'hero'
  | 'festivalOverview'
  | 'oetzTrophy'
  | 'boaterX'
  | 'kajakfestival'
  | 'kontakt';

/**
 * Returns the client-managed image for a slot, or the provided static fallback
 * when none has been uploaded (or Sanity is unavailable).
 */
export async function getSiteImage(
  key: SiteImageKey,
  fallback: string,
  opts: { width?: number; height?: number } = {},
): Promise<string> {
  const doc = await getSiteContentDoc();
  const image = doc?.images?.[key];
  if (!image?.asset?._ref) return fallback;

  let builder = urlFor(image).auto('format');
  if (opts.width) builder = builder.width(opts.width);
  if (opts.height) builder = builder.height(opts.height);
  return builder.url();
}
