import { getTranslations } from 'next-intl/server';

export default async function FestivalOverview() {
  const t = await getTranslations('festivalOverview');

  const days = [0, 1, 2, 3].map((i) => ({
    label: t(`day${i}Label` as Parameters<typeof t>[0]),
    desc: t(`day${i}` as Parameters<typeof t>[0]),
  }));

  return (
    <section className="py-20 md:py-32" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Label */}
        <p
          className="uppercase mb-6"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'var(--color-accent)',
          }}
        >
          {t('label')}
        </p>

        {/* Headline */}
        <h2
          className="uppercase mb-10 md:mb-16"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(52px, 9vw, 120px)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
          }}
        >
          {t('headline1')}<br />{t('headline2')}
        </h2>

        {/* Schedule strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-12 md:mb-16" style={{ backgroundColor: 'var(--color-border)' }}>
          {days.map((day) => (
            <div
              key={day.label}
              className="p-5 md:p-6"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <p
                className="uppercase mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  lineHeight: 1,
                }}
              >
                {day.label}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  color: 'var(--color-body-text)',
                }}
              >
                {day.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Body */}
        <p
          className="max-w-2xl"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '17px',
            lineHeight: 1.8,
            color: 'var(--color-body-text)',
          }}
        >
          {t('body')}
        </p>

      </div>
    </section>
  );
}
