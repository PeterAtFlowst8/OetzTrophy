import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import { getOptionalSiteImage, getPageSeo } from '@/lib/siteContent';
import { headingFontSize } from '@/lib/headingFit';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('program', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function ProgrammPage() {
  const t = await getTranslations('programm');
  const headerImage = await getOptionalSiteImage('program', { width: 2000 });

  return (
    <main>
      <PageHeader label={t('label')} title={t('title')} image={headerImage} />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12" style={{ containerType: 'inline-size' }}>
          <p
            className="mb-16"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '18px',
              lineHeight: 1.8,
              color: 'var(--color-body-text)',
            }}
          >
            {t('intro')}
          </p>

          {/* Important places — the Google Map embed goes here. */}
          <h2
            className="uppercase mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: headingFontSize(t('mapHeading'), {
                floorPx: 26,
                slopeCqi: 5.7,
                capPx: 38,
              }),
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--color-ink)',
            }}
          >
            {t('mapHeading')}
          </h2>

          {/*
            TODO(map): replace this placeholder with the Google Maps embed of
            important places (parking, race start, festival area, …), e.g. an
            <iframe> from Google My Maps, sized to fill this box.
          */}
          <div
            className="flex items-center justify-center px-6 text-center"
            style={{
              minHeight: '320px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--color-muted)',
            }}
          >
            {t('mapComingSoon')}
          </div>
        </div>
      </section>
    </main>
  );
}
