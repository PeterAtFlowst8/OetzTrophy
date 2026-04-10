import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import { getEventBySlug, localizedField } from '@/lib/events';

const meta = {
  de: { title: 'Kajakfestival — 4 Tage Wildwasser im Ötztal 2026', description: 'Das Ötztaler Kajakfestival: 4 Tage Wildwasser, Rennen, Testboote, Filmvorführungen und Live-Musik. Die europäische Paddel-Community trifft sich in Oetz, Tirol.' },
  en: { title: 'Kayak Festival — 4 Days of Whitewater in Ötztal 2026', description: 'The Ötztal Kayak Festival: 4 days of whitewater, racing, demo boats, film screenings and live music. Europe\'s paddling community gathers in Oetz, Tyrol, Austria.' },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = meta[(locale === 'en' ? 'en' : 'de') as keyof typeof meta];
  return { title: m.title, description: m.description };
}

export const revalidate = 60;

export default async function KajakfestivalPage() {
  const locale = await getLocale();
  const event = await getEventBySlug('kajakfestival');
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

  return (
    <main>
      <PageHeader
        label="Kajakfestival"
        title={title}
        image="https://oetz-trophy.com/wp-content/uploads/2023/07/OETZ-TROPHY-Oetztal-Kajakfestival-header.jpg"
      />

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          <FadeIn>
            <div className="max-w-3xl mb-16 md:mb-20">
              {body && body.length > 0 ? (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  <PortableText value={body} />
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                  {localizedField(event.excerpt, locale)}
                </p>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mb-16 md:mb-20">
              <h2 className="uppercase mb-8" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                {t('scheduleHeading')}
              </h2>
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
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="max-w-3xl">
              <h2 className="uppercase mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 0.95 }}>
                {t('locationHeading')}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', lineHeight: 1.8, color: 'var(--color-body-text)' }}>
                {t('locationText')}
              </p>
            </div>
          </FadeIn>

        </div>
      </section>
    </main>
  );
}
