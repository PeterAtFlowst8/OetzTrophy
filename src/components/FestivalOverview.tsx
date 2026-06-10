import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import CalendarActions from '@/components/CalendarActions';
import { getSiteImageData } from '@/lib/siteContent';
import TextWithLinks from '@/components/TextWithLinks';

const TOPO_PATTERN = `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 200 Q100 160 200 200 T400 200' fill='none' stroke='%23F59E0B' stroke-width='0.5' opacity='0.08'/%3E%3Cpath d='M0 220 Q100 180 200 220 T400 220' fill='none' stroke='%23F59E0B' stroke-width='0.5' opacity='0.06'/%3E%3Cpath d='M0 180 Q100 140 200 180 T400 180' fill='none' stroke='%23F59E0B' stroke-width='0.5' opacity='0.05'/%3E%3Cpath d='M0 240 Q100 200 200 240 T400 240' fill='none' stroke='%23F59E0B' stroke-width='0.5' opacity='0.04'/%3E%3Cpath d='M0 160 Q100 120 200 160 T400 160' fill='none' stroke='%23F59E0B' stroke-width='0.5' opacity='0.03'/%3E%3C/svg%3E")`;

const dayDates = ['17', '18', '19', '20'];

type Props = {
  festivalDate: string | null;
  festivalEndDate: string | null;
};

export default async function FestivalOverview({ festivalDate, festivalEndDate }: Props) {
  const t = await getTranslations('festivalOverview');
  const sectionImage = await getSiteImageData('festivalOverview', {
    fallbackUrl: '/images/event-festival-2.jpg',
    fallbackAlt: t('imageAlt'),
    width: 1000,
  });

  const days = [0, 1, 2, 3].map((i) => ({
    label: t(`day${i}Label` as Parameters<typeof t>[0]),
    desc: t(`day${i}` as Parameters<typeof t>[0]),
    date: dayDates[i],
  }));

  return (
    <section className="relative overflow-hidden overflow-x-clip" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Topographic river-line texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: TOPO_PATTERN,
          backgroundSize: '400px 400px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-36">

        {/* Headline - full width above everything */}
        <div>
          <p
            className="uppercase mb-4"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'var(--color-accent-text)',
            }}
          >
            {t('label')}
          </p>
        </div>

        <div>
          <h2
            className="uppercase mb-12 md:mb-16"
            style={{
              fontFamily: 'var(--font-display)',
              // Floor lowered from 48px so long client-entered words (e.g.
              // "Kajakfestival") shrink to fit narrow screens instead of clipping.
              fontSize: 'clamp(36px, 8vw, 96px)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              lineHeight: 0.88,
              letterSpacing: '-0.02em',
            }}
          >
            {t('headline1')}<br />{t('headline2')}
          </h2>
        </div>

        {/* Photo + body text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-16 md:mb-24 items-start">

          <div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={sectionImage.url}
                alt={sectionImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                }}
              />
            </div>
          </div>

          <div>
            <div className="max-w-md">
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: 'var(--color-body-text)',
                }}
              >
                <TextWithLinks text={t('body')} />
              </p>
              <CalendarActions festivalDate={festivalDate} festivalEndDate={festivalEndDate} />
            </div>
          </div>

        </div>

        {/* Schedule grid — styled as event passes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {days.map((day) => (
            <div key={day.label}>
              <div
                className="relative p-5 md:p-6 h-full group transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--color-ink)',
                  color: 'white',
                }}
              >
                {/* Day number watermark */}
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '48px',
                    color: 'rgba(255,255,255,0.06)',
                    lineHeight: 1,
                  }}
                >
                  {day.date}
                </span>

                {/* Amber top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300 group-hover:h-[4px]"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />

                <p
                  className="uppercase mb-2 relative"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1,
                  }}
                >
                  {day.label}
                </p>
                <p
                  className="relative"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.72)',
                  }}
                >
                  {day.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
