import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import { getOptionalSiteImage } from '@/lib/siteContent';

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
  const headerImage = await getOptionalSiteImage('terms', { width: 2000 });

  const sections = [
    { heading: t('eligibilityHeading'), text: t('eligibilityText') },
    { heading: t('rulesHeading'), text: t('rulesText') },
    { heading: t('paymentHeading'), text: t('paymentText') },
    { heading: t('dataHeading'), text: t('dataText') },
  ];

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} image={headerImage} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div>
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
          </div>

          <div className="flex flex-col gap-9">
            {sections.map((section, index) => (
              <div key={section.heading}>
                <section
                  className="pt-8"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <h2
                    className="uppercase mb-3"
                    style={{
                      fontFamily: 'var(--font-display)',
                      // Floor lowered so long German headings (e.g.
                      // "Teilnahmeberechtigung") fit narrow screens.
                      fontSize: 'clamp(21px, 4vw, 38px)',
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
              </div>
            ))}
          </div>

          <div>
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
          </div>
        </div>
      </section>
    </main>
  );
}
