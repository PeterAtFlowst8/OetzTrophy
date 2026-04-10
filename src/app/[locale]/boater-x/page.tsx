import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import Reveal from '@/components/Reveal';

export default async function BoaterXPage() {
  const t = await getTranslations('boaterX');

  const rules = [
    t('rule1'),
    t('rule2'),
    t('rule3'),
    t('rule4'),
  ];

  return (
    <main>
      <PageHeader
        label={t('label')}
        title={t('title')}
        image="/images/event-boaterx.jpg"
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <Reveal>
            <div className="max-w-3xl mb-16 md:mb-20">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                {t('intro')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-20">
              {[
                { label: t('dateLabel'), value: t('dateValue') },
                { label: t('formatLabel'), value: t('formatValue') },
                { label: t('entryLabel'), value: t('entryValue') },
              ].map((item) => (
                <div key={item.label} style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '1.25rem' }}>
                  <p className="uppercase mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-muted)' }}>
                    {item.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.1, textTransform: 'uppercase' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Registration notice */}
            <div
              className="inline-flex items-center gap-3 px-5 py-3 mb-16 md:mb-20"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#111',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ fontSize: '16px' }}>↗</span>
              {t('regNote')}
            </div>
          </Reveal>

          <Reveal delay={50}>
            <div className="max-w-3xl mb-16 md:mb-20">
              <h2 className="uppercase mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                {t('formatHeading')}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                {t('formatText')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={50}>
            <div className="max-w-3xl">
              <h2 className="uppercase mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                {t('rulesHeading')}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rules.map((rule, i) => (
                  <li key={i} className="flex gap-4 items-start" style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--color-body-text)', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-accent)', minWidth: '2ch' }}>
                      0{i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

        </div>
      </section>
    </main>
  );
}
