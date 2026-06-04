import { buildFestivalIcs } from '@/lib/calendar';
import { getSiteSettings } from '@/lib/settings';

export async function GET(request: Request) {
  const settings = await getSiteSettings();
  const locale = new URL(request.url).searchParams.get('locale') || 'en';
  const calendar = buildFestivalIcs(settings, locale);

  if (!calendar) {
    return new Response('Festival dates are not configured.', { status: 404 });
  }

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="oetz-trophy-race-weekend-2026.ics"',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
