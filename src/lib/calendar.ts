import type { SiteSettings } from './settings';
import { SITE_URL } from './site';

const TIME_ZONE = 'Europe/Vienna';

type Locale = 'de' | 'en';

type CalendarEventInput = {
  startDate: string;
  endDate: string;
  locale?: string;
};

type CalendarCopy = {
  summary: string;
  description: string;
  location: string;
};

function normalizeLocale(locale?: string): Locale {
  return locale === 'de' ? 'de' : 'en';
}

function calendarCopy(locale?: string): CalendarCopy {
  return normalizeLocale(locale) === 'de'
    ? {
        summary: 'OETZ TROPHY Rennwochenende 2026',
        description:
          'Ötztaler Kajakfestival mit Qualifikation, Boater X und OETZ TROPHY auf der Ötztaler Ache.',
        location: 'Oetz, Tirol, Österreich',
      }
    : {
        summary: 'OETZ TROPHY Race Weekend 2026',
        description:
          'Ötztal Kayak Festival with qualifying heats, Boater X and the OETZ TROPHY on the Ötztaler Ache.',
        location: 'Oetz, Tyrol, Austria',
      };
}

function toUtcStamp(dateString: string): string {
  return new Date(dateString)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function eventDates(settings: Pick<SiteSettings, 'festivalDate' | 'festivalEndDate'>) {
  if (!settings.festivalDate || !settings.festivalEndDate) return null;
  return {
    startDate: settings.festivalDate,
    endDate: settings.festivalEndDate,
  };
}

export function buildFestivalIcs(
  settings: Pick<SiteSettings, 'festivalDate' | 'festivalEndDate'>,
  locale?: string,
): string | null {
  const dates = eventDates(settings);
  if (!dates) return null;

  const copy = calendarCopy(locale);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OETZ TROPHY//Festival Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:oetz-trophy-race-weekend-2026@oetz-trophy.com',
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(dates.startDate)}`,
    `DTEND:${toUtcStamp(dates.endDate)}`,
    `SUMMARY:${escapeIcsText(copy.summary)}`,
    `DESCRIPTION:${escapeIcsText(`${copy.description}\n${SITE_URL}`)}`,
    `LOCATION:${escapeIcsText(copy.location)}`,
    `URL:${SITE_URL}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.join('\r\n')}\r\n`;
}

export function buildGoogleCalendarUrl({
  startDate,
  endDate,
  locale,
}: CalendarEventInput): string {
  const copy = calendarCopy(locale);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: copy.summary,
    dates: `${toUtcStamp(startDate)}/${toUtcStamp(endDate)}`,
    details: `${copy.description}\n${SITE_URL}`,
    location: copy.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getDatePart(date: Date, locale: string, part: Intl.DateTimeFormatPartTypes) {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });
  return formatter.formatToParts(date).find((item) => item.type === part)?.value || '';
}

export function formatFestivalDateRange(
  startDate: string,
  endDate: string,
  locale?: string,
): string {
  const normalizedLocale = normalizeLocale(locale);
  const intlLocale = normalizedLocale === 'de' ? 'de-AT' : 'en-GB';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startDay = getDatePart(start, intlLocale, 'day');
  const endDay = getDatePart(end, intlLocale, 'day');
  const startMonth = getDatePart(start, intlLocale, 'month');
  const endMonth = getDatePart(end, intlLocale, 'month');
  const startYear = getDatePart(start, intlLocale, 'year');
  const endYear = getDatePart(end, intlLocale, 'year');

  if (startMonth === endMonth && startYear === endYear) {
    return normalizedLocale === 'de'
      ? `${startDay}.-${endDay}. ${endMonth} ${endYear}`
      : `${startDay}-${endDay} ${endMonth} ${endYear}`;
  }

  const formatter = new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
