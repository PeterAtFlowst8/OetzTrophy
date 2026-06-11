import type { ProgramDay } from '@/lib/programSchedule';
import { headingFontSize } from '@/lib/headingFit';
import TextWithLinks from '@/components/TextWithLinks';

type Props = {
  heading: string;
  days: ProgramDay[];
};

/**
 * The day-by-day visitor schedule on the Program page, one stacked block per
 * festival day. Data is the client-managed "Daily schedule" list in Studio
 * (Program Page tab); the page renders nothing while that list is empty.
 */
export default function ProgramSchedule({ heading, days }: Props) {
  return (
    <div className="mb-16">
      <h2
        className="uppercase mb-6"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: headingFontSize(heading, {
            floorPx: 26,
            slopeCqi: 5.7,
            capPx: 38,
          }),
          fontWeight: 700,
          lineHeight: 1,
          color: 'var(--color-ink)',
        }}
      >
        {heading}
      </h2>

      <div className="flex flex-col gap-6">
        {days.map((day, dayIndex) => (
          <section
            key={dayIndex}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderTop: '3px solid var(--color-accent)',
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 px-5 pt-4 pb-2 md:px-6">
              <h3
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                }}
              >
                {day.heading}
              </h3>
              {day.dateLabel && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--color-muted)',
                  }}
                >
                  {day.dateLabel}
                </span>
              )}
            </div>

            <ul className="px-5 pb-2 md:px-6">
              {day.entries.map((entry, entryIndex) => (
                <li
                  key={entryIndex}
                  className="grid gap-x-5 py-3"
                  style={{
                    gridTemplateColumns: 'minmax(6.5rem, auto) 1fr',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {entry.time}
                  </span>
                  <span>
                    <span
                      className="block"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--color-ink)',
                      }}
                    >
                      {entry.title}
                    </span>
                    {entry.description && (
                      <span
                        className="block mt-1"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          color: 'var(--color-body-text)',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        <TextWithLinks text={entry.description} />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
