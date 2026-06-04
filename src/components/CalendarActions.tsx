import { getLocale, getTranslations } from 'next-intl/server';
import {
  buildGoogleCalendarUrl,
  formatFestivalDateRange,
} from '@/lib/calendar';

type Props = {
  festivalDate: string | null;
  festivalEndDate: string | null;
};

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 2v4" />
      <path d="M17 2v4" />
      <path d="M3.5 9h17" />
      <rect x="3.5" y="4" width="17" height="17" rx="2" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export default async function CalendarActions({ festivalDate, festivalEndDate }: Props) {
  const locale = await getLocale();
  const t = await getTranslations('calendar');

  if (!festivalDate || !festivalEndDate) return null;

  const range = formatFestivalDateRange(festivalDate, festivalEndDate, locale);
  const googleUrl = buildGoogleCalendarUrl({
    startDate: festivalDate,
    endDate: festivalEndDate,
    locale,
  });
  const calendarHref = `/api/calendar/festival.ics?locale=${locale}`;

  return (
    <div
      className="mt-8 border-t pt-6"
      style={{ borderColor: 'var(--color-border)' }}
      aria-label={t('label')}
    >
      <p
        className="uppercase mb-4"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '0.18em',
          color: 'var(--color-muted)',
        }}
      >
        {t('eyebrow')}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={calendarHref}
          download="oetz-trophy-race-weekend-2026.ics"
          className="inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 uppercase transition-colors duration-200 hover:bg-[var(--color-accent-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-display)',
            fontSize: '19px',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <CalendarIcon />
          {t('download')}
        </a>

        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-3 uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-display)',
            fontSize: '19px',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {t('google')}
          <ExternalIcon />
        </a>
      </div>

      <p
        className="mt-3"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--color-muted)',
        }}
      >
        {t('hint', { range })}
      </p>
    </div>
  );
}
