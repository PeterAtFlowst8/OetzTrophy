import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/PageHeader';
import { richTextComponents } from '@/components/richTextComponents';
import { getSiteImage, getPageSeo } from '@/lib/siteContent';
import CalendarActions from '@/components/CalendarActions';
import { getEventForPage, localizedField } from '@/lib/events';
import { getSiteSettings } from '@/lib/settings';
import TextWithLinks from '@/components/TextWithLinks';


type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = await getPageSeo('kajakfestival', locale);
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function KajakfestivalPage() {
  const locale = await getLocale();
  const [event, settings] = await Promise.all([
    getEventForPage('event-kajakfestival', 'kajakfestival'),
    getSiteSettings(),
  ]);
  if (!event) notFound();

  const t = await getTranslations('kajakfestival');
  const title = localizedField(event.title, locale);
  const body = localizedField(event.body, locale);

  const schedule = [
    { day: t('day1Day'), date: t('day1Date'), desc: t('day1Desc') },
    { day: t('day2Day'), date: t('day2Date'), desc: t('day2Desc') },
    { day: t('day3Day'), date: t('day3Date'), desc: t('day3Desc') },
    { day: t('day4Day'), date: t('day4Date'), desc: t('day4Desc') },
  ];

  const headerImage = await getSiteImage('kajakfestival', '/images/page-kajakfestival.jpg', { width: 2000 });

  return (
    <main>
      <PageHeader
        label="Kajakfestival"
        title={title}
        image={headerImage}
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <div>
            <div className="max-w-3xl mb-16 md:mb-20">
              {body && body.length > 0 ? (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  <PortableText value={body} components={richTextComponents} />
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  {localizedField(event.excerpt, locale)}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-16 md:mb-20">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <h2 className="uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                  {t('scheduleHeading')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.map((item) => (
                  <div key={item.day} className="p-5 md:p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <p className="uppercase mb-1" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--color-accent)' }}>
                      {item.day}
                    </p>
                    <p className="uppercase mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {item.date}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, color: 'var(--color-body-text)' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <CalendarActions festivalDate={settings.festivalDate} festivalEndDate={settings.festivalEndDate} />
            </div>
          </div>

          <div>
            <div className="max-w-3xl">
              <h2 className="uppercase mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                {t('locationHeading')}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                <TextWithLinks text={t('locationText')} />
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
