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
};

export default withNextIntl(nextConfig);
