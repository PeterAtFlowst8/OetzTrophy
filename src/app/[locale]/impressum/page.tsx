import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';

const meta = {
  de: { title: 'Impressum', description: 'Impressum der OETZ TROPHY — Source To Sea GmbH, Natterer See 1, 6161 Natters, Tirol.' },
  en: { title: 'Legal Notice', description: 'Legal notice for OETZ TROPHY — Source To Sea GmbH, Natterer See 1, 6161 Natters, Tyrol, Austria.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export default async function ImpressumPage() {
  const t = await getTranslations('impressum');

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="max-w-3xl mx-auto px-6 md:px-12 prose-custom"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--color-body-text)' }}
        >
          <p style={{ fontSize: '17px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            <strong style={{ color: 'var(--color-ink)' }}>Source To Sea GmbH</strong><br />
            Natterer See 1<br />
            6161 Natters<br />
            Tirol / {t('country')}
          </p>

          <p style={{ fontSize: '15px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            <strong style={{ color: 'var(--color-ink)' }}>{t('phone')}:</strong> +43 (0)512 546710<br />
            <strong style={{ color: 'var(--color-ink)' }}>E-Mail:</strong>{' '}
            <a
              href="mailto:info@oetz-trophy.com"
              style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
            >
              info@oetz-trophy.com
            </a>
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2rem 0' }} />

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--color-ink)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
            }}
          >
            {t('liabilityHeading')}
          </h2>
          <p style={{ fontSize: '15px', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            {t('liabilityText')}
          </p>
        </div>
      </section>
    </main>
  );
}
