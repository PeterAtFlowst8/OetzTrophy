import { sanityClient, urlFor } from './sanity';

export type Sponsor = {
  _id: string;
  name: string;
  logo?: { asset: { _ref: string } };
  logoUrl?: string;
  url: string;
  tier: string;
  order: number;
};

// Fallback logo URLs (used until logos are uploaded to Sanity)
const fallbackLogos: Record<string, string> = {
  'Ötztal Tourismus': '/images/sponsor-oetztal.jpg',
  'Source To Sea': '/images/sponsor-s2s.jpg',
  'Kayak Session': '/images/sponsor-ks.png',
};

const sponsorsQuery = `*[_type == "sponsor"] | order(order asc) {
  _id, name, logo, url, tier, order
}`;

export async function getSponsors(): Promise<Array<{ name: string; logoUrl: string; href: string }>> {
  const sponsors: Sponsor[] = await sanityClient.fetch(sponsorsQuery);

  return sponsors.map((s) => ({
    name: s.name,
    logoUrl: s.logo?.asset?._ref
      ? urlFor(s.logo).width(280).height(140).url()
      : fallbackLogos[s.name] || '',
    href: s.url || '#',
  }));
}
