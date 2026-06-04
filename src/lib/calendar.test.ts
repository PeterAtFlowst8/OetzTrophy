import { describe, expect, it } from 'vitest';
import {
  buildFestivalIcs,
  buildGoogleCalendarUrl,
  formatFestivalDateRange,
} from './calendar';

const settings = {
  festivalDate: '2026-09-17T09:00:00Z',
  festivalEndDate: '2026-09-20T18:00:00Z',
};

describe('calendar helpers', () => {
  it('builds an iCalendar file with the festival dates', () => {
    const ics = buildFestivalIcs(settings, 'en');

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:OETZ TROPHY Race Weekend 2026');
    expect(ics).toContain('DTSTART:20260917T090000Z');
    expect(ics).toContain('DTEND:20260920T180000Z');
  });

  it('builds a Google Calendar URL with the same date range', () => {
    const url = buildGoogleCalendarUrl({
      startDate: settings.festivalDate,
      endDate: settings.festivalEndDate,
      locale: 'en',
    });

    expect(url).toContain('calendar.google.com/calendar/render');
    expect(url).toContain('dates=20260917T090000Z%2F20260920T180000Z');
  });

  it('formats localized festival date ranges', () => {
    expect(formatFestivalDateRange(settings.festivalDate, settings.festivalEndDate, 'en')).toBe(
      '17–20 September 2026',
    );
    expect(formatFestivalDateRange(settings.festivalDate, settings.festivalEndDate, 'de')).toBe(
      '17.–20. September 2026',
    );
  });
});
