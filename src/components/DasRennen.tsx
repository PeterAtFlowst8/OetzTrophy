import { getTranslations } from 'next-intl/server';

const DIVIDER = '1px solid rgba(255,255,255,0.1)';

export default async function DasRennen() {
  const t = await getTranslations('dasRennen');

  const stats = [
    { value: t('stat0Value'), label: t('stat0Label') },
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ];

  return (
    <section
      style={{
        backgroundColor: 'var(--color-ink)',
        position: 'relative',
        overflow: 'hidden',
        clipPath: 'polygon(0 40px, 100% 0, 100% 100%, 0 100%)',
        marginTop: '-40px',
        zIndex: 1,
      }}
    >
      {/* Decorative watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '3%',
          top: '45%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(220px, 28vw, 400px)',
          color: 'rgba(255,255,255,0.035)',
          lineHeight: 1,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.05em',
        }}
      >
        V
      </div>

      <div
        className="max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-28"
        style={{ paddingTop: 'calc(4rem + 40px)' }}
      >
        {/* Section label */}
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

        {/* Manifesto pullquote */}
        <h2
          className="uppercase mb-14 md:mb-20"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(56px, 9.5vw, 128px)',
            fontWeight: 700,
            color: '#FAFAF7',
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
          }}
        >
          {t('headline1')}<br />{t('headline2')}
        </h2>

        {/* Stat strip — desktop */}
        <div className="hidden md:flex" style={{ borderTop: DIVIDER }}>
          {stats.map(({ value, label }, i) => (
            <div
              key={value}
              className="flex-1 py-8 pr-8"
              style={{
                paddingLeft: i === 0 ? '0' : '2rem',
                borderLeft: i === 0 ? 'none' : DIVIDER,
              }}
            >
              <p
                className="uppercase leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 68px)',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  letterSpacing: '-0.01em',
                }}
              >
                {value}
              </p>
              <p
                className="mt-3 uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Stat strip — mobile */}
        <div className="md:hidden" style={{ borderTop: DIVIDER }}>
          {stats.map(({ value, label }) => (
            <div
              key={value}
              className="py-5 pl-4"
              style={{
                borderBottom: DIVIDER,
                borderLeft: '3px solid var(--color-accent)',
              }}
            >
              <p
                className="uppercase leading-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 9vw, 60px)',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  letterSpacing: '-0.01em',
                }}
              >
                {value}
              </p>
              <p
                className="mt-2 uppercase"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Editorial paragraph */}
        <p
          className="mt-12 max-w-xl"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          {t('body')}
        </p>
      </div>
    </section>
  );
}
