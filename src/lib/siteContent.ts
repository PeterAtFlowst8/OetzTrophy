import { cache } from 'react';
import { sanityClient, urlFor } from './sanity';
import { projectId, dataset } from '@/sanity/env';
import { EDITABLE_SITE_CONTENT_KEYS } from './siteContentFields';
import { mergeSeo, seoFieldName, type SeoPageKey } from './seoDefaults';
import { mapProgramDays, type ProgramDay } from './programSchedule';

/**
 * Reads the `siteContent` singleton (managed in Studio) and exposes:
 *  - getMessageOverrides(): non-empty UI text to merge over the JSON messages
 *  - getSiteImage(): a Sanity image URL for a given slot, or a static fallback
 *
 * Every read is wrapped so a Sanity outage falls back to the built-in content
 * rather than breaking the page. Result is cached per request via React cache().
 */

const QUERY = `*[_type == "siteContent"][0]`;

type Leaf = { de?: string; en?: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SiteContentDoc = Record<string, any> | null;

const STATIC_MESSAGE_KEYS = new Set([
  'registration.feeNote',
  'registration.paymentNote',
]);

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
  for (const namespace of Object.keys(EDITABLE_SITE_CONTENT_KEYS)) {
    const section = doc[namespace];
    if (!section || typeof section !== 'object') continue;

    for (const key of EDITABLE_SITE_CONTENT_KEYS[namespace]) {
      if (STATIC_MESSAGE_KEYS.has(`${namespace}.${key}`)) continue;

      const leaf = section[key] as Leaf | undefined;
      const value = leaf?.[locale as 'de' | 'en'];
      if (typeof value === 'string' && value.trim() !== '') {
        (overrides[namespace] ||= {})[key] = value;
      }
    }
  }
  return overrides;
}

/**
 * Page meta title/description for generateMetadata: the Studio SEO field for
 * the page (blank = fallback) merged over the built-in copy in seoDefaults.
 */
export async function getPageSeo(
  key: SeoPageKey,
  locale: string,
): Promise<{ title: string; description: string }> {
  const doc = await getSiteContentDoc();
  return mergeSeo(doc?.[seoFieldName(key)], key, locale);
}

export type SiteImageKey =
  | 'logo'
  | 'hero'
  | 'festivalOverview'
  | 'oetzTrophy'
  | 'boaterX'
  | 'kajakfestival'
  | 'program'
  | 'kontakt'
  | 'registration'
  | 'news'
  | 'gallery'
  | 'results'
  | 'terms'
  | 'datenschutz'
  | 'impressum'
  | 'programmeFestival'
  | 'programmeBoaterX'
  | 'programmeOetzTrophy';

/**
 * Image slots live as per-page fields in Studio (e.g. `imageKontakt`), but
 * photos uploaded before the per-page reorganisation are stored under the
 * legacy `images.*` object — read the new field first, then fall back.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveImage(doc: SiteContentDoc, key: SiteImageKey): any {
  const fieldName = `image${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  const image = doc?.[fieldName];
  return image?.asset?._ref ? image : doc?.images?.[key];
}

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
  const image = resolveImage(doc, key);
  if (!image?.asset?._ref) return fallback;

  let builder = urlFor(image).auto('format');
  if (opts.width) builder = builder.width(opts.width);
  if (opts.height) builder = builder.height(opts.height);
  return builder.url();
}

/**
 * Returns the client-managed image for a slot, or `undefined` when none has
 * been uploaded. Use for optional header images on pages that should stay
 * text-only until the editor adds a photo (PageHeader renders its dark header
 * when `image` is undefined).
 */
export async function getOptionalSiteImage(
  key: SiteImageKey,
  opts: { width?: number; height?: number } = {},
): Promise<string | undefined> {
  const doc = await getSiteContentDoc();
  const image = resolveImage(doc, key);
  if (!image?.asset?._ref) return undefined;

  let builder = urlFor(image).auto('format');
  if (opts.width) builder = builder.width(opts.width);
  if (opts.height) builder = builder.height(opts.height);
  return builder.url();
}

export type MenuItem = { href: string; label: string; external: boolean };

/**
 * Client-managed navigation items (Studio: Navigation tab → Menu items), in
 * order, localised. Returns null when the list is empty/unset so the Nav
 * falls back to the built-in menu. Items missing a label or destination are
 * skipped defensively.
 */
export async function getMenuItems(locale: string): Promise<MenuItem[] | null> {
  const doc = await getSiteContentDoc();
  const raw = doc?.menuItems;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const lang = locale === 'en' ? 'en' : 'de';
  const items: MenuItem[] = [];
  for (const item of raw) {
    const label =
      (typeof item?.label?.[lang] === 'string' && item.label[lang].trim()) ||
      (typeof item?.label?.de === 'string' && item.label.de.trim());
    const external = item?.page === 'external';
    const href = external ? item?.externalUrl : item?.page;
    if (!label || typeof href !== 'string' || href.trim() === '') continue;
    if (external && !/^https?:\/\//.test(href)) continue;
    items.push({ href, label, external });
  }
  return items.length > 0 ? items : null;
}

/**
 * The client-managed day-by-day schedule on the Program page (Studio:
 * Program Page tab → Daily schedule), localised and render-ready. Null while
 * the list is empty so the page hides the section entirely.
 */
export async function getProgramDays(locale: string): Promise<ProgramDay[] | null> {
  const doc = await getSiteContentDoc();
  return mapProgramDays(doc?.programDays, locale);
}

/**
 * The Studio-picked accent colour (Design tab) as a hex string, or null when
 * unset — callers skip the theme override and globals.css amber applies.
 */
export async function getAccentColor(): Promise<string | null> {
  const doc = await getSiteContentDoc();
  const hex = doc?.accentColor?.hex;
  return typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex.trim()) ? hex.trim() : null;
}

/** CDN URL for a Sanity file asset ref like `file-<id>-<ext>`. */
export function fileUrlFromRef(ref: string): string | null {
  const match = /^file-([A-Za-z0-9]+)-(\w+)$/.exec(ref);
  if (!match) return null;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${match[1]}.${match[2]}`;
}

export type HeroMedia = {
  type: 'image' | 'video';
  videoUrl: string | null;
  autoplay: boolean;
  imageUrl: string;
  alt: string;
};

/**
 * Homepage hero media: the hero photo (always present — also the video poster
 * and social-share image), plus the background video when the editor has
 * chosen "Video" and uploaded one. Collapses to type 'image' otherwise.
 */
export async function getHeroMedia(opts: {
  fallbackUrl: string;
  fallbackAlt?: string;
  width?: number;
}): Promise<HeroMedia> {
  const doc = await getSiteContentDoc();

  const image = resolveImage(doc, 'hero');
  let imageUrl = opts.fallbackUrl;
  let alt = opts.fallbackAlt ?? '';
  if (image?.asset?._ref) {
    let builder = urlFor(image).auto('format');
    if (opts.width) builder = builder.width(opts.width);
    imageUrl = builder.url();
    if (typeof image.alt === 'string' && image.alt.trim() !== '') alt = image.alt.trim();
  }

  const videoRef: string | undefined = doc?.heroVideo?.asset?._ref;
  const videoUrl =
    doc?.heroMediaType === 'video' && videoRef ? fileUrlFromRef(videoRef) : null;

  return {
    type: videoUrl ? 'video' : 'image',
    videoUrl,
    autoplay: doc?.heroVideoAutoplay !== false,
    imageUrl,
    alt,
  };
}

/**
 * Like getSiteImage, but also returns the alt text co-located with the image
 * in Studio. Falls back to `fallbackAlt` (usually the section's translated alt)
 * when the editor hasn't set one.
 */
export async function getSiteImageData(
  key: SiteImageKey,
  opts: { fallbackUrl: string; fallbackAlt?: string; width?: number; height?: number },
): Promise<{ url: string; alt: string }> {
  const doc = await getSiteContentDoc();
  const image = resolveImage(doc, key);
  const fallbackAlt = opts.fallbackAlt ?? '';
  if (!image?.asset?._ref) return { url: opts.fallbackUrl, alt: fallbackAlt };

  let builder = urlFor(image).auto('format');
  if (opts.width) builder = builder.width(opts.width);
  if (opts.height) builder = builder.height(opts.height);

  const alt = typeof image.alt === 'string' && image.alt.trim() !== '' ? image.alt.trim() : fallbackAlt;
  return { url: builder.url(), alt };
}
