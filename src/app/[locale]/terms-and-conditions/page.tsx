import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import FadeIn from '@/components/motion/FadeIn';
import PageHeader from '@/components/PageHeader';

const meta = {
  de: {
    title: 'Teilnahmebedingungen',
    description: 'Teilnahmebedingungen für die Anmeldung zum OETZ TROPHY Rennwochenende 2026.',
  },
  en: {
    title: 'Terms & Conditions',
    description: 'Participant terms for registration to the OETZ TROPHY race weekend 2026.',
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function TermsPage() {
  const t = await getTranslations('terms');

  const sections = [
    { heading: t('eligibilityHeading'), text: t('eligibilityText') },
    { heading: t('rulesHeading'), text: t('rulesText') },
    { heading: t('paymentHeading'), text: t('paymentText') },
    { heading: t('dataHeading'), text: t('dataText') },
  ];

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <FadeIn>
            <p
              className="mb-12"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '17px',
                lineHeight: 1.8,
                color: 'var(--color-body-text)',
              }}
            >
              {t('intro')}
            </p>
          </FadeIn>

          <div className="flex flex-col gap-9">
            {sections.map((section, index) => (
              <FadeIn key={section.heading} delay={index * 0.05}>
                <section
                  className="pt-8"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <h2
                    className="uppercase mb-3"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(26px, 4vw, 38px)',
                      fontWeight: 700,
                      lineHeight: 1,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {section.heading}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      lineHeight: 1.8,
                      color: 'var(--color-body-text)',
                    }}
                  >
                    {section.text}
                  </p>
                </section>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.25}>
            <p
              className="mt-12 p-5"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--color-ink)',
                backgroundColor: 'rgba(245, 158, 11, 0.14)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
              }}
            >
              {t('reviewNote')}
            </p>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
