import { sanityClient } from './sanity';

export type SiteSettings = {
  festivalDate: string | null;
  festivalEndDate: string | null;
};

const settingsQuery = `*[_type == "siteSettings"][0] {
  festivalDate,
  festivalEndDate
}`;

// Fallback values if Sanity is empty
const defaults: SiteSettings = {
  festivalDate: '2026-09-17T09:00:00Z',
  festivalEndDate: '2026-09-20T18:00:00Z',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanityClient.fetch(settingsQuery);
  return { ...defaults, ...settings };
}
