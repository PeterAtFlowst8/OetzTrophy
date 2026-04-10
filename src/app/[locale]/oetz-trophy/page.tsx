import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';

const meta = {
  de: { title: 'Oetz Trophy — Das härteste Kajakrennen der Alpen 2026', description: 'Die OETZ TROPHY auf der Ötztaler Ache: Wildwasser V, nur auf Einladung. Die Rennstrecke fordert Erfahrung, Technik und Mut. 19. September 2026 in Oetz, Tirol.' },
  en: { title: 'Oetz Trophy — The Hardest Kayak Race in the Alps 2026', description: 'The OETZ TROPHY on the Ötztaler Ache: class V whitewater, invite only. The course demands experience, technique and courage. 19 September 2026 in Oetz, Tyrol.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function OetzTrophyPage() {
  const t = await getTranslations('oetzTrophy');

  const rules = [
    t('rule1'),
    t('rule2'),
    t('rule3'),
    t('rule4'),
    t('rule5'),
  ];

  return (
    <main>
      <PageHeader
        label={t('label')}
        title={t('title')}
        image="/images/hero.jpg"
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <FadeIn>
            <div className="max-w-3xl mb-16 md:mb-20">
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '18px',
                  lineHeight: 1.8,
                  color: 'var(--color-body-text)',
                }}
              >
                {t('intro')}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-16 md:mb-20">
              {[
                { label: t('dateLabel'), value: t('dateValue') },
                { label: t('formatLabel'), value: t('formatValue') },
                { label: t('entryLabel'), value: t('entryValue') },
              ].map((item) => (
                <div key={item.label} style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '1.25rem' }}>
                  <p
                    className="uppercase mb-2"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(22px, 4vw, 28px)',
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      lineHeight: 1.1,
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="max-w-3xl mb-16 md:mb-20">
              <h2
                className="uppercase mb-6"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  lineHeight: 0.95,
                }}
              >
                {t('courseHeading')}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: 'var(--color-body-text)',
                }}
              >
                {t('courseText')}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="max-w-3xl">
              <h2
                className="uppercase mb-6"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  lineHeight: 0.95,
                }}
              >
                {t('rulesHeading')}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-4 items-start"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: 'var(--color-body-text)',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '20px',
                        color: 'var(--color-accent)',
                        minWidth: '2ch',
                      }}
                    >
                      0{i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

        </div>
      </section>
    </main>
  );
}
