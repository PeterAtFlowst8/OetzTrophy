import { getTranslations } from 'next-intl/server';
import FadeIn from '@/components/motion/FadeIn';
import CountUp from '@/components/motion/CountUp';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerChildren';

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
        <FadeIn>
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
        </FadeIn>

        <FadeIn delay={0.15}>
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
        </FadeIn>

        {/* Stat strip — desktop */}
        <StaggerContainer className="hidden md:flex" style={{ borderTop: DIVIDER }} stagger={0.12}>
          {stats.map(({ value, label }, i) => (
            <StaggerItem
              key={value}
              className="flex-1 py-8 pr-8"
            >
              <div
                style={{
                  paddingLeft: i === 0 ? '0' : '2rem',
                  borderLeft: i === 0 ? 'none' : DIVIDER,
                }}
              >
                <CountUp
                  value={value}
                  className="uppercase leading-none block"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 4vw, 68px)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    letterSpacing: '-0.01em',
                  }}
                />
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
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Stat strip — mobile */}
        <StaggerContainer className="md:hidden" style={{ borderTop: DIVIDER }} stagger={0.08}>
          {stats.map(({ value, label }) => (
            <StaggerItem key={value}>
              <div
                className="py-5 pl-4"
                style={{
                  borderBottom: DIVIDER,
                  borderLeft: '3px solid var(--color-accent)',
                }}
              >
                <CountUp
                  value={value}
                  className="uppercase leading-none block"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 9vw, 60px)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    letterSpacing: '-0.01em',
                  }}
                />
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
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.3}>
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
        </FadeIn>
      </div>
    </section>
  );
}
