import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'oetz-trophy.com' },
      { protocol: 'https', hostname: 'www.oetz-trophy.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  // The race page moved from /boater-x to /kayak-cross (the name Boater X may
  // no longer be used). Old links and search results keep working.
  async redirects() {
    return [
      { source: '/de/boater-x', destination: '/de/kayak-cross', permanent: true },
      { source: '/en/boater-x', destination: '/en/kayak-cross', permanent: true },
      { source: '/boater-x', destination: '/de/kayak-cross', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
