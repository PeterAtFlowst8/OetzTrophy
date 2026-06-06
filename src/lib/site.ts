/**
 * Canonical public base URL for the site.
 *
 * Single source of truth for absolute URLs (SEO canonical/OG tags, sitemap,
 * calendar .ics links, JSON-LD, and Stripe redirect URLs). Override per
 * environment with NEXT_PUBLIC_SITE_URL (or the legacy NEXT_PUBLIC_URL) — e.g.
 * a Vercel preview deployment — otherwise it defaults to the production domain.
 *
 * No trailing slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_URL ||
  'https://oetz-trophy.com'
).replace(/\/$/, '');
