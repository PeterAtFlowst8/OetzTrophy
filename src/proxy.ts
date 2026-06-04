import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclude API routes and embedded Sanity Studio so they are not locale-prefixed.
  matcher: ['/((?!api|_next|_vercel|studio|.*\\..*).*)'],
};
