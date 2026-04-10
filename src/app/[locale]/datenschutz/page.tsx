import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';

const meta = {
  de: { title: 'Datenschutz', description: 'Datenschutzerklärung der OETZ TROPHY — Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.' },
  en: { title: 'Privacy Policy', description: 'Privacy policy for OETZ TROPHY — Information on personal data processing in accordance with GDPR.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function DatenschutzPage() {
  const t = await getTranslations('datenschutz');

  const sections = [
    { heading: t('s1Heading'), text: t('s1Text') },
    { heading: t('s2Heading'), text: t('s2Text') },
    { heading: t('s3Heading'), text: t('s3Text') },
    { heading: t('s4Heading'), text: t('s4Text') },
    { heading: t('s5Heading'), text: t('s5Text') },
    { heading: t('s6Heading'), text: t('s6Text') },
    { heading: t('s7Heading'), text: t('s7Text') },
    { heading: t('s8Heading'), text: t('s8Text') },
  ];

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="max-w-3xl mx-auto px-6 md:px-12"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-body-text)' }}
        >
          <p style={{ fontSize: '15px', lineHeight: 1.8, marginBottom: '2rem' }}>
            {t('intro')}
          </p>

          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                {i + 1}. {section.heading}
              </h2>
              <p style={{ fontSize: '15px', lineHeight: 1.8 }}>
                {section.text}
              </p>
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2rem 0' }} />

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '15px', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--color-ink)' }}>Source To Sea GmbH</strong><br />
              Natterer See 1, 6161 Natters<br />
              {t('phone')}: +43 512 54 67 10<br />
              E-Mail:{' '}
              <a
                href="mailto:info@oetz-trophy.com"
                style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
              >
                info@oetz-trophy.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
