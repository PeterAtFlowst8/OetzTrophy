import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PageHeader from '@/components/PageHeader';
import { getOptionalSiteImage, getPageSeo, getProgramDays } from '@/lib/siteContent';
import { headingFontSize } from '@/lib/headingFit';
import TextWithLinks from '@/components/TextWithLinks';
import ProgramSchedule from '@/components/ProgramSchedule';
import MapConsent from '@/components/MapConsent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('program', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function ProgrammPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('programm');
  const headerImage = await getOptionalSiteImage('program', { width: 2000 });
  const scheduleDays = await getProgramDays(locale);

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
            <TextWithLinks text={t('intro')} />
          </p>

          {scheduleDays && (
            <ProgramSchedule heading={t('scheduleHeading')} days={scheduleDays} />
          )}

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

          {/* Google My Maps embed behind a GDPR consent gate (loads only on click). */}
          <MapConsent
            src="https://www.google.com/maps/d/u/0/embed?mid=1yefxj93tueT9LP7C1nYCQzcpik1AHjO6&ehbc=2E312F"
            title={t('mapHeading')}
            notice={t('mapConsent')}
            loadLabel={t('mapLoad')}
          />
        </div>
      </section>
    </main>
  );
}
