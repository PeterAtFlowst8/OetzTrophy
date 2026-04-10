import type { MetadataRoute } from 'next';

const BASE_URL = 'https://oetz-trophy.vercel.app';

const staticPages = [
  '',
  '/oetz-trophy',
  '/boater-x',
  '/kajakfestival',
  '/news',
  '/kontakt',
  '/registration',
  '/impressum',
  '/datenschutz',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    // German (default, no prefix)
    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          de: `${BASE_URL}${page}`,
          en: `${BASE_URL}/en${page}`,
        },
      },
    });
  }

  return entries;
}
