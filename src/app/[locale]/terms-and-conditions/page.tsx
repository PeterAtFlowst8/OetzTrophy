import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import { getOptionalSiteImage, getPageSeo } from '@/lib/siteContent';
import { headingFontSize } from '@/lib/headingFit';
import TextWithLinks from '@/components/TextWithLinks';


type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('terms', locale);
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
        {/* Container so the section headings below can size themselves in cqi
            against this column's real width (max-w-3xl, not the viewport). */}
        <div className="max-w-3xl mx-auto px-6 md:px-12" style={{ containerType: 'inline-size' }}>
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
              <TextWithLinks text={t('intro')} />
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
                      // Full design scale for normal headings; long German
                      // compounds (e.g. "Teilnahmeberechtigung") get a
                      // per-heading cap so they shrink just enough to fit the
                      // column (cqi, container on the max-w-3xl wrapper).
                      fontSize: headingFontSize(section.heading, {
                        floorPx: 26,
                        slopeCqi: 5.7,
                        capPx: 38,
                      }),
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
                    <TextWithLinks text={section.text} />
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
              <TextWithLinks text={t('reviewNote')} />
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
