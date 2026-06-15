import { sanityClient } from './sanity';

export type SiteSettings = {
  festivalDate: string | null;
  festivalEndDate: string | null;
  registrationOpensAt: string | null;
  registrationFeeEur: number | null;
  maxMen: number | null;
  maxWomen: number | null;
};

const settingsQuery = `*[_type == "siteSettings"][0] {
  festivalDate,
  festivalEndDate,
  registrationOpensAt,
  registrationFeeEur,
  maxMen,
  maxWomen,
}`;

// Fallback values if Sanity is empty
const defaults: SiteSettings = {
  festivalDate: '2026-09-17T09:00:00Z',
  festivalEndDate: '2026-09-20T18:00:00Z',
  registrationOpensAt: '2026-06-17T18:00:00+02:00',
  registrationFeeEur: 135,
  maxMen: 130,
  maxWomen: 50,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await sanityClient.fetch(settingsQuery);
    // Merge so blank Sanity fields fall back to defaults rather than null.
    return {
      festivalDate: settings?.festivalDate ?? defaults.festivalDate,
      festivalEndDate: settings?.festivalEndDate ?? defaults.festivalEndDate,
      registrationOpensAt: settings?.registrationOpensAt ?? defaults.registrationOpensAt,
      registrationFeeEur: settings?.registrationFeeEur ?? defaults.registrationFeeEur,
      maxMen: settings?.maxMen ?? defaults.maxMen,
      maxWomen: settings?.maxWomen ?? defaults.maxWomen,
    };
  } catch {
    return defaults;
  }
}
