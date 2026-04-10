import { sanityClient } from './sanity';

export type SiteSettings = {
  festivalDate: string | null;
  raceDate: string | null;
  festivalEndDate: string | null;
  registrationOpen: boolean;
  registrationDeadline: string | null;
  registrationFee: number | null;
};

const settingsQuery = `*[_type == "siteSettings"][0] {
  festivalDate,
  raceDate,
  festivalEndDate,
  registrationOpen,
  registrationDeadline,
  registrationFee
}`;

// Fallback values if Sanity is empty
const defaults: SiteSettings = {
  festivalDate: '2026-09-17T09:00:00Z',
  raceDate: '2026-09-19T09:00:00Z',
  festivalEndDate: '2026-09-20T18:00:00Z',
  registrationOpen: false,
  registrationDeadline: null,
  registrationFee: 50,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanityClient.fetch(settingsQuery);
  return { ...defaults, ...settings };
}
