import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclude the embedded Sanity Studio (/studio) so it isn't locale-prefixed.
  matcher: ['/((?!_next|_vercel|studio|.*\\..*).*)'],
};
