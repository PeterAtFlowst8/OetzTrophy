import { sanityClient, urlFor } from './sanity';

export type Sponsor = {
  _id: string;
  name: string;
  logo?: { asset: { _ref: string } };
  logoUrl?: string;
  url: string;
  tier?: 'gold' | 'silver' | 'bronze';
  order: number;
  isActive?: boolean;
};

export type SponsorLink = {
  name: string;
  logoUrl: string;
  href: string;
  tier: 'gold' | 'silver' | 'bronze';
};

// Fallback logo URLs (used until logos are uploaded to Sanity)
const fallbackLogos: Record<string, string> = {
  'Ötztal Tourismus': '/images/sponsor-oetztal.jpg',
  'Source To Sea': '/images/sponsor-s2s.jpg',
  'Kayak Session': '/images/sponsor-ks.png',
};

const sponsorsQuery = `*[_type == "sponsor" && (!defined(isActive) || isActive == true)] | order(coalesce(order, 9999) asc, name asc) {
  _id, name, logo, url, tier, order, isActive
}`;

export async function getSponsors(): Promise<SponsorLink[]> {
  const sponsors: Sponsor[] = await sanityClient.fetch(sponsorsQuery);

  return sponsors.map((s) => ({
    name: s.name,
    logoUrl: s.logo?.asset?._ref
      ? urlFor(s.logo).width(360).height(180).fit('max').url()
      : fallbackLogos[s.name] || '',
    href: s.url?.trim() || '',
    tier: s.tier || 'silver',
  }));
}
