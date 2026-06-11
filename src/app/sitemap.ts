import type { MetadataRoute } from 'next';
import { SITE_URL as BASE_URL } from '@/lib/site';

const staticPages = [
  '',
  '/oetz-trophy',
  '/kayak-cross',
  '/kajakfestival',
  '/programm',
  '/news',
  '/kontakt',
  '/registration',
  '/impressum',
  '/terms-and-conditions',
  '/datenschutz',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    // German
    entries.push({
      url: `${BASE_URL}/de${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          de: `${BASE_URL}/de${page}`,
          en: `${BASE_URL}/en${page}`,
        },
      },
    });
  }

  return entries;
}
